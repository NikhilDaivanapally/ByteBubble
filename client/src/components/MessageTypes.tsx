import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import formatTime from "../utils/format-time";
import formatTime2 from "../utils/format-time2";
import WaveSurfer from "wavesurfer.js";
import getSenderFromGroup from "../utils/get-sender-from-group";
import { RootState } from "../store/store";
import { DirectMessageProps, GroupMessageProps } from "../types";
import { setfullImagePreview } from "../store/slices/conversation";
import Loader from "./ui/Loader";
import { Icons } from "../icons";

type senderProps = { avatar: string; userName: string };

export const TextMsg = React.memo(
  ({ el }: { el: DirectMessageProps | GroupMessageProps }) => {
    const { chatType } = useSelector((state: RootState) => state.app);
    const { GroupConversations } = useSelector(
      (state: RootState) => state.conversation.group_chat
    );
    let sender: senderProps = { avatar: "", userName: "" };
    if (chatType == "group") {
      sender = getSenderFromGroup(
        el as GroupMessageProps,
        chatType,
        GroupConversations
      );
    }

    const { Time } = formatTime(el.createdAt);

    return (
      <div
        className={`Text_msg w-fit flex gap-4 ${
          !el.isIncoming ? "ml-auto" : ""
        }`}
      >
        {chatType !== "individual" && el.isIncoming && (
          <div className="user_profile w-8 h-8 rounded-full bg-gray-400 overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src={sender?.avatar}
              alt=""
            />
          </div>
        )}
        <div className="space-y-1">
          {" "}
          <div
            className={`px-2 py-1 rounded-xl  ${
              !el.isIncoming
                ? "bg-gray-300 rounded-br-none"
                : "bg-white rounded-bl-none"
            }`}
          >
            {chatType !== "individual" && el.isIncoming && (
              <p className="userName text-sm text-black/60">
                {sender?.userName}
              </p>
            )}
            <p>{el.message?.text}</p>
          </div>
          <div className="w-fit ml-auto flex gap-2">
            {!el?.isIncoming ? (
              el?.status === "pending" ? (
                <Icons.ClockIcon />
              ) : (
                <div className="flex-center gap-1">
                  <div
                    className={`w-2 h-2  rounded-full ${
                      el.isSeen ? "bg-green-600" : "bg-gray-300"
                    }`}
                  ></div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      el.isSeen ? "bg-green-600" : "bg-gray-300"
                    }`}
                  ></div>
                </div>
              )
            ) : (
              ""
            )}
            <p className="text-xs text-black/60">{Time}</p>
          </div>
        </div>
      </div>
    );
  }
);

export const MediaMsg = React.memo(
  ({
    el,
    scrollToBottom,
  }: {
    el: DirectMessageProps | GroupMessageProps;
    scrollToBottom: () => void;
  }) => {
    const { chatType } = useSelector((state: RootState) => state.app);
    const { GroupConversations } = useSelector(
      (state: RootState) => state.conversation.group_chat
    );
    let sender: senderProps = { avatar: "", userName: "" };
    if (chatType == "group") {
      sender = getSenderFromGroup(
        el as GroupMessageProps,
        chatType,
        GroupConversations
      );
    }
    const dispatch = useDispatch();
    const { Time } = formatTime(el?.createdAt);

    return (
      <div
        className={`Media_msg w-fit flex gap-4  ${
          !el.isIncoming ? "ml-auto" : ""
        }`}
      >
        {chatType !== "individual" && el.isIncoming && (
          <div className="user_profile w-8 h-8 rounded-full bg-gray-400 overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src={sender?.avatar}
              alt=""
            />
          </div>
        )}
        <div className={`p-1 rounded-xl space-y-1 `}>
          <div
            className={`Media_Container p-1 relative border-1  shadow rounded-lg ${
              !el.isIncoming
                ? "bg-gray-300 rounded-br-none border-transparent shadow-gray-400"
                : "bg-white rounded-bl-none border-gray-200"
            }`}
          >
            {chatType !== "individual" && (
              <p className="userName">{sender?.userName}</p>
            )}
            <div
              onClick={() => {
                dispatch(setfullImagePreview({ fullviewImg: el }));
              }}
            >
              <img
                className="h-40 w-auto rounded-lg"
                src={el?.message?.photoUrl}
                alt={""}
                style={{ userSelect: "none" }}
                onLoad={scrollToBottom}
              />
              {el.status == "pending" && (
                <div className="absolute inset-0 flex-center">
                  <Loader />
                </div>
              )}
            </div>
            {el?.message?.description && (
              <p className="text-sm px-2 py-1">{el?.message?.description}</p>
            )}
          </div>
          <div className="w-fit ml-auto flex gap-2">
            {!el?.isIncoming ? (
              el?.status === "pending" ? (
                <Icons.ClockIcon />
              ) : (
                <div className="flex-center gap-1">
                  <div
                    className={`w-2 h-2  rounded-full ${
                      el.isSeen ? "bg-green-600" : "bg-gray-300"
                    }`}
                  ></div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      el.isSeen ? "bg-green-600" : "bg-gray-300"
                    }`}
                  ></div>
                </div>
              )
            ) : (
              ""
            )}
            <p className="text-xs text-black/60">{Time}</p>
          </div>
        </div>
      </div>
    );
  }
);

