import { useEffect, useCallback } from "react";
import { socket } from "../socket";
import { useDispatch, useSelector } from "react-redux";
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
  updateGroupMessageSeenStatus,
  updateGroupMessagesSeen,
} from "../store/slices/conversation";
import { useGetConversationMutation } from "../store/slices/apiSlice";
import { GroupMessageProps } from "../types";
import { individual, group } from "../utils/conversation-types";

// Private message events
export const useMessageEvents = (enabled: boolean) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { direct_chat, group_chat } = useSelector(
    (state: RootState) => state.conversation
  );
  const [getConversation, { data: conversationData }] =
    useGetConversationMutation();

  // Update Redux when a new conversation is fetched
  useEffect(() => {
    if (!conversationData) return;
    const { conversationType, conversation } = conversationData.data;

    if (conversationType === individual) {
      dispatch(addDirectConversation(conversation));
    } else if (conversationType === group) {
      dispatch(addGroupConversation(conversation));
    }
  }, [conversationData, dispatch]);

  const isCurrentConversation = useCallback(
    (conversationId: string, type: string) => {
      const current =
        type === individual
          ? direct_chat.current_direct_conversation
          : group_chat.current_group_conversation;
      return current?._id?.toString() === conversationId.toString();
    },
    [direct_chat, group_chat]
  );

  const handleNewMsg = useCallback(
    (message: any) => {
      const {
        _id,
        senderId,
        recipientId,
        conversationId,
        conversationType,
        message: msgContent,
        messageType,
        createdAt,
        updatedAt,
      } = message;

      if (isCurrentConversation(conversationId, individual)) {
        socket.emit("message:seen", { _id, senderId });
        dispatch(
          addDirectMessage({
            _id,
            message: msgContent,
            messageType,
            createdAt,
            updatedAt,
            isIncoming: true,
            isOutgoing: false,
            isSeen: true,
            status: "sent",
            conversationId,
            conversationType,
          })
        );
      } else {
        socket.emit("message:unread:update", message);
      }
    },
    [dispatch, isCurrentConversation, user]
  );

  const handleMarkMessageAsSent = useCallback(
    (message: GroupMessageProps & { conversationType: string }) => {
      const { conversationId, conversationType } = message;
      if (
        conversationType === individual &&
        isCurrentConversation(conversationId, individual)
      ) {
        dispatch(updateExistingDirectMessage(message));
      }
    },
    [dispatch, isCurrentConversation]
  );

  const handleMarkMessageAsSeen = useCallback(
    (data: { messageId: string }) => {
      dispatch(updateDirectMessageSeenStatus(data));
    },
    [dispatch]
  );

  const handleMarkAllMessagesAsSeen = useCallback(
    (conversationId: string) => {
      const conversation = direct_chat?.DirectConversations?.find(
        (conv) => conv?._id === conversationId
      );
      if (!conversation) return;

      dispatch(updateDirectConversation({ ...conversation, isSeen: true }));
      dispatch(updateDirectMessagesSeen({}));
    },
    [dispatch, direct_chat]
  );

  const handleMarkMessageAsUnread = useCallback(
    async (message: any) => {
      console.log(message);
      const { conversationId, conversationType } = message;

      const existingConversation = direct_chat?.DirectConversations?.find(
        (conv) => conv?._id === conversationId
      );
      if (!existingConversation) {
        try {
          await getConversation({ conversationId, conversationType });
        } catch (err) {
          console.error("Failed to fetch missing conversation", err);
        }
      } else {
        dispatch(
          updateDirectConversation({
            ...existingConversation,
            message: {
              messageType: message?.messageType,
              message: message?.message,
              createdAt: message?.createdAt,
            },
            isOutgoing: message?.senderId === user?._id,
            time: message?.createdAt,
            unreadMessagesCount:
              (existingConversation?.unreadMessagesCount || 0) + 1,
          })
        );
      }
    },
    [direct_chat, getConversation]
  );

  useEffect(() => {
    if (!enabled) return;
    // private message events
    socket.on("message:new", handleNewMsg);
    socket.on("message:status:sent", handleMarkMessageAsSent);
    socket.on("message:status:seen", handleMarkMessageAsSeen);
    socket.on("messages:status:seen", handleMarkAllMessagesAsSeen);
    socket.on("messages:unread:count", handleMarkMessageAsUnread);

    return () => {
      socket.off("message:new", handleNewMsg);
      socket.off("message:status:sent", handleMarkMessageAsSent);
      socket.off("message:status:seen", handleMarkMessageAsSeen);
      socket.off("messages:status:seen", handleMarkAllMessagesAsSeen);
      socket.off("messages:unread:count", handleMarkMessageAsUnread);
    };
  }, [
    enabled,
    handleNewMsg,
    handleMarkMessageAsSent,
    handleMarkMessageAsSeen,
    handleMarkAllMessagesAsSeen,
    handleMarkMessageAsUnread,
  ]);
};

