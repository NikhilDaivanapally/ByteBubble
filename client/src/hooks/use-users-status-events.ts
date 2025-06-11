import { useCallback, useEffect, useRef } from "react";
import { socket } from "../socket";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { updateDirectConversation } from "../store/slices/conversation";

export const useUsersStatusEvents = (enabled: boolean) => {
  const dispatch = useDispatch();
  const DirectConversations = useSelector(
    (state: RootState) => state.conversation.direct_chat.DirectConversations
  );

  const directConversationsRef = useRef(DirectConversations);
  useEffect(() => {
    directConversationsRef.current = DirectConversations;
  }, [DirectConversations]);

  const handleUserOnline = useCallback(
    ({ id }: { id: string }) => {
      const updateConversation = directConversationsRef.current?.find(
        (el) => el?.userId == id
      );
      if (updateConversation) {
        dispatch(
          updateDirectConversation({ ...updateConversation, isOnline: true })
        );
      }
    },
    [dispatch]
  );

  const handleUserOffline = useCallback(
    ({ id }: { id: string }) => {
      const updateConversation = directConversationsRef.current?.find(
        (el) => el?.userId == id
      );
      dispatch(
        updateDirectConversation({
          ...updateConversation,
          isOnline: false,
        })
      );
    },
    [dispatch]
  );

  useEffect(() => {
    if (!enabled) return;

    socket.on("user:online", handleUserOnline);
    socket.on("user:offline", handleUserOffline);
    return () => {
      socket.off("user:online", handleUserOnline);
      socket.off("user:offline", handleUserOffline);
    };
  }, [enabled, handleUserOnline, handleUserOffline]);
};
