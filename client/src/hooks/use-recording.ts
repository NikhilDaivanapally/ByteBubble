import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useUploadMessageFileMutation } from "../store/slices/api";
import { ObjectId } from "bson";
import { getAudioMetadataReliable } from "../utils/get-audio-metadata";
import {
  addDirectMessage,
  addGroupMessage,
} from "../store/slices/conversation";
import { socket } from "../socket";
import { direct, group } from "../utils/conversation-types";

type RecordingState = "recording" | "paused";
type RecordingErrorType =
  | "PERMISSION_DENIED"
  | "NOT_SUPPORTED"
  | "RECORDING_FAILED";

interface RecordingError {
  type: RecordingErrorType;
  message: string;
}

const useRecording = (
  canvasRef?: React.RefObject<HTMLCanvasElement | null>
) => {
  const dispatch = useDispatch();
  const [uploadMedia] = useUploadMessageFileMutation();

  const { user: auth } = useSelector((state: RootState) => state.auth);
  const { chatType, activeChatId } = useSelector(
    (state: RootState) => state.app
  );
  const { direct_chat, group_chat } = useSelector(
    (state: RootState) => state.conversation
  );

  // State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingState, setRecordingState] =
    useState<RecordingState>("paused");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<RecordingError | null>(null);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const visualizationFrameRef = useRef<number | null>(null);

  const userList = useMemo(() => {
    const users = group_chat?.current_group_conversation?.users || [];
    return users.filter((u) => u?._id !== auth?._id).map((u) => u._id);
  }, [group_chat, auth?._id]);

  const formatTime = useCallback((s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleError = useCallback((err: RecordingError) => {
    console.error("Recording error:", err);
    setError(err);
    stopRecording();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setupAudioVisualization = useCallback(
    (stream: MediaStream) => {
      const canvas = canvasRef?.current;
      if (!canvas) return;

      try {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);

        source.connect(analyser);
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
          if (!canvas || !isRecording) return;

          visualizationFrameRef.current = requestAnimationFrame(draw);
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
        };

        draw();

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
      } catch (err) {
        console.error("Failed to setup visualization:", err);
      }
    },
    [canvasRef, isRecording]
  );

  const startRecording = useCallback(async () => {
    if (isRecording && recordingState === "paused") return;
    clearError();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        audioBlobRef.current = blob;
        stream.getTracks().forEach((track) => track.stop());
        mediaRecorderRef.current = null;
      };

      mediaRecorder.onerror = (event: any) => {
        handleError({
          type: "RECORDING_FAILED",
          message: event.error?.message || "Recording failed",
        });
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      setIsRecording(true);
      setRecordingState("recording");
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        handleError({
          type: "PERMISSION_DENIED",
          message: "Microphone access denied.",
        });
      } else if (err.name === "NotFoundError") {
        handleError({
          type: "NOT_SUPPORTED",
          message: "Microphone not found.",
        });
      } else {
        handleError({
          type: "RECORDING_FAILED",
          message: err.message || "Recording failed",
        });
      }
    }
  }, [isRecording, recordingState]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    clearInterval(recordingIntervalRef.current!);
    cancelAnimationFrame(visualizationFrameRef.current!);

    if (audioContextRef.current?.state !== "closed") {
      audioContextRef?.current?.close();
    }

    setRecordingState("paused");
  }, []);

  const resetRecording = useCallback(() => {
    analyserRef.current = null;
    setIsRecording(false);
    setRecordingState("recording");
    setRecordingTime(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setAudioUrl(null);
    stopRecording();
    audioChunksRef.current = [];
  }, [stopRecording]);

  const playPauseAudio = useCallback(async () => {
    if (!audioRef.current || !audioUrl) return;
    const audio = audioRef.current;

    try {
      if (audio.paused) {
        setIsPlaying(true);
        await audio.play();
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch (err) {
      setIsPlaying(false);
      console.error("Audio playback failed", err);
    }
  }, [audioUrl]);

  const sendAudio = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      try {
        const blob = audioBlobRef.current;
        if (!blob || blob.size === 0) throw new Error("No audio data");

        const messageId = new ObjectId().toHexString();
        const timestamp = new Date().toISOString();
        const metadata: any = await getAudioMetadataReliable(blob, auth?._id);

        const file = new File([blob], metadata.fileName, {
          type: metadata.fileType,
        });
        const formData = new FormData();
        formData.append("file", file);
        formData.append("duration", metadata?.duration || 0);
        formData.append("source", "recorded");

        const commonPayload = {
          _id: messageId,
          status: "pending",
          isOutgoing: true,
          isEdited: false,
          createdAt: timestamp,
          updatedAt: timestamp,
          messageType: "audio",
          message: {
            fileId: audioUrl,
            fileName: metadata.fileName,
            fileType: metadata.fileType,
            size: metadata.fileSize,
            duration: metadata.duration,
            source: "recorded",
          },
        };
        resetRecording();

        if (chatType === direct) {
          const payload = {
            ...commonPayload,
            isIncoming: false,
            isRead: false,
            deletedFor: [],
            isDeletedForEveryone: false,
            reactions: [],
            conversationId: activeChatId,
          };
          dispatch(addDirectMessage(payload));

          try {
            const data = await uploadMedia(formData).unwrap();
            if (!data) throw new Error("Upload failed");
            socket.emit("message:send", {
              _id: messageId,
              message: data.message,
              messageType: "audio",
              conversationId: activeChatId,
              createdAt: timestamp,
              updatedAt: timestamp,
              senderId: auth?._id,
              recipientId: direct_chat.current_direct_conversation?.userId,
            });
          } catch (uploadErr) {
            console.error("Upload failed:", uploadErr);
            return;
          }
        } else if (chatType === group) {
          const payload = {
            ...commonPayload,
            isIncoming: false,
            readBy: [],
            deletedFor: [],
            isDeletedForEveryone: [],
            reactions: [],
            conversationId: activeChatId,
          };

          dispatch(addGroupMessage(payload));

          try {
            const data = await uploadMedia(formData).unwrap();
            if (!data) throw new Error("Upload failed");

            socket.emit("group:message:send", {
              _id: messageId,
              messageType: "audio",
              message: data.message,
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
          } catch (uploadErr) {
            console.error("Upload failed:", uploadErr);
            return;
          }
        }
      } catch (err) {
        console.error("Audio send failed", err);
      }
    },
    [
      audioUrl,
      auth,
      userList,
      activeChatId,
      direct_chat.current_direct_conversation?.userId,
    ]
  );

  useEffect(() => {
    if (canvasRef?.current && streamRef.current) {
      setupAudioVisualization(streamRef.current);
    }

    return () => {
      if (audioContextRef.current?.state !== "closed") {
        audioContextRef?.current?.close();
      }
    };
  }, [canvasRef, setupAudioVisualization]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime || 0);
    const resetPlayback = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("ended", resetPlayback);
    audio.addEventListener("error", resetPlayback);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("ended", resetPlayback);
      audio.removeEventListener("error", resetPlayback);
    };
  }, [audioUrl]);

  useEffect(() => resetRecording, []);

  return {
    isRecording,
    recordingState,
    recordingTime,
    isPlaying,
    currentTime,
    audioUrl,
    audioRef,
    error,
    startRecording,
    stopRecording,
    playPauseAudio,
    resetRecording,
    sendAudio,
    clearError,
    formatTime,
    hasAudio: !!audioUrl,
    duration: recordingTime || 0,
  };
};

export default useRecording;
