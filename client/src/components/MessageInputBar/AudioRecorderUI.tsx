import React from "react";
import { Icons } from "../../icons";

interface AudioRecorderUIProps {
  audioUrl: string | null;
  recordingTime: number;
  currentTime: number;
  isPlaying: boolean;
  recordingState: string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  handlePlayPauseAudio: () => void;
  handleRecording: () => void;
  handleSendAudio: (e: React.FormEvent<HTMLFormElement>) => void;
}

const formatTime = (seconds: number) =>
  `00:${Math.floor(seconds).toString().padStart(2, "0")}`;

const AudioRecorderUI: React.FC<AudioRecorderUIProps> = ({
  audioUrl,
  recordingTime,
  currentTime,
  isPlaying,
  recordingState,
  audioRef,
  canvasRef,
  handlePlayPauseAudio,
  handleRecording,
  handleSendAudio,
}) => {
  return (
    <form
      onSubmit={handleSendAudio}
      className="w-full flex items-center gap-1 md:gap-3 p-1 md:p-1 bg-light mt-4 max-w-3xl rounded-lg md:rounded-xl mx-auto"
    >
      <div className="flex-1 flex-center gap-2">
        <Icons.DeleteIcon className="text-xl" />
        {audioUrl ? (
          <div className="flex flex-center gap-2">
            <span className="PlayPause-button" onClick={handlePlayPauseAudio}>
              {isPlaying ? (
                <Icons.PauseSeconday className="text-xl" />
              ) : (
                <Icons.PlaySeconday className="text-xl" />
              )}
            </span>
            <input
              type="range"
              step="0.1"
              max={recordingTime || 0}
              className="custom_range"
              value={currentTime || 0}
              onChange={(e) => {
                const audio = audioRef.current;
                if (audio) {
                  audio.currentTime = parseFloat(e.target.value);
                }
              }}
            />
            <span className="recorded_duration">
              {recordingTime
                ? formatTime(recordingTime - currentTime)
                : "00:00"}
            </span>
          </div>
        ) : (
          <div className="flex flex-center">
            <span>{recordingTime ? formatTime(recordingTime) : "00:00"}</span>
            <canvas ref={canvasRef} className="w-40 h-10"></canvas>
          </div>
        )}
        <audio
          id="audio"
          controls
          hidden
          ref={audioRef}
          src={audioUrl || undefined}
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
  );
};

export default AudioRecorderUI;
