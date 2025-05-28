type DirectMessage = {
  _id: string;
  sender: string;
  recipients: string;
  isRead: boolean;
  message: {
    _id: string;
    text?: string;
    audioId?: string;
    photoUrl?: string;
    description?: string;
  };
  messageType: string;
  createdAt: string;
};

type GroupMessage = {
  _id: string;
  sender: {
    _id: string;
    userName: string;
    avatar: string;
  };
  recipients: string[];
  isRead: boolean;
  message: {
    _id: string;
    text?: string;
    audioId?: string;
    photoUrl?: string;
    description?: string;
  };
  messageType: string;
  createdAt: string;
};

type User = {
  _id: string;
  userName: string;
  email: string;
  gender: string;
  avatar?: string;
  about?: string;
  createdAt: string;
  updatedAt: string;
  status: "Online" | "Offline" | string;
};

type DirectConversationInput = {
  _id: string;
  user: User;
  messages: DirectMessage[];
};

type GroupConversationInput = {
  _id: string;
  admin: User;
  participants: User[];
  groupName: string;
  groupImage: string;
  createdAt: string;
  updatedAt: string;
  messages: GroupMessage[];
};

const formatDirectConversations = (
  conversations: DirectConversationInput[],
  authUserId: string
) => {
  if (!Array.isArray(conversations)) return [];

  const formatted = conversations.map((el) => {
    const messages = el.messages || [];
    const lastMessage = messages.slice(-1)[0];
    const unreadMessages = messages.filter(
      (msg) =>
        msg.recipients?.toString() === authUserId.toString() &&
        msg.isRead === false
    );

    if (!lastMessage) return null;

    return {
      id: el._id,
      userId: el.user?._id,
      name: el.user?.userName,
      online: el.user?.status === "Online",
      avatar: el.user?.avatar,
      message: {
        type: lastMessage.messageType || "",
        message: lastMessage.message || "",
        createdAt: lastMessage.createdAt || "",
      },
      unread: unreadMessages.length || 0,
      seen: lastMessage?.isRead || "",
      outgoing: lastMessage?.sender?.toString() === authUserId.toString() || "",
      time: lastMessage?.createdAt || "",
      pinned: false,
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
  conversations: GroupConversationInput[],
  authUserId: string
) => {
  if (!Array.isArray(conversations)) return [];

  const formatted = conversations.map((el) => {
    const messages = el.messages || [];
    const lastMessage = messages.slice(-1)[0];
    const unreadMessages = messages?.filter(
      (msg) =>
        msg.recipients?.toString() === authUserId.toString() &&
        msg.isRead === false
    );

    if (!lastMessage) return null;

    return {
      id: el?._id,
      groupName: el?.groupName,
      groupImage: el?.groupImage,
      users: el?.participants,
      admin: el?.admin,
      message: {
        type: lastMessage?.messageType || "",
        message: lastMessage?.message || "",
        createdAt: lastMessage?.createdAt || "",
      },
      from: lastMessage?.sender || "",
      outgoing:
        lastMessage?.sender?._id?.toString() === authUserId?.toString() || null,
      time: lastMessage?.createdAt || "",
      unread: unreadMessages?.length,
      seen: lastMessage?.isRead || "",
    };
  });

  const hasLastMessage = formatted
    .filter((el) => el?.message.message && el?.time)
    .sort(
      (a: any, b: any) =>
        new Date(b.time).getTime() - new Date(a.time).getTime()
    );

  const hasNoLastMessage = formatted.filter(
    (el) => !el?.message.message && !el?.time
  );
  return [...hasLastMessage, ...hasNoLastMessage];
};

export { formatDirectConversations, formatGroupConversations };
