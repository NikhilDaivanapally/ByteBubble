import { DirectMessageDoc } from "../types/message/direct-message.type";
import { GroupMessageDoc } from "../types/message/group-message.type";

const formatDirectMessages = (
  messages: DirectMessageDoc[],
  authUserId: string
) => {
  return messages?.map((el: any) => {
    return {
      _id: el?._id,
      messageType: el?.messageType,
      message: el?.message,
      createdAt: el?.createdAt,
      updatedAt: el?.updatedAt,
      isIncoming: el?.recipients == authUserId,
      isOutgoing: el?.sender == authUserId,
      status: "sent",
      isSeen: el?.isRead,
      conversationType: el?.conversationType,
      conversationId: el?.conversationId,
    };
  });
};

const formatGroupMessages = (
  messages: GroupMessageDoc[],
  authUserId: string
) => {
  return messages?.map((el: any) => {
    return {
      _id: el?._id,
      messageType: el?.messageType,
      message: el?.message,
      createdAt: el?.createdAt,
      updatedAt: el?.updatedAt,
      isIncoming: el?.recipients.includes(authUserId),
      isOutgoing: el?.sender == authUserId,
      from: el?.sender,
      status: "sent",
      isSeen: el?.isRead,
      conversationType: el?.conversationType,
      conversationId: el?.conversationId,
    };
  });
};

export { formatDirectMessages, formatGroupMessages };
