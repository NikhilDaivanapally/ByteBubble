const formatDirectMessages = (messages: any, authUserId: string) => {
  return messages?.map((el: any) => {
    return {
      id: el?._id,
      type: el?.messageType,
      message: el?.message,
      createdAt: el?.createdAt,
      updateAt: el?.updateAt,
      incoming: el?.recipients == authUserId,
      outgoing: el?.sender == authUserId,
      status: "sent",
      seen: el?.isRead,
    };
  });
};

const formatGroupMessages = (messages: any, authUserId: string) => {
  return messages?.map((el: any) => {
    return {
      id: el?._id,
      type: el?.messageType,
      message: el?.message,
      createdAt: el?.createdAt,
      updateAt: el?.updateAt,
      incoming: el?.recipients.includes(authUserId),
      outgoing: el?.sender == authUserId,
      from: el?.sender,
      status: "sent",
      conversationId: el?.conversationId,
      seen: el?.isRead,
    };
  });
};

export { formatDirectMessages, formatGroupMessages };
