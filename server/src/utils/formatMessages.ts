import { DirectMessageDoc } from "../types/model/message/direct-message-model.type";
import { GroupMessageDoc } from "../types/model/message/group-message-model.type";

const formatDirectMessages = (
  messages: DirectMessageDoc[],
  authUserId: string
) => {
  return messages?.map((el: DirectMessageDoc) => {
    return {
      _id: el?._id,
      messageType: el?.messageType,
      message: el?.message,
      isIncoming: el?.recipient.toString() == authUserId,
      isOutgoing: el?.sender.toString() == authUserId,
      status: "sent",
      isRead: el?.isRead,
      conversationId: el?.conversationId,
      deletedFor: el?.deletedFor,
      isDeletedForEveryone: el?.isDeletedForEveryone,
      reactions: el?.reactions,
      isEdited: el?.isEdited,
      editedAt: el?.editedAt,
      systemEventType: el?.systemEventType,
      metadata: el?.metadata,
      eventUserSnapshot: el.eventUserSnapshot,
      createdAt: el?.createdAt,
      updatedAt: el?.updatedAt,
    };
  });
};

const formatGroupMessages = (
  messages: GroupMessageDoc[],
  authUserId: string
) => {
  return messages?.map((el: any) => {
    console.log(el.sender,authUserId)
    return {
      _id: el?._id,
      messageType: el?.messageType,
      message: el?.message,
      isIncoming: el?.recipients.includes(authUserId),
      isOutgoing: el?.sender._id.toString() == authUserId,
      from: el?.sender,
      status: "sent",
      readBy: el?.readBy,
      conversationId: el?.conversationId,
      deletedFor: el?.deletedFor,
      isDeletedForEveryone: el?.isDeletedForEveryone,
      reactions: el?.reactions,
      isEdited: el?.isEdited,
      editedAt: el?.editedAt,
      systemEventType: el?.systemEventType,
      metadata: el?.metadata,
      eventUserSnapshot: el.eventUserSnapshot,
      createdAt: el?.createdAt,
      updatedAt: el?.updatedAt,
    };
  });
};

export { formatDirectMessages, formatGroupMessages };
