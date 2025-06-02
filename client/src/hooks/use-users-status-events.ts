import { useEffect } from "react";
import { socket } from "../socket";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { updateDirectConversation } from "../store/slices/conversation";

export const useUsersStatusEvents = (enabled: boolean) => {
  const dispatch = useDispatch();
  const { direct_chat } = useSelector((state: RootState) => state.conversation);

  useEffect(() => {
    if (!enabled) return;

    const handleUserOnline = ({ id }: { id: string }) => {
      const updateConversation = direct_chat.DirectConversations?.find(
        (el) => el?.userId == id
      );
      dispatch(
        updateDirectConversation({
          ...updateConversation,
          isOnline: true,
        })
      );
    };
    const handleUserOffline = ({ id }: { id: string }) => {
      const updateConversation = direct_chat.DirectConversations?.find(
        (el) => el?.userId == id
      );
      dispatch(
        updateDirectConversation({
          ...updateConversation,
          isOnline: false,
        })
      );
    };
    socket.on("user:online", handleUserOnline);
    socket.on("user:offline", handleUserOffline);
    return () => {
      socket.off("user:online", handleUserOnline);
      socket.off("user:offline", handleUserOffline);
    };
  }, [enabled, direct_chat.DirectConversations]);
};
