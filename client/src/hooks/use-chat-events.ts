import { useCallback, useEffect, useRef } from "react";
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

  // Get the current DirectConversations from Redux
  const DirectConversations = useSelector(
    (state: RootState) => state.conversation.direct_chat.DirectConversations
  );

  // Create a ref to hold the latest DirectConversations
  const conversationsRef = useRef(DirectConversations);

  useEffect(() => {
    conversationsRef.current = DirectConversations;
  }, [DirectConversations]);

  const handleStartChat = useCallback(
    (data: DirectConversationProps) => {
      const existing = conversationsRef.current?.find(
        (el) => el._id === data._id
      );

      if (existing) {
        dispatch(updateDirectConversation(data));
      } else {
        dispatch(addDirectConversation(data));
      }
      dispatch(selectConversation({ chatId: data._id }));
    },
    [dispatch]
  );

  useEffect(() => {
    if (!enabled) return;

    socket.on("chat:start", handleStartChat);

    return () => {
      socket.off("chat:start", handleStartChat);
    };
  }, [enabled, handleStartChat]);
};
