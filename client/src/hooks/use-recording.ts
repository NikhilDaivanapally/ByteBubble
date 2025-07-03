import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { socket } from "../socket";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import {
  addDirectMessage,
  addGroupMessage,
} from "../store/slices/conversation";
import { direct, group } from "../utils/conversation-types";
import { ObjectId } from "bson";
import { getAudioMetadata } from "../utils/get-audio-metadata";
import { useUploadMessageFileMutation } from "../store/slices/api";

const useRecording = (canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth.user);
  const { chatType, activeChatId } = useSelector(
    (state: RootState) => state.app
  );
  const { direct_chat, group_chat } = useSelector(
    (state: RootState) => state.conversation
  );
  const [uploadMedia] = useUploadMessageFileMutation();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingState, setRecordingState] = useState<"recording" | "pause">(
    "recording"
  );
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const userList = useMemo(() => {
    const users = group_chat?.current_group_conversation?.users || [];
    return users.filter((u) => u?._id !== auth?._id).map((u) => u?._id);
  }, [group_chat, auth?._id]);

  const resetRecordingState = () => {
    mediaRecorderRef.current = null;
    audioRef.current = null;
    streamRef.current = null;
    canvasRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    audioChunksRef.current = [];

    setIsRecording(false);
    setRecordingState("recording");
    setRecordingTime(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setAudioUrl(null);
  };

  const setupAudioVisualization = useCallback(
    (stream: MediaStream) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      source.connect(analyser);
      analyser.fftSize = 2048;

      const bufferLength = analyser.fftSize;
      const dataArray = new Uint8Array(bufferLength);
      const ctx = canvas.getContext("2d")!;

      const draw = () => {
        if (!canvasRef.current) return;
        requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, "#b721ff");
        gradient.addColorStop(1, "#21d4fd");

        ctx.lineWidth = 2;
        ctx.strokeStyle = gradient;
        ctx.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        ctx.fill();
      };

      draw();
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
    },
    [canvasRef]
  );

  const handleRecording = async () => {
    try {
      if (!isRecording && !mediaRecorderRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        streamRef.current = stream;

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event: BlobEvent) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const chunks = audioChunksRef.current;
          if (!chunks.length) return;

          const blob = new Blob(chunks, { type: "audio/webm" });
          if (!blob || blob.size === 0) return;

          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          audioBlobRef.current = blob;

          stream.getTracks().forEach((track) => track.stop());
          mediaRecorderRef.current = null;
        };

        mediaRecorder.start();

        (mediaRecorder as any).intervalId = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);

        setupAudioVisualization(stream); // ck
        setIsRecording(true);
      } else if (isRecording) {
        mediaRecorderRef.current?.stop();
        clearInterval((mediaRecorderRef.current as any).intervalId);
        setRecordingState("pause");
      }
    } catch (err) {
      console.error("Error during recording:", err);
    }
  };

  const handlePlayPauseAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      setIsPlaying(true);
      try {
        await audio.play();
      } catch (err) {
        console.error("Audio playback failed:", err);
        setIsPlaying(false);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const stream = streamRef.current;
    if (!canvas || !stream) return;

    setupAudioVisualization(stream);
    return () => {
      audioContextRef.current?.close();
    };
  }, [canvasRef.current, streamRef.current]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateCurrentTime = () => setCurrentTime(audio.currentTime || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateCurrentTime);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateCurrentTime);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const handleSendAudio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // if (recordingState == "recording") {
    //   handleRecording();
    // }

    if (recordingState === "recording") {
      mediaRecorderRef.current?.stop();
      setRecordingState("pause");
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    const blob = audioBlobRef.current;
    if (!blob || blob.size === 0) {
      console.error("Audio blob is empty or invalid");
      return;
    }
    const messageId = new ObjectId().toHexString();
    const timestamp = new Date().toISOString();

    let metadata: any;
    try {
      metadata = await getAudioMetadata(blob, auth?._id);
    } catch (err) {
      console.error("Metadata extraction failed", err);
      return;
    }

    const file = new File([blob], metadata.fileName, {
      type: metadata.fileType,
    });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("duration", metadata?.duration);
    formData.append("source", "recorded");

    const commonPayload = {
      _id: messageId,
      status: "pending",
      isOutgoing: true,
      isEdited: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    if (chatType === direct) {
      const payload = {
        ...commonPayload,
        messageType: "audio",
        message: {
          fileId: audioUrl,
          fileName: metadata.fileName,
          fileType: metadata.fileType,
          size: metadata.fileSize,
          duration: metadata.duration,
          source: "recorded",
        },
        isIncoming: false,
        isRead: false,
        deletedFor: [],
        isDeletedForEveryone: false,
        reactions: [],
        conversationId: activeChatId,
      };
      dispatch(addDirectMessage(payload));
      const data = await uploadMedia(formData).unwrap();
      if (!data) return;
      socket.emit("message:send", {
        _id: messageId,
        message: data?.message,
        messageType: "audio",
        conversationId: activeChatId,
        createdAt: timestamp,
        updatedAt: timestamp,
        senderId: auth?._id,
        recipientId: direct_chat.current_direct_conversation?.userId,
      });
    } else if (chatType === group) {
      const payload = {
        ...commonPayload,
        messageType: "audio",
        message: {
          fileId: audioUrl,
          fileName: metadata.fileName,
          fileType: metadata.fileType,
          size: metadata.fileSize,
          duration: metadata.duration,
          source: "recorded",
        },
        isIncoming: false,
        readBy: [],
        deletedFor: [],
        isDeletedForEveryone: [],
        reactions: [],
        conversationId: activeChatId,
      };
      dispatch(addGroupMessage(payload));
      const data = await uploadMedia(formData).unwrap();
      if (!data) return;
      socket.emit("group:message:send", {
        _id: messageId,
        messageType: "audio",
        message: data?.message,
        conversationId: activeChatId,
        createdAt: timestamp,
        updatedAt: timestamp,
        senderId: auth?._id,
        recipientsIds: userList,
        from: {
          _id: auth?._id,
          userName: auth?.userName,
          avatar: auth?.avatar,
        },
      });
    }

    resetRecordingState();
  };

  return {
    isRecording,
    recordingState,
    recordingTime,
    isPlaying,
    currentTime,
    audioUrl,
    audioRef,
    handleRecording,
    handlePlayPauseAudio,
    handleSendAudio,
  };
};

export default useRecording;
