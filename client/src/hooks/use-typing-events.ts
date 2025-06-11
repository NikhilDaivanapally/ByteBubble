import { useEffect, useCallback } from "react";
import { socket } from "../socket";
import { useDispatch } from "react-redux";
import { setIsTyping } from "../store/slices/appSlice";

export const useTypingEvents = (enabled: boolean) => {
  const dispatch = useDispatch();

  const handleTyping = useCallback(
    (data: { userName: string; roomId: string }) => {
      dispatch(setIsTyping(data));
    },
    [dispatch]
  );

  const handleStopTyping = useCallback(() => {
    dispatch(setIsTyping({ userName: "", roomId: null }));
  }, [dispatch]);

  useEffect(() => {
    if (!enabled) return;

    socket.on("user:typing:start", handleTyping);
    socket.on("user:typing:stop", handleStopTyping);

    return () => {
      socket.off("user:typing:start", handleTyping);
      socket.off("user:typing:stop", handleStopTyping);
    };
  }, [enabled, handleTyping, handleStopTyping]);
};