// Group message events
export const useGroupMessageEvents = (enabled: boolean) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { direct_chat, group_chat } = useSelector(
    (state: RootState) => state.conversation
  );
  const [getConversation, { data: conversationData }] =
    useGetConversationMutation();

  // Update Redux when a new conversation is fetched
  useEffect(() => {
    if (!conversationData) return;
    const { conversationType, conversation } = conversationData.data;

    if (conversationType === individual) {
      dispatch(addDirectConversation(conversation));
    } else if (conversationType === group) {
      dispatch(addGroupConversation(conversation));
    }
  }, [conversationData, dispatch]);

  const isCurrentConversation = useCallback(
    (conversationId: string, type: string) => {
      const current =
        type === individual
          ? direct_chat.current_direct_conversation
          : group_chat.current_group_conversation;
      return current?._id?.toString() === conversationId.toString();
    },
    [direct_chat, group_chat]
  );

  const handleNewGroupMessage = useCallback(
    (message: any) => {
      const {
        _id,
        senderId,
        recipientsIds,
        conversationId,
        conversationType,
        message: msgContent,
        messageType,
        createdAt,
        updatedAt,
      } = message;

      const isIncoming = Array.isArray(recipientsIds)
        ? recipientsIds.includes(user?._id)
        : recipientsIds === user?._id;

      const isOutgoing = senderId === user?._id;

      if (isCurrentConversation(conversationId, group)) {
        socket.emit("group:message:seen", {
          messageId: _id,
          senderId,
          user: {
            userId: user?._id,
            isSeen: true,
            seenAt: new Date().toISOString(),
          },
        });
        dispatch(
          addGroupMessage({
            _id,
            message: msgContent,
            messageType,
            createdAt,
            updatedAt,
            isIncoming,
            isOutgoing,
            status: "sent",
            from: senderId,
            conversationId,
            conversationType,
          })
        );
      } else {
        socket.emit("group:message:unread:update", message);
      }
    },
    [dispatch, isCurrentConversation, user]
  );
  const handleMarkGroupMessageAsSent = useCallback(
    (message: GroupMessageProps & { conversationType: string }) => {
      const { conversationId, conversationType } = message;
      if (
        conversationType === group &&
        isCurrentConversation(conversationId, group)
      ) {
        dispatch(updateExistingGroupMessage(message));
      }
    },
    [dispatch, isCurrentConversation]
  );

  const handleMarkGroupMessageAsSeen = useCallback(
    (data: any) => {
      dispatch(updateGroupMessageSeenStatus(data));
    },
    [dispatch]
  );

  const handleMarkAllGroupMessagesAsSeen = useCallback(
    ({ conversationId, user }: any) => {
      console.log(conversationId, user);
      const conversation = group_chat?.GroupConversations?.find(
        (conv) => conv?._id === conversationId
      );
      if (!conversation) return;
      console.log(conversationId, conversation, user);
      const seenList = conversation.isSeen || [];

      const alreadySeen = seenList?.some(
        (u: { userId: string }) => u?.userId === user?.userId
      );
      if (!alreadySeen) {
        dispatch(
          updateGroupConversation({
            ...conversation,
            isSeen: [...(conversation?.isSeen || []), user],
          })
        );
      }
      dispatch(updateGroupMessagesSeen({ user }));
    },
    [dispatch, group_chat]
  );

  const handleMarkGroupMessageAsUnread = useCallback(
    async (message: any) => {
      console.log(message);
      const { conversationId, conversationType } = message;

      const existingConversation = group_chat?.GroupConversations?.find(
        (conv) => conv?._id === conversationId
      );
      if (!existingConversation) {
        try {
          await getConversation({ conversationId, conversationType });
        } catch (err) {
          console.error("Failed to fetch missing conversation", err);
        }
      } else {
        const foundUser = [
          ...existingConversation.users,
          existingConversation.admin,
        ].find((user) => user?._id == message?.senderId);

        dispatch(
          updateGroupConversation({
            ...existingConversation,
            isOutgoing: message?.sender === user?._id,
            message: {
              messageType: message?.messageType,
              message: message?.message,
              createdAt: message?.createdAt,
            },
            from: {
              _id: foundUser?._id,
              avatar: foundUser?.avatar,
              userName: foundUser?.userName,
            },
            time: message?.createdAt,
            unreadMessagesCount:
              (existingConversation?.unreadMessagesCount || 0) + 1,
          })
        );
      }
    },
    [group_chat, getConversation]
  );

  useEffect(() => {
    if (!enabled) return;
    // group message events
    socket.on("group:message:new", handleNewGroupMessage);
    socket.on("group:message:status:sent", handleMarkGroupMessageAsSent);
    socket.on("group:message:status:seen", handleMarkGroupMessageAsSeen);
    socket.on("group:messages:status:seen", handleMarkAllGroupMessagesAsSeen);
    socket.on("group:messages:unread:count", handleMarkGroupMessageAsUnread);
    return () => {
      socket.off("group:message:new", handleNewGroupMessage);
      socket.off("group:message:status:sent", handleMarkGroupMessageAsSent);
      socket.off("group:message:status:seen", handleMarkGroupMessageAsSeen);
      socket.off(
        "group:messages:status:seen",
        handleMarkAllGroupMessagesAsSeen
      );
      socket.off("group:messages:unread:count", handleMarkGroupMessageAsUnread);
    };
  }, [
    enabled,
    handleNewGroupMessage,
    handleMarkGroupMessageAsSent,
    handleMarkGroupMessageAsSeen,
    handleMarkAllGroupMessagesAsSeen,
    handleMarkGroupMessageAsUnread,
  ]);
};