export const AudioMsg = React.memo(
  ({ el }: { el: DirectMessageProps | GroupMessageProps }) => {
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const waveformRef = useRef<HTMLDivElement | null>(null);
    const waveSurferRef = useRef<WaveSurfer | null>(null);
    const { chatType } = useSelector((state: RootState) => state.app);
    const { GroupConversations } = useSelector(
      (state: RootState) => state.conversation.group_chat
    );
    let sender: senderProps = { avatar: "", userName: "" };
    if (chatType == "group") {
      sender = getSenderFromGroup(
        el as GroupMessageProps,
        chatType,
        GroupConversations
      );
    }
    const { Time } = formatTime(el?.createdAt);
    useEffect(() => {
      if (el.status === "sent" && el?.message?.audioId) {
        fetch(`http://localhost:8000/api/audio/${el.message.audioId}`)
          .then((response) => {
            if (!response.ok) throw new Error("Audio not found");
            return response.blob();
          })
          .then((audioBlob) => {
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
          })
          .catch((error) => console.error("Error fetching audio:", error));
      } else if (el.status === "pending") {
        setAudioUrl(el.message.audioId || null);
      }
    }, [el.status, el.message.audioId]);

    useEffect(() => {
      if (waveformRef.current && audioUrl) {
        waveSurferRef.current = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: "#e8e8e8",
          progressColor: "#a294f9",
          cursorColor: "transparent",
          height: 20,
          // responsive: true,
          interact: true,
          barWidth: 2,
          barRadius: 5,
          barHeight: 10,
          backend: "WebAudio",
        });

        waveSurferRef.current.load(audioUrl);

        waveSurferRef.current.on("ready", () => {
          setDuration(waveSurferRef.current?.getDuration() || 0);
        });

        waveSurferRef.current.on("audioprocess", () => {
          setCurrentTime(waveSurferRef.current?.getCurrentTime() || 0);
        });

        waveSurferRef.current.on("finish", () => {
          setIsPlaying(false);
        });

        return () => {
          waveSurferRef.current?.destroy();
          waveSurferRef.current = null;
        };
      }
    }, [audioUrl]);

    const handlePlayPauseAudio = () => {
      if (!waveSurferRef.current) return;
      if (isPlaying) {
        waveSurferRef.current.pause();
        setIsPlaying(false);
      } else {
        waveSurferRef.current.play();
        setIsPlaying(true);
      }
    };

    return (
      <div
        className={`Audio_msg w-fit flex gap-4 ${
          !el.isIncoming ? "ml-auto" : ""
        }`}
      >
        {chatType !== "individual" && el.isIncoming && (
          <div className="user_profile w-8 h-8 rounded-full bg-gray-400 overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src={sender?.avatar}
              alt=""
            />
          </div>
        )}

        {el.message?.audioId && (
          <div className="space-y-1">
            <div
              className={`p-2 rounded-xl ${
                !el.isIncoming
                  ? "bg-gray-300 rounded-br-none"
                  : "bg-white rounded-bl-none"
              }`}
            >
              {chatType !== "individual" && (
                <p className="userName">{sender?.userName}</p>
              )}

              {audioUrl ? (
                <div className="w-50 flex items-center gap-2">
                  <span className="w-5" onClick={handlePlayPauseAudio}>
                    {isPlaying ? <Icons.PauseIcon /> : <Icons.PlayIcon />}
                  </span>
                  <div ref={waveformRef} id="waveform" className="flex-1"></div>
                  <span className="text-sm">
                    {`00:${Math.floor(
                      isPlaying ? duration - currentTime : duration
                    )
                      .toString()
                      .padStart(2, "0")}`}
                  </span>
                </div>
              ) : (
                <p>Loading audio...</p>
              )}
            </div>

            <div className="w-fit ml-auto flex gap-2">
              {!el?.isIncoming ? (
                el?.status === "pending" ? (
                  <Icons.ClockIcon />
                ) : (
                  <div className="flex-center gap-1">
                    <div
                      className={`w-2 h-2  rounded-full ${
                        el.isSeen ? "bg-green-600" : "bg-gray-300"
                      }`}
                    ></div>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        el.isSeen ? "bg-green-600" : "bg-gray-300"
                      }`}
                    ></div>
                  </div>
                )
              ) : (
                ""
              )}
              <p className="text-xs text-black/60">{Time}</p>
            </div>
          </div>
        )}

        <audio
          ref={audioRef}
          hidden
          controls
          src={audioUrl ?? undefined}
          className="audioPlayer"
        />
      </div>
    );
  }
);

export const Timeline = React.memo(({ date }: { date: string }) => {
  const formatTime: string = formatTime2(date);

  return (
    <div className="w-full relative before:absolute before:content-[''] before:w-full before:left-0 before:h-[0.1px] flex-center before:bg-black/60 text-center">
      <p className="text-sm text-black/60 px-2 py-1 z-2 bg-gray-200">
        {formatTime}
      </p>
    </div>
  );
});

// export { TextMsg, MediaMsg, AudioMsg, Timeline };
