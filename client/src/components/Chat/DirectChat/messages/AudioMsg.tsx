import { useEffect, useRef, useState } from "react";
import { DirectMessageProps } from "../../../../types";
import { Icons } from "../../../../icons";
import { formatTo12HourTime } from "../../../../utils/dateUtils";
import WaveSurfer from "wavesurfer.js";
import { MessageActions } from "../../../ui/Dropdowns/actions/MessageActions";

export const DirectAudioMsg = ({ el }: { el: DirectMessageProps }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const time = formatTo12HourTime(el?.createdAt);
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
      className={`Audio_msg relative w-fit flex group items-start ${
        !el.isIncoming ? "ml-auto" : ""
      }`}
    >
      {!el.isIncoming && <MessageActions message={el} />}

      {el.message?.audioId && (
        <div className="space-y-1">
          <div
            className={`p-2 rounded-xl ${
              !el.isIncoming
                ? "bg-gray-300 rounded-br-none"
                : "bg-white rounded-bl-none"
            }`}
          >
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
                      el.isRead ? "bg-green-600" : "bg-gray-300"
                    }`}
                  ></div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      el.isRead ? "bg-green-600" : "bg-gray-300"
                    }`}
                  ></div>
                </div>
              )
            ) : (
              ""
            )}
            <p className="text-xs text-black/60">{time}</p>
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
};
