import mongoose from "mongoose";
import { AggregatedGroupConversation } from "../types/aggregated-response/conversation/group-conversation-aggregate.type";
import { AggregatedDirectConversation } from "../types/aggregated-response/conversation/direct-conversation-aggregate.type";

const formatDirectConversations = (
  conversations: AggregatedDirectConversation[],
  authUserId: string
) => {
  if (!Array.isArray(conversations)) return [];

  const formatted = conversations.map((el) => {
    const messages = el?.messages || [];
    const lastMessage = messages?.slice(-1)[0];
    const unreadMessages = messages?.filter(
      (msg) =>
        msg?.recipient?.toString() === authUserId?.toString() &&
        msg?.isRead === false
    );
    return {
      _id: el._id,
      userId: el.user._id,
      name: el.user.userName,
      avatar: el.user?.avatar,
      meta: el.meta,
      isOnline: el.user?.status === "Online",
      message: {
        messageType: lastMessage?.messageType,
        systemEventType: lastMessage?.systemEventType,
        message: lastMessage?.message,
        metadata: lastMessage?.metadata,
        eventUserSnapshot: lastMessage?.eventUserSnapshot,
        isEdited: lastMessage?.isEdited,
        editedAt: lastMessage?.editedAt,
        deletedFor: lastMessage?.deletedFor,
        isDeletedForEveryone: lastMessage?.isDeletedForEveryone,
        createdAt: lastMessage?.createdAt,
      },
      unreadMessagesCount: unreadMessages?.length || 0,
      isRead: lastMessage?.isRead,
      isOutgoing: lastMessage?.sender?.toString() === authUserId.toString(),
      time: lastMessage?.createdAt,
      about: el.user?.about,
    };
  });
  return formatted
    .filter(Boolean)
    .sort(
      (a: any, b: any) =>
        new Date(b.time).getTime() - new Date(a.time).getTime()
    );
};
const formatGroupConversations = (
  conversations: AggregatedGroupConversation[],
  authUserId: string
) => {
  if (!Array.isArray(conversations)) return [];

  const formatted = conversations.map((el) => {
    const messages = el.messages || [];
    const lastMessage = messages.slice(-1)[0];
    const unreadMessages = messages?.filter((msg) => {
      // Skip if the user is the sender
      if (msg.sender?._id?.toString?.() === authUserId.toString()) return false;

      // Skip if the user is not in the recipients
      if (
        !msg.recipients?.some?.(
          (r) => r?.toString?.() === authUserId.toString()
        )
      )
        return false;

      const readBy = msg.readBy ?? [];

      // Include if user hasn't read the message
      const hasRead = readBy.some(
        (el) =>
          el?.userId?.toString?.() === authUserId.toString() &&
          el?.isRead === true
      );

      return !hasRead;
    });

    return {
      _id: el._id,
      name: el.name,
      avatar: el?.avatar,
      about: el.about,
      users: el.participants,
      createdBy: el.createdBy,
      admins: el.admins,
      meta: el.meta,
      message: {
        messageType: lastMessage?.messageType,
        systemEventType: lastMessage?.systemEventType,
        message: lastMessage?.message || "",
        metadata: lastMessage?.metadata,
        eventUserSnapshot: lastMessage?.eventUserSnapshot,
        isEdited: lastMessage?.isEdited,
        editedAt: lastMessage?.editedAt,
        deletedFor: lastMessage?.deletedFor,
        isDeletedForEveryone: lastMessage?.isDeletedForEveryone,
        createdAt: lastMessage?.createdAt,
      },
      from: lastMessage?.sender || "",
      isOutgoing:
        lastMessage?.sender?._id?.toString() === authUserId?.toString(),
      time: lastMessage?.createdAt,
      unreadMessagesCount: unreadMessages.length,
      readBy: lastMessage?.readBy,
    };
  });

  const hasLastMessage = formatted
    .filter((el) => el?.message.message && el?.time)
    .sort(
      (a: any, b: any) =>
        new Date(b.time).getTime() - new Date(a.time).getTime()
    );

  const hasNoLastMessage = formatted.filter(
    (el) => !el?.message.message || !el?.time
  );
  return [...hasLastMessage, ...hasNoLastMessage];
};

export { formatDirectConversations, formatGroupConversations };
