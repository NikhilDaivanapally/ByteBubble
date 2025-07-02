import { useEffect, useRef, useState } from "react";
import { DirectMessageProps } from "../../../../types";
import { Icons } from "../../../../icons";
import { formatTo12HourTime } from "../../../../utils/dateUtils";
import WaveSurfer from "wavesurfer.js";
import { DirectMessageActions } from "../../../ui/Dropdowns/actions/DirectMessageActions";
import { useGetFileQuery } from "../../../../store/slices/api";
import { MessageStatus } from "../../../MessageStatus";

export const DirectAudioMsg = ({
  el,
  from,
}: {
  el: DirectMessageProps;
  from: string;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const time = formatTo12HourTime(el?.createdAt);
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
      {isOutgoing && <DirectMessageActions message={el} />}

      {el.message?.audioId && (
        <section
          aria-label={`Message from ${from} at ${time}`}
          className="space-y-1"
        >
          
          {/* Message content */}
          <div
            className={`p-2 rounded-xl ${
              isOutgoing
                ? "bg-gray-300 rounded-br-none"
                : "bg-white rounded-bl-none"
            }`}
          >
            {/* custom ui for audio player */}
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
            isRead={el.isRead}
            time={time}
          />
        </section>
      )}
      {/* audio player hidden */}
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
