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
    socket.on("userTyping", handleTyping);
    socket.on("userStoppedTyping", handleStopTyping);
    return () => {
      socket.off("userTyping");
      socket.off("userStoppedTyping");
    };
  }, [enabled]);
};
