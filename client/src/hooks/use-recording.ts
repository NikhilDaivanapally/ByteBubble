import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { socket } from "../socket";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import {
  addDirectMessage,
  addGroupMessage,
} from "../store/slices/conversation";
import { direct, group } from "../utils/conversation-types";

const useRecording = (canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
  const dispatch = useDispatch();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingState, setRecordingState] = useState<"recording" | "pause">(
    "recording"
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const { chatType, activeChatId } = useSelector(
    (state: RootState) => state.app
  );
  const { direct_chat, group_chat } = useSelector(
    (state: RootState) => state.conversation
  );
  const auth = useSelector((state: RootState) => state.auth.user);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const AudioChunksRef = useRef<Blob[]>([]);

  const userList = useMemo(() => {
    if (!group_chat.current_group_conversation?.admin) return [];
    const users = group_chat.current_group_conversation.users || [];
    const admin = group_chat.current_group_conversation.admin;
    return [...users, admin]
      .filter((el) => el._id !== auth?._id)
      .map((el) => el._id);
  }, [group_chat.current_group_conversation, auth?._id]);

  const resetRecordingState = () => {
    mediaRecorderRef.current = null;
    audioRef.current = null;
    streamRef.current = null;
    canvasRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    AudioChunksRef.current = [];

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

        AudioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event: BlobEvent) => {
          if (event.data.size > 0) {
            AudioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(AudioChunksRef.current, {
            type: "audio/wav",
          });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(audioUrl);

          stream.getTracks().forEach((track) => track.stop());
          mediaRecorderRef.current = null;
        };

        mediaRecorder.start();

        const intervalId = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
        (mediaRecorder as any).intervalId = intervalId;

        setupAudioVisualization(stream); // ck
        setIsRecording(true);
        if (recordingState === "pause") setRecordingState("recording");
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

  const handleSendAudio = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (recordingState == "recording") {
      handleRecording();
    }

    const messageId = crypto.randomUUID();
    const messageCreatedAt = new Date().toISOString();

    switch (chatType) {
      case direct:
        dispatch(
          addDirectMessage({
            _id: messageId,
            messageType: "audio",
            message: {
              audioId: audioUrl,
            },
            conversationId: activeChatId,
            createdAt: messageCreatedAt,
            updatedAt: messageCreatedAt,
            isIncoming: false,
            isOutgoing: true,
            status: "pending",
            isSeen: false,
          })
        );
        socket.emit("message:send", {
          _id: messageId,
          senderId: auth?._id,
          recipientId: direct_chat.current_direct_conversation?.userId,
          messageType: "audio",
          message: new Blob(AudioChunksRef.current, { type: "audio/wav" }),
          conversationId: activeChatId,
          createdAt: messageCreatedAt,
          updatedAt: messageCreatedAt,
        });

        break;
      case group:
        dispatch(
          addGroupMessage({
            _id: messageId,
            messageType: "audio",
            message: {
              audioId: audioUrl,
            },
            conversationId: activeChatId,
            conversationType: group,
            createdAt: messageCreatedAt,
            updatedAt: messageCreatedAt,
            isIncoming: false,
            isOutgoing: true,
            status: "pending",
            isSeen: false,
          })
        );

        socket.emit("group:message:send", {
          _id: messageId,
          senderId: auth?._id,
          recipientsIds: userList,
          messageType: "audio",
          message: new Blob(AudioChunksRef.current, { type: "audio/wav" }),
          conversationType: group,
          conversationId: activeChatId,
          createdAt: messageCreatedAt,
          updatedAt: messageCreatedAt,
        });

        break;
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
