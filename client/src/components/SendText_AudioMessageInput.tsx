import React, { useCallback, useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import {
  addDirectMessage,
  addGroupMessage,
} from "../store/slices/conversation";
import { socket } from "../socket";
import { motion, AnimatePresence } from "motion/react";

import {
  updateMediaFiles,
  updateMediaPreviewUrls,
  updateOpenCamera,
} from "../store/slices/appSlice";
import { parseFiles } from "../utils/parse-files";
import { Icons } from "../icons";
import { group, individual } from "../utils/conversation-types";

const SendText_AudioMessageInput = () => {
  const dispatch = useDispatch();
  const [isEmojiPickerActive, setIsEmojiPickerActive] = useState(false);
  const [message, setMessage] = useState("");
  const [isAttachementActive, setIsAttachementActive] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { _id: auth_id }: any = useSelector(
    (state: RootState) => state.auth.user
  );

  const { activeChatId, chatType } = useSelector(
    (state: RootState) => state.app
  );
  const { direct_chat, group_chat } = useSelector(
    (state: RootState) => state.conversation
  );
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value);
      autoResize();
    },
    []
  );

  const handleToggleEmojiPicker = useCallback(
    () => setIsEmojiPickerActive((prev) => !prev),
    []
  );
  const containsUrl = (text: string) => /(https?:\/\/[^\s]+)/gi.test(text);

  // handle the emoji select
  const handleEmojiClick = useCallback((emoji: any) => {
    console.log(typeof emoji);
    setMessage((prev) => prev + emoji.emoji);
    handleToggleEmojiPicker();
  }, []);

  let userList: {}[] = [];

  if (
    group_chat?.current_group_conversation?.users.length > 0 &&
    group_chat.current_group_conversation?.admin
  ) {
    userList = [
      ...group_chat.current_group_conversation?.users,
      group_chat.current_group_conversation?.admin,
    ]
      .filter((el) => el._id !== auth_id)
      .map((el) => el._id);
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [
    direct_chat?.current_direct_messages,
    group_chat?.current_group_messages,
    activeChatId,
  ]);

  // handle send message
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;
    const to =
      chatType === "individual"
        ? direct_chat?.current_direct_conversation?.userId
        : userList;

    const messageId = crypto.randomUUID();
    const messageCreatedAt = new Date().toISOString();
    switch (chatType) {
      case "group":
        dispatch(
          addGroupMessage({
            id: messageId,
            type: containsUrl(message) ? "link" : "text",
            message: {
              text: message,
            },
            conversationId: activeChatId,
            createdAt: messageCreatedAt,
            updatedAt: messageCreatedAt,
            incoming: false,
            outgoing: true,
            status: "pending",
            seen: false,
          })
        );
        break;
      default:
        dispatch(
          addDirectMessage({
            id: messageId,
            type: containsUrl(message) ? "link" : "text",
            message: {
              text: message,
            },
            createdAt: messageCreatedAt,
            updatedAt: messageCreatedAt,
            incoming: false,
            outgoing: true,
            status: "pending",
            seen: false,
          })
        );
        break;
    }

    socket.emit("text_message", {
      _id: messageId,
      sender: auth_id,
      recipients: to,
      messageType: containsUrl(message) ? "link" : "text",
      message: {
        text: message,
      },
      conversationType: chatType == "individual" ? individual : group,
      conversationId: activeChatId,
      createdAt: messageCreatedAt,
      updatedAt: messageCreatedAt,
    });
    setMessage("");
  };

  // handle emit typing and stop typing events
  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 130) + "px"; // 150px = max height
    }
  };

  useEffect(() => {
    autoResize();
  }, []);

  const attachementsArray = [
    {
      icon: <Icons.DocumentIcon className="w-5 text-violet-400" />,
      title: "Documents",
      accept: ".pdf, .doc, .docx, .xls, .xlsx",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target as HTMLInputElement;
        dispatch(updateMediaFiles(files));
      },
    },
    {
      icon: <Icons.PhotoIcon className="w-5 text-blue-400" />,
      title: "Photos & Videos",
      accept: "image/*",
      onChange: async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        setIsAttachementActive(false);
        const filesArray = Object.values(files);
        dispatch(updateMediaFiles(filesArray));
        const parsed = await parseFiles(filesArray);
        dispatch(updateMediaPreviewUrls(parsed));
      },
    },
    {
      icon: <Icons.CameraIcon className="w-5 text-red-400" />,
      title: "Camera",
      onClick: () => {
        dispatch(updateOpenCamera(true));
        setIsAttachementActive(false);
      },
    },
  ];

  //  audio releated states and handler functions

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const AudioChucksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingState, setRecordingState] = useState<"recording" | "pause">(
    "recording"
  );
  const [RecordingTime, setRecordingTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (canvasRef.current && streamRef.current) {
      setupAudioVisualization(streamRef.current);
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [canvasRef.current]);

  const setupAudioVisualization = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    source.connect(analyser);
    analyser.fftSize = 2048;

    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    function draw() {
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

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      ctx.fill();
    }

    draw();

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
  };

  const handleRecording = async () => {
    try {
      if (!isRecording && !mediaRecorderRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        streamRef.current = stream;

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        AudioChucksRef.current = [];

        mediaRecorder.ondataavailable = (event: BlobEvent) => {
          if (event.data.size > 0) {
            AudioChucksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(AudioChucksRef.current, {
            type: "audio/wav",
          });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(audioUrl);

          stream.getTracks().forEach((track) => track.stop());
          mediaRecorderRef.current = null;
        };

        mediaRecorder.start();

        const intervalId = window.setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
        (mediaRecorder as any).intervalId = intervalId;

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

  const handlePlayPauseAudio = () => {
    const audio = audioRef.current as HTMLAudioElement;
    if (audio.paused) {
      setIsPlaying(true);
      audio.play();
    } else {
      setIsPlaying(false);
      audio.pause();
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      const updateCurrentTime = () => {
        setCurrentTime(
          (audioRef.current as HTMLAudioElement).currentTime > 0
            ? (audioRef.current as HTMLAudioElement).currentTime
            : 0
        );
      };

      const updatePlaystate = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audioRef.current.addEventListener("timeupdate", updateCurrentTime);
      audioRef.current.addEventListener("ended", updatePlaystate);
    }
  }, [audioRef.current]);

  const handleSendAudio = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (recordingState == "recording") {
      handleRecording();
    }

    const messageId = crypto.randomUUID();
    const messageCreatedAt = new Date().toISOString();

    chatType === "individual"
      ? dispatch(
          addDirectMessage({
            id: messageId,
            type: "audio",
            message: {
              audioId: audioUrl,
            },
            createdAt: messageCreatedAt,
            updatedAt: messageCreatedAt,
            incoming: false,
            outgoing: true,
            status: "pending",
            seen: false,
          })
        )
      : dispatch(
          addGroupMessage({
            id: messageId,
            type: "audio",
            message: {
              audioId: audioUrl,
            },
            conversationId: activeChatId,
            createdAt: messageCreatedAt,
            updatedAt: messageCreatedAt,
            incoming: false,
            outgoing: true,
            status: "pending",
            seen: false,
          })
        );

    const to =
      chatType === "individual"
        ? direct_chat.current_direct_conversation?.userId
        : userList;

    socket.emit("audio_message", {
      _id: messageId,
      sender: auth_id,
      recipients: to,
      messageType: "audio",
      message: new Blob(AudioChucksRef.current, { type: "audio/wav" }),
      conversationType: chatType == "individual" ? individual : group,
      conversationId: activeChatId,
      createdAt: messageCreatedAt,
      updatedAt: messageCreatedAt,
    });

    mediaRecorderRef.current = null;
    audioRef.current = null;
    streamRef.current = null;
    canvasRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;

    setIsRecording(false);
    setRecordingState("recording");
    setRecordingTime(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setAudioUrl(null);
  };

  return (
    <>
      {!isRecording ? (
        <form
          onSubmit={handleSendMessage}
          className="w-full flex items-center gap-1 md:gap-3 p-1 md:p-1 bg-light mt-4  max-w-3xl rounded-lg md:rounded-xl mx-auto"
        >
          <textarea
            value={message}
            rows={1}
            placeholder="write your message"
            className="resize-none flex-1 w-full pl-2 placeholder:tracking-normal outline-none"
            ref={textareaRef}
            onChange={handleInputChange}
          />

          <div className="p-1 relative cursor-pointer rounded-lg text-black/60">
            <Icons.SmileIcon
              className="text-xl select-none"
              onClick={handleToggleEmojiPicker}
            />

            {/* Emoji picker */}
            <div className="absolute bottom-[160%] right-0 translate-x-1/4 md:right-full z-60 bg-gray-300">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                autoFocusSearch={false}
                skinTonesDisabled={true}
                searchDisabled={false}
                lazyLoadEmojis={true}
                height={370}
                width={320}
                open={isEmojiPickerActive}
                emojiStyle="native" // or "google", "apple", etc.
                previewConfig={{
                  showPreview: false,
                }}
                // theme="light"
                style={{ backgroundColor: "white" }}
              />
            </div>
          </div>
          <div className="p-1 relative cursor-pointer rounded-lg text-black/60">
            <Icons.AttachmentIcons
              className="text-xl"
              onClick={() => setIsAttachementActive((prev) => !prev)}
            />
            <AnimatePresence>
              {isAttachementActive && (
                <motion.div
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  exit={{ scaleY: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-2 rounded-md space-y-1 origin-bottom absolute bottom-[160%] right-0 translate-x-1/4 md:right-full z-60 bg-gray-300"
                >
                  <ul>
                    {attachementsArray?.map((el, i) => (
                      <li key={i} className="list-none">
                        {el.onChange ? (
                          <label className="flex gap-2 p-2 text-sm text-nowrap rounded-md transition-all hover:bg-gray-200 cursor-pointer">
                            {el.icon}
                            <span>{el.title}</span>
                            <input
                              type="file"
                              hidden
                              accept={el.accept}
                              multiple
                              onChange={el.onChange}
                            />
                          </label>
                        ) : (
                          <div
                            className="flex gap-2 p-2 text-sm text-nowrap rounded-md transition-all hover:bg-gray-200 cursor-pointer"
                            onClick={el.onClick}
                          >
                            {el.icon}
                            <span>{el.title}</span>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div
            className="p-1 cursor-pointer rounded-lg text-black/60"
            onClick={handleRecording}
          >
            <Icons.MicPrimary className="text-xl" />
          </div>

          <button
            type="submit"
            className="p-3 cursor-pointer bg-btn-primary text-white rounded-lg"
          >
            <Icons.SendIcon className="text-xl" />
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleSendAudio}
          className="w-full flex items-center gap-1 md:gap-3 p-1 md:p-1 bg-light mt-4  max-w-3xl rounded-lg md:rounded-xl mx-auto"
        >
          <div className="flex-1 flex-center gap-2">
            <Icons.DeleteIcon className="text-xl" />
            {audioUrl ? (
              <div className="flex flex-center gap-2">
                <span
                  className="PlayPause-button"
                  onClick={handlePlayPauseAudio}
                >
                  {isPlaying ? (
                    <Icons.PauseSeconday className="text-xl" />
                  ) : (
                    <Icons.PlaySeconday className="text-xl" />
                  )}
                </span>
                <input
                  type="range"
                  step="0.1"
                  max={RecordingTime || 0}
                  className="custom_range"
                  value={currentTime || 0}
                  onChange={(e) => {
                    const audio = audioRef.current as HTMLAudioElement | null;
                    if (audio) {
                      audio.currentTime = parseFloat(e.target.value);
                    }
                  }}
                />

                <span className="recorded_duration">
                  {Math.floor(RecordingTime)
                    ? `00:${Math.floor(RecordingTime - currentTime)
                        .toString()
                        .padStart(2, "0")}`
                    : "00:00"}
                </span>
              </div>
            ) : (
              <div className="flex flex-center">
                <span>
                  {" "}
                  {Math.floor(RecordingTime)
                    ? `00:${Math.floor(RecordingTime)
                        .toString()
                        .padStart(2, "0")}`
                    : "00:00"}
                </span>
                <canvas ref={canvasRef} className="w-40 h-10"></canvas>
              </div>
            )}
            <audio
              id="audio"
              controls
              hidden
              ref={audioRef}
              src={audioUrl ? audioUrl : ""}
              // onTimeUpdate={handlePlayAudioTimeUpdate}
              // onEnded={handleAudioOnEnd}
            ></audio>
            <div onClick={handleRecording}>
              {recordingState === "recording" ? (
                <Icons.PauseSeconday className="text-xl" />
              ) : (
                <Icons.MicSecondary className="text-xl" />
              )}
            </div>
          </div>
          <button
            type="submit"
            className="p-3 cursor-pointer bg-btn-primary text-white rounded-lg"
          >
            <Icons.SendIcon className="text-xl" />
          </button>
        </form>
      )}
    </>
  );
};

export default SendText_AudioMessageInput;
