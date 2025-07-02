import { useEffect, useRef, useState } from "react";
import { GroupMessageProps } from "../../../../types";
import { Icons } from "../../../../icons";
import { formatTo12HourTime } from "../../../../utils/dateUtils";
import WaveSurfer from "wavesurfer.js";
import { GroupMessageActions } from "../../../ui/Dropdowns/actions/GroupMessageActions";
import { useGetFileQuery } from "../../../../store/slices/api";
import { MessageStatus } from "../../../MessageStatus";

export const GroupAudioMsg = ({
  el,
  groupName,
  usersLength,
}: {
  el: GroupMessageProps;
  groupName: string;
  usersLength: number;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const time = formatTo12HourTime(el?.createdAt);
  const readUsers = el.readBy?.length ?? 0;
  const seen = usersLength > 0 && readUsers >= usersLength;
  const isPending = el.status === "pending";
  const isOutgoing = !el?.isIncoming;
  const audioId = el.message?.audioId;

  const { data: audioBlob, isSuccess } = useGetFileQuery(audioId!, {
    skip: isPending || !audioId,
  });

  useEffect(() => {
    if (el.status === "sent" && isSuccess && audioBlob instanceof Blob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } else if (el.status === "pending") {
      setAudioUrl(el.message.audioId || null);
    }
  }, [el.status, el.message.audioId, isSuccess, audioBlob]);

  useEffect(() => {
    if (waveformRef.current && audioUrl) {
      waveSurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#e8e8e8",
        progressColor: "#a294f9",
        cursorColor: "transparent",
        height: 20,
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
        setCurrentTime(0); // reset time
        waveSurferRef.current?.seekTo(0); // reset waveform UI
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
    } else {
      waveSurferRef.current.play();
    }
    setIsPlaying((prev) => !prev);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      className={`Audio_msg relative w-fit flex group items-start ${
        isOutgoing ? "ml-auto" : ""
      }`}
    >
      {isOutgoing && <GroupMessageActions message={el} />}
      {/*  */}
      {el.isIncoming && (
        <div className="user_profile mr-2 w-8 h-8 rounded-full bg-gray-400 overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={el.from?.avatar}
            alt=""
          />
        </div>
      )}

      {/* custom ui for audio player */}
      {el.message?.audioId && (
        <section
          className="space-y-1"
          aria-label={`Message in ${groupName} from ${el.from?.userName} at ${time}`}
        >
          <div
            className={`p-2 rounded-xl ${
              isOutgoing
                ? "bg-gray-300 rounded-br-none"
                : "bg-white rounded-bl-none"
            }`}
          >
            {/* header */}
            <header>
              {el.isIncoming && (
                <p className="userName text-black/60 text-sm">
                  {el.from?.userName}
                </p>
              )}
            </header>

            {/* Message content */}
            {audioUrl ? (
              <div className="w-50 flex items-center gap-2">
                <span className="w-5" onClick={handlePlayPauseAudio}>
                  {isPlaying ? <Icons.PauseIcon /> : <Icons.PlayIcon />}
                </span>
                <div ref={waveformRef} id="waveform" className="flex-1"></div>
                <span className="text-sm">
                  {formatTime(Math.max(duration - currentTime, 0))}
                </span>
              </div>
            ) : (
              <p>Loading audio...</p>
            )}
          </div>

          {/* footer */}
          <MessageStatus
            isIncoming={el.isIncoming}
            status={el.status}
            seen={seen}
            time={time}
          />
        </section>
      )}

      {/* Audio Player hidden */}
      <audio
        ref={audioRef}
        hidden
        controls
        src={audioUrl ?? undefined}
        className="audioPlayer"
      />
    </div>
  );
};
