import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { Icons } from "../../../icons";
import { CustomSlider } from "../../ui/Slider/CustomSlider";
import Dialog from "../../ui/Dialog/Dialog";
import { Button } from "../../ui/Button";

interface AudioRecorderUIProps {
  audioUrl: string | null;
  currentTime: number;
  isPlaying: boolean;
  isRecording: boolean;
  recordingState: string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  handleStartRecording: () => void;
  handleStopRecording: () => void;
  handleSendAudio: (e: React.FormEvent<HTMLFormElement>) => void;
  handlePlayPauseAudio: () => void;
  handleReset: () => void;
  isUploading?: boolean;
  error?: string | null;
  duration?: number;
  formatTime?: (seconds: number) => string;
}

const defaultFormatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

const AudioRecorderUI: React.FC<AudioRecorderUIProps> = ({
  audioUrl,
  currentTime,
  isPlaying,
  isRecording,
  recordingState,
  audioRef,
  canvasRef,
  handleStopRecording,
  handleSendAudio,
  handlePlayPauseAudio,
  handleReset,
  error = null,
  duration = 0,
  formatTime = defaultFormatTime,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actualAudioDuration, setActualAudioDuration] = useState(0);
  const [actualCurrentTime, setActualCurrentTime] = useState(0);
  const [audioReady, setAudioReady] = useState(false);

  // Ref to track if we're in the middle of a seek operation
  const isSeekingRef = useRef(false);

  // Effect to handle audio metadata and time updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateDuration = () => {
      if (
        audio.duration &&
        !isNaN(audio.duration) &&
        isFinite(audio.duration)
      ) {
        setActualAudioDuration(audio.duration);
        setAudioReady(true);
      }
    };

    const updateCurrentTime = () => {
      if (!isSeekingRef.current) {
        setActualCurrentTime(audio.currentTime);
      }
    };

    const handleLoadStart = () => {
      setAudioReady(false);
    };

    const handleCanPlay = () => {
      updateDuration();
      setAudioReady(true);
    };

    const handleSeeking = () => {
      isSeekingRef.current = true;
    };

    const handleSeeked = () => {
      isSeekingRef.current = false;
      setActualCurrentTime(audio.currentTime);
    };

    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      setAudioReady(false);
    };

    const handleResetActualCurrentTime = () => {
      setActualCurrentTime(0);
    };

    // Add all event listeners
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("timeupdate", updateCurrentTime);
    audio.addEventListener("seeking", handleSeeking);
    audio.addEventListener("seeked", handleSeeked);
    audio.addEventListener("error", handleError);
    audio.addEventListener("ended", handleResetActualCurrentTime);

    // Initial setup
    if (audio.readyState >= 1) {
      updateDuration();
      setAudioReady(true);
    }

    return () => {
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("timeupdate", updateCurrentTime);
      audio.removeEventListener("seeking", handleSeeking);
      audio.removeEventListener("seeked", handleSeeked);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("ended", handleResetActualCurrentTime);
    };
  }, [audioRef, audioUrl]);

  // Reset audio state when audioUrl changes
  useEffect(() => {
    if (audioUrl) {
      setActualAudioDuration(0);
      setActualCurrentTime(0);
      setAudioReady(false);
    }
  }, [audioUrl]);

  // Use actual audio duration and current time when available, fallback to props
  const effectiveDuration = useMemo(() => {
    if (audioUrl && audioReady && actualAudioDuration > 0) {
      return actualAudioDuration;
    }
    return duration;
  }, [audioUrl, audioReady, actualAudioDuration, duration]);

  const effectiveCurrentTime = useMemo(() => {
    if (audioUrl && audioReady) {
      return actualCurrentTime;
    }
    return currentTime;
  }, [audioUrl, audioReady, actualCurrentTime, currentTime]);

  // Calculate remaining time for better UX
  const remainingTime = useMemo(() => {
    if (audioUrl && audioReady && effectiveDuration > 0) {
      return Math.max(0, effectiveDuration - effectiveCurrentTime);
    }
    return duration;
  }, [audioUrl, audioReady, effectiveDuration, effectiveCurrentTime, duration]);

  const handleSliderChange = useCallback(
    (newTime: number) => {
      const audio = audioRef.current;
      if (audio && effectiveDuration > 0) {
        isSeekingRef.current = true;
        audio.currentTime = newTime;
        setActualCurrentTime(newTime);
      }
    },
    [audioRef, effectiveDuration]
  );

  // Handle delete with confirmation
  const handleDelete = useCallback(() => {
    if (audioUrl || duration > 0) {
      setShowDeleteConfirm(true);
    } else {
      handleReset();
    }
  }, [audioUrl, duration, handleReset]);

  const confirmDelete = useCallback(() => {
    handleReset();
    setShowDeleteConfirm(false);
    setActualAudioDuration(0);
    setActualCurrentTime(0);
    setAudioReady(false);
  }, [handleReset]);

  // Recording state indicator
  const getRecordingStateIndicator = () => {
    if (isRecording && recordingState == "recording") {
      return (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-red-600 font-medium">Recording</span>
        </div>
      );
    }
    return null;
  };

  // Determine if we should show the playback interface
  const showPlaybackInterface = audioUrl && recordingState === "paused";

  return (
    <div className="w-full relative max-w-4xl mx-auto">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
          {/* <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" /> */}
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {/* Recording State Indicator */}
      {getRecordingStateIndicator() && (
        <div className="flex justify-center mb-3">
          {getRecordingStateIndicator()}
        </div>
      )}

      {/* Main Recording Interface */}
      <form
        onSubmit={handleSendAudio}
        className="w-full flex items-center justify-evenly gap-1 md:gap-2 p-1 bg-gray-50 mt-4 max-w-3xl rounded-lg md:rounded-xl mx-auto"
      >
        {/* Delete Button */}
        <button
          type="button"
          onClick={handleDelete}
          className="p-1 rounded-full cursor-pointer hover:bg-red-50 transition-colors duration-200 group"
          title="Delete recording"
        >
          <Icons.DeleteIcon className="size-6 text-gray-400 group-hover:text-red-500 transition-colors" />
        </button>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center gap-2">
          {showPlaybackInterface ? (
            <div className="flex items-center gap-2 w-full">
              {/* play & pause audio controls */}
              <button
                type="button"
                onClick={handlePlayPauseAudio}
                title={isPlaying ? "Pause" : "Play"}
                className="text-gray-400 cursor-pointer"
                disabled={!audioReady}
              >
                {isPlaying ? (
                  <Icons.PauseIcon className="size-6" />
                ) : (
                  <Icons.PlayIcon className="size-6" />
                )}
              </button>

              {/* audio bar with recorded time */}
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 relative">
                  {/* custom slider */}

                  <CustomSlider
                    duration={effectiveDuration}
                    currentTime={effectiveCurrentTime}
                    onSeek={handleSliderChange}
                  />

                  <div className="flex justify-between text-xs text-gray-700 mt-1">
                    <span>{formatTime(effectiveCurrentTime || 0)}</span>
                    <span>{formatTime(effectiveDuration || 0)}</span>
                  </div>
                </div>

                <div className="font-medium  text-gray-700 min-w-12 text-center">
                  {formatTime(remainingTime)}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <div className="text-md  text-gray-700 min-w-12">
                {formatTime(duration)}
              </div>

              <div className="flex-1 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  className="w-full h-10 rounded-lg bg-gray-100 border"
                />
              </div>
            </div>
          )}
        </div>

        {/* Recording Controls */}
        <div className="flex items-center gap-2">
          {recordingState == "recording" ? (
            <button
              type="button"
              onClick={handleStopRecording}
              className="p-2 rounded-full cursor-pointer bg-red-500 hover:bg-red-600 transition-all duration-200"
              title="Stop recording"
            >
              <Icons.PauseIcon className="w-5 h-5 text-white" />
            </button>
          ) : null}
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={recordingState === "recording"}
          title="Send audio"
          className="p-3 bg-btn-primary cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
        >
          <Icons.SendIcon className="w-5 h-5" />
        </button>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src={audioUrl || undefined}
          className="hidden"
          preload="metadata"
        />
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Dialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
        >
          <div className="w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Recording?
            </h3>
            <p className="text-gray-600 mb-6">
              This will permanently delete your recording. This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                className="w-full"
              >
                Delete
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default AudioRecorderUI;
