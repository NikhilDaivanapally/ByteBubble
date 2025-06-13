import { useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import useRecording from "../../hooks/use-recording";
import AudioRecorderUI from "./AudioRecorderUI";
import TextInputForm from "./TextInputForm";

const MessageInputBar = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const {
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
  } = useRecording(canvasRef);

  const isChatActive = useSelector(
    (state: RootState) => !!state.app.activeChatId
  );

  if (!isChatActive) return null;

  return isRecording ? (
    <AudioRecorderUI
      audioUrl={audioUrl}
      recordingTime={recordingTime}
      currentTime={currentTime}
      isPlaying={isPlaying}
      recordingState={recordingState}
      audioRef={audioRef}
      canvasRef={canvasRef}
      handlePlayPauseAudio={handlePlayPauseAudio}
      handleRecording={handleRecording}
      handleSendAudio={handleSendAudio}
    />
  ) : (
    <TextInputForm handleRecording={handleRecording} />
  );
};

export default MessageInputBar;
