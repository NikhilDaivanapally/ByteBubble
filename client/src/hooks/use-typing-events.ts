import { useEffect } from "react";
import { socket } from "../socket";
import { useDispatch } from "react-redux";
import { setIsTyping } from "../store/slices/appSlice";

export const useTypingEvents = (enabled: boolean) => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (!enabled) return;
    const handleTyping = (data: { userName: string; roomId: string }) => {
      dispatch(setIsTyping(data));
    };
    const handleStopTyping = () => {
      dispatch(setIsTyping({ userName: "", roomId: null }));
    };
    socket.on("user:typing:start", handleTyping);
    socket.on("user:typing:stop", handleStopTyping);
    return () => {
      socket.off("user:typing:start");
      socket.off("user:typing:stop");
    };
  }, [enabled]);
};
