import { useEffect } from "react";
import { socket } from "../socket";
import { useDispatch, useSelector } from "react-redux";
import { GroupMessageProps } from "../types";
import { group, individual } from "../utils/conversation-types";
import { RootState } from "../store/store";
import {
  addDirectConversation,
  addDirectMessage,
  addGroupConversation,
  addGroupMessage,
  updateDirectConversation,
  updateDirectMessageSeenStatus,
  updateDirectMessagesSeen,
  updateExistingDirectMessage,
  updateExistingGroupMessage,
  updateGroupConversation,
} from "../store/slices/conversation";
import { useGetConversationMutation } from "../store/slices/apiSlice";

export const useMessageEvents = (enabled: boolean) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { direct_chat, group_chat } = useSelector(
    (state: RootState) => state.conversation
  );
  const [getConversation, { data: conversationData }] =
    useGetConversationMutation();

  useEffect(() => {
    if (!conversationData) return;
    switch (conversationData?.data.messages[0]?.conversationType) {
      case individual:
        dispatch(
          addDirectConversation({
            auth: user,
            conversation: conversationData?.data,
          })
        );
        break;
      case group:
        dispatch(
          addGroupConversation({
            auth: user,
            conversation: conversationData?.data,
          })
        );
        break;
      default:
        break;
    }
  }, [conversationData]);

  useEffect(() => {
    if (!enabled) return;

    const handleNewMsg = (message: any) => {
      switch (message?.conversationType) {
        case individual:
          if (
            message?.conversationId.toString() ===
            direct_chat.current_direct_conversation?._id.toString()
          ) {
            socket.emit("msg_seen_byreciever", {
              messageId: message?._id,
              sender: message?.sender,
            });
            dispatch(
              addDirectMessage({
                _id: message?._id,
                messageType: message?.messageType,
                message: message?.message,
                createdAt: message?.createdAt,
                updatedAt: message?.updatedAt,
                isIncoming: message?.recipients === user?._id,
                isOutgoing: message?.sender === user?._id,
                status: "sent",
                isSeen: true,
                conversationId: message?.conversationId,
                conversationType: message?.conversationType,
              })
            );
          } else {
            socket.emit("update_unreadMsgs", message);
          }
          break;

        case group:
          if (
            message?.conversationId.toString() ===
            group_chat.current_group_conversation?._id.toString()
          ) {
            dispatch(
              addGroupMessage({
                _id: message?._id,
                messageType: message?.messageType,
                message: message?.message,
                createdAt: message?.createdAt,
                updatedAt: message?.updatedAt,
                isIncoming: message?.recipients.includes(user?._id),
                isOutgoing: message?.sender === user?._id,
                from: message?.sender,
                status: "sent",
                conversationId: message?.conversationId,
                conversationType: message?.conversationType,
              })
            );
          } else {
            socket.emit("update_unreadMsgs", message);
          }
          break;

        default:
          console.log("Unknown chat type");
          break;
      }
    };

    const handleUpdateMsgStatus = (
      message: GroupMessageProps & { conversationType: string }
    ) => {
      switch (message?.conversationType) {
        case individual:
          if (
            message?.conversationId?.toString() ===
            direct_chat.current_direct_conversation?._id.toString()
          ) {
            dispatch(updateExistingDirectMessage(message));
          }
          break;

        case group:
          if (
            message?.conversationId?.toString() ===
            group_chat.current_group_conversation?._id.toString()
          ) {
            dispatch(updateExistingGroupMessage(message));
          }
          break;

        default:
          console.log("Unknown chat type");
          break;
      }
    };

    const handleUpdateMsgSeen = (data: { messageId: string }) => {
      dispatch(updateDirectMessageSeenStatus(data));
    };

    const handleUpdateAllMsgSeenTrue = (conversationId: string) => {
      const conversation = direct_chat?.DirectConversations?.find(
        (conv) => conv?._id === conversationId
      );
      if (!conversation) return;
      dispatch(updateDirectConversation({ ...conversation, seen: true }));
      dispatch(updateDirectMessagesSeen({}));
    };

    const handleUnreadMsgs = async (message: any) => {
      switch (message?.conversationType) {
        case individual:
          const update_Direct_Conversation =
            direct_chat?.DirectConversations?.find(
              (el) => el._id == message?.conversationId
            );
          if (update_Direct_Conversation) {
            dispatch(
              updateDirectConversation({
                ...update_Direct_Conversation,
                message: {
                  type: message?.messageType,
                  message: message?.message,
                  createdAt: message?.createdAt,
                },
                isOutgoing: message?.sender === user?._id,
                time: message?.createdAt,
                unreadMessagesCount:
                  (update_Direct_Conversation?.unreadMessagesCount || 0) + 1,
              })
            );
          } else {
            await getConversation({
              conversationId: message?.conversationId,
              conversationType: message?.conversationType,
            });
          }
          break;
        case group:
          const update_Group_Conversation =
            group_chat?.GroupConversations?.find(
              (el) => el._id == message?.conversationId
            );
          if (update_Group_Conversation) {
            dispatch(
              updateGroupConversation({
                ...update_Group_Conversation,
                isOutgoing: message?.sender === user?._id,
                message: {
                  type: message?.messageType,
                  message: message?.message,
                  createdAt: message?.createdAt,
                },
                from: message?.sender,
                time: message?.createdAt,
                unreadMessagesCount:
                  (update_Group_Conversation?.unreadMessagesCount || 0) + 1,
              })
            );
          } else {
            await getConversation({
              conversationId: message?.conversationId,
              conversationType: message?.conversationType,
            });
          }
          break;
        default:
          break;
      }
    };
    socket.on("new_message", handleNewMsg);
    socket.on("update_msg_status", handleUpdateMsgStatus);
    socket.on("update_msg_seen", handleUpdateMsgSeen);
    socket.on("all_msg_seen", handleUpdateAllMsgSeenTrue);
    socket.on("on_update_unreadMsg", handleUnreadMsgs);

    return () => {
      socket.off("new_message", handleNewMsg);
      socket.off("update_msg_status", handleUpdateMsgStatus);
      socket.off("update_msg_seen", handleUpdateMsgSeen);
      socket.off("all_msg_seen", handleUpdateAllMsgSeenTrue);
      socket.off("on_update_unreadMsg", handleUnreadMsgs);
    };
  }, [
    enabled,
    direct_chat.DirectConversations,
    group_chat.GroupConversations,
    direct_chat.current_direct_conversation,
    group_chat.current_group_conversation,
  ]);
};
