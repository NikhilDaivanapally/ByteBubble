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
import {
  useGetDirectConversationMutation,
  useGetGroupConversationMutation,
} from "../store/slices/apiSlice";
import { playSound } from "../utils/soundPlayer";

// Private message events
export const useMessageEvents = (enabled: boolean) => {
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.auth.user);
  const { direct_chat } = useSelector((state: RootState) => state.conversation);
  const isAppSounds = useSelector(
    (state: RootState) => state.settings.data.notifications.messages.inAppSounds
  );
  const [getDirectConversation, { data: conversationData }] =
    useGetDirectConversationMutation();

  // Update Redux when a new conversation is fetched
  useEffect(() => {
    if (!conversationData) return;
    const { conversation } = conversationData.data;
    dispatch(addDirectConversation(conversation));
  }, [conversationData, dispatch]);

  const isCurrentConversation = useCallback(
    (conversationId: string) =>
      direct_chat.current_direct_conversation?._id === conversationId,
    [direct_chat]
  );

  const handleNewMsg = useCallback(
    (message: any) => {
      const {
        _id,
        senderId,
        conversationId,
        message: msgContent,
        messageType,
        createdAt,
        updatedAt,
      } = message;
      const isCurrent = isCurrentConversation(conversationId);

      if (isCurrent) {
        dispatch(
          addDirectMessage({
            _id,
            message: msgContent,
            messageType,
            isIncoming: true,
            isOutgoing: false,
            isRead: true,
            status: "sent",
            conversationId,
            deletedFor: [],
            isDeletedForEveryone: [],
            reactions: [],
            isEdited: false,
            createdAt,
            updatedAt,
          })
        );
        if (isAppSounds) {
          playSound("messageReceive");
        }
        socket.emit("message:seen", { _id, senderId });
      } else {
        socket.emit("message:unread:update", message);
      }
    },
    [dispatch, isCurrentConversation]
  );

  const handleMarkMessageAsSent = useCallback(
    (message: any) => {
      if (isCurrentConversation(message.conversationId)) {
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

      dispatch(updateDirectConversation({ ...conversation, isRead: true }));
      dispatch(updateDirectMessagesSeen({}));
    },
    [dispatch, direct_chat]
  );

  const handleMarkMessageAsUnread = useCallback(
    async (message: any) => {
      const { conversationId } = message;

      const existingConversation = direct_chat?.DirectConversations?.find(
        (conv) => conv?._id === conversationId
      );
      if (!existingConversation) {
        try {
          await getDirectConversation({ conversationId });
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
        if (isAppSounds) {
          playSound("incomingUnreadMessage");
        }
      }
    },
    [direct_chat, getDirectConversation]
  );

  useEffect(() => {
    if (!enabled) return;

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
  const { group_chat } = useSelector((state: RootState) => state.conversation);
  const inAppSounds = useSelector(
    (state: RootState) =>
      state.settings.data.notifications.groupChats.inAppSounds
  );
  const [getGroupConversation, { data: conversationData }] =
    useGetGroupConversationMutation();

  // Update Redux when a new conversation is fetched
  useEffect(() => {
    if (!conversationData) return;
    const { conversation } = conversationData.data;
    dispatch(addGroupConversation(conversation));
  }, [conversationData, dispatch]);

  const isCurrentConversation = useCallback(
    (conversationId: string) =>
      group_chat.current_group_conversation?._id === conversationId,
    [group_chat]
  );

  const handleNewGroupMessage = useCallback(
    (message: any) => {
      const isIncoming = message?.recipientsIds?.includes(user?._id);
      const isOutgoing = message?.senderId === user?._id;

      if (isCurrentConversation(message?.conversationId)) {
        socket.emit("group:message:seen", {
          messageId: message?._id,
          senderId: message?.senderId,
          user: {
            userId: user?._id,
            isRead: true,
            seenAt: new Date().toISOString(),
          },
        });
        dispatch(
          addGroupMessage({
            ...message,
            isIncoming,
            isOutgoing,
            status: "sent",
            readBy: [],
            deletedFor: [],
            isDeletedForEveryone: [],
            reactions: [],
            isEdited: false,
          })
        );
        if (inAppSounds) {
          playSound("messageReceive");
        }
      } else {
        socket.emit("group:message:unread:update", message);
      }
    },
    [dispatch, isCurrentConversation, user]
  );

  const handleMarkGroupMessageAsSent = useCallback(
    (message: any) => {
      if (isCurrentConversation(message.conversationId)) {
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
      const conversation = group_chat.GroupConversations?.find(
        (conv) => conv._id === conversationId
      );
      if (!conversation) return;

      const alreadySeen = (conversation.readBy || []).some(
        (u: any) => u?.userId === user?.userId
      );
      if (!alreadySeen) {
        dispatch(
          updateGroupConversation({
            ...conversation,
            readBy: [...(conversation.readBy || []), user],
          })
        );
      }
      dispatch(updateGroupMessagesSeen({ user }));
    },
    [dispatch, group_chat]
  );

  const handleMarkGroupMessageAsUnread = useCallback(
    async (message: any) => {
      const { conversationId } = message;
      const existing = group_chat.GroupConversations?.find(
        (conv) => conv._id === conversationId
      );

      if (!existing) {
        try {
          await getGroupConversation({ conversationId });
        } catch (err) {
          console.error("Failed to fetch group conversation", err);
        }
      } else {
        dispatch(
          updateGroupConversation({
            ...existing,
            isOutgoing: message?.senderId === user?._id,
            message: {
              messageType: message?.messageType,
              message: message?.message,
              createdAt: message?.createdAt,
            },
            from: message?.from,
            time: message?.createdAt,
            unreadMessagesCount: (existing.unreadMessagesCount || 0) + 1,
          })
        );
        if (inAppSounds) {
          playSound("incomingUnreadMessage");
        }
      }
    },
    [group_chat, dispatch, getGroupConversation, user]
  );

  useEffect(() => {
    if (!enabled) return;

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
