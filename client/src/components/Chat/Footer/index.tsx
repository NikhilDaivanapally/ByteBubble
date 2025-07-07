import { useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import useRecording from "../../../hooks/use-recording";
import AudioRecorderUI from "./AudioRecorderUI";
import TextInputForm from "./TextInputForm";

const MessageInputBar = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const {
    audioUrl,
    currentTime,
    isPlaying,
    isRecording,
    recordingState,
    audioRef,
    duration,
    startRecording,
    stopRecording,
    sendAudio,
    playPauseAudio,
    resetRecording,
    formatTime,
  } = useRecording(canvasRef);

  const isChatActive = useSelector(
    (state: RootState) => !!state.app.activeChatId
  );

  if (!isChatActive) return null;

  return (
    <footer>
      {isRecording ? (
        <AudioRecorderUI
          isRecording={isRecording}
          recordingState={recordingState}
          audioUrl={audioUrl}
          currentTime={currentTime}
          isPlaying={isPlaying}
          audioRef={audioRef}
          canvasRef={canvasRef}
          handleStartRecording={startRecording}
          handleStopRecording={stopRecording}
          handleSendAudio={sendAudio}
          handlePlayPauseAudio={playPauseAudio}
          handleReset={resetRecording}
          duration={duration}
          formatTime={formatTime}
        />
      ) : (
        <TextInputForm handleStartRecording={startRecording} />
      )}
    </footer>
  );
};

export default MessageInputBar;
