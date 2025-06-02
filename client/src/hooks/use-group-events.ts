import { useEffect } from "react";
import { socket } from "../socket";
import { useDispatch } from "react-redux";
import { selectConversation, setIsTyping } from "../store/slices/appSlice";
import { GroupConversationProps } from "../types";
import { addGroupConversation } from "../store/slices/conversation";

export const useGroupEvents = (enabled: boolean) => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (!enabled) return;
    // const handleTyping = (data: { userName: string; roomId: string }) => {
    //   dispatch(setIsTyping(data));
    // };
    // const handleStopTyping = () => {
    //   dispatch(setIsTyping({ userName: "", roomId: null }));
    // };
    // socket.on("user:typing:start", handleTyping);
    // socket.on("user:typing:stop", handleStopTyping);
    const handleAddGroupConversation = (
      conversation: GroupConversationProps
    ) => {
      dispatch(addGroupConversation(conversation));
      dispatch(selectConversation(conversation._id));
    };
    socket.on("group:new", handleAddGroupConversation);
    socket.on("group:new:admin", handleAddGroupConversation);
    return () => {
      socket.off("user:typing:start");
      socket.off("user:typing:stop");
    };
  }, [enabled]);
};
