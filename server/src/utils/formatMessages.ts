import { Message } from "../types/message.type";

const formatDirectMessages = (messages: Message[], authUserId: string) => {
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

const formatGroupMessages = (messages: Message[], authUserId: string) => {
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
