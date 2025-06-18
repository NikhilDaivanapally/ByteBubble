// hooks/use-load-chat-messages.ts
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { socket } from "../socket";
import {
  setCurrentDirectMessages,
  setCurrentGroupMessages,
  setCurrentDirectConversation,
  setCurrentGroupConversation,
} from "../store/slices/conversation";
import {
  DirectConversationProps,
  DirectMessageProps,
  GroupConversationProps,
  GroupMessageProps,
  UserProps,
} from "../types";
import { direct, group } from "../utils/conversation-types";

const useLoadChatMessages = ({
  activeChatId,
  chatType,
  user,
  directConversations,
  groupConversations,
  setIsLoading,
}: {
  activeChatId: string | null;
  chatType: string | null;
  user: UserProps | null;
  directConversations: DirectConversationProps[] | null;
  groupConversations: GroupConversationProps[] | null;
  setIsLoading: (val: boolean) => void;
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!activeChatId) return;
    setIsLoading(true);

    if (chatType === direct) {
      const currentChat = directConversations?.find(
        (el) => el?._id === activeChatId
      );

      if (currentChat) {
        socket.emit(
          "messages:get",
          {
            conversationId: currentChat._id,
            chatType,
            authUserId: user?._id,
          },
          (data: DirectMessageProps) => {
            dispatch(setCurrentDirectMessages(data));
            setIsLoading(false);
          }
        );
        dispatch(setCurrentDirectConversation(currentChat));
      } else {
        setIsLoading(false);
      }
    } else if (chatType === group) {
      const currentChat = groupConversations?.find(
        (el) => el?._id === activeChatId
      );

      if (currentChat) {
        socket.emit(
          "group:messages:get",
          {
            conversationId: currentChat._id,
            chatType,
            authUserId: user?._id,
          },
          (data: GroupMessageProps) => {
            dispatch(setCurrentGroupMessages(data));
            setIsLoading(false);
          }
        );
        dispatch(setCurrentGroupConversation(currentChat));
      } else {
        setIsLoading(false);
      }
    }
  }, [activeChatId]);
};

export default useLoadChatMessages;
