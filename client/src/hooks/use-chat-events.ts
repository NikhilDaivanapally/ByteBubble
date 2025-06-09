import { useEffect } from "react";
import { socket } from "../socket";
import { useDispatch, useSelector } from "react-redux";
import { DirectConversationProps } from "../types";
import { RootState } from "../store/store";
import {
  addDirectConversation,
  updateDirectConversation,
} from "../store/slices/conversation";
import { selectConversation } from "../store/slices/appSlice";
export const useChatEvents = (enabled: boolean) => {
  const dispatch = useDispatch();
  const { DirectConversations } = useSelector(
    (state: RootState) => state.conversation.direct_chat
  );
  useEffect(() => {
    if (!enabled) return;
    const handleStartChat = (data: DirectConversationProps) => {
      console.log(data);
      const existing = DirectConversations?.find((el) => el._id === data._id);
      if (existing) {
        dispatch(updateDirectConversation(data));
      } else {
        dispatch(addDirectConversation(data));
      }
      dispatch(selectConversation({ chatId: data._id }));
    };

    socket.on("chat:start", handleStartChat);
    return () => {
      socket.off("chat:start", handleStartChat);
    };
  }, [enabled, DirectConversations]);
};
