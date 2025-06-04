export type MessageContentProps = {
  _id?: string;
  text?: string;
  audioId?: string;
  photoUrl?: string;
  description?: string;
};

export type Message = {
  messageType: string;
  message: MessageContentProps;
  createdAt: Date;
};

export type UserProps = {
  _id: string;
  userName: string;
  email: string;
  avatar: string;
  about: string;
  gender: string;
  socket_id: string;
  status: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FriendRequestProps = {
  _id: string;
  sender: UserProps;
  recipient: UserProps;
};

export type DirectConversationProps = {
  _id: string;
  userId: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  message: Message;
  unreadMessagesCount: number;
  isSeen: boolean;
  isOutgoing: boolean;
  time: Date;
  about?: string;
};

export type DirectMessageProps = {
  _id: string;
  messageType: string;
  sender: string;
  message: MessageContentProps;
  createdAt: string;
  updatedAt: string;
  isIncoming: boolean;
  isOutgoing: boolean;
  status: string;
  isSeen: boolean;
  conversationType: string;
  conversationId: string;
};

export type GroupConversationProps = {
  _id: string;
  name: string;
  avatar: string;
  about?: string;
  users: UserProps[];
  admin?: UserProps;
  message: Message;
  from: { _id: string; userName: string; avatar: string };
  isOutgoing: boolean;
  unreadMessagesCount: number;
  isSeen: boolean;
  time: Date;
};

export type GroupMessageProps = {
  _id: string;
  messageType: string;
  message: MessageContentProps;
  createdAt: string;
  updatedAt: string;
  isIncoming: boolean;
  isOutgoing: boolean;
  status: string;
  isSeen: boolean;
  from: string;
  conversationType: string;
  conversationId: string;
};

// type for appSlice

export type previewObj = {
  name: string;
  size: number;
  url: string;
  blob: Blob;
};

export type appSliceProps = {
  onlineStatus: boolean;
  friends: UserProps[] | [];
  users: UserProps[] | [];
  friendRequests: FriendRequestProps[] | [];
  activeChatId: string | null;
  chatType: string | null;
  isCameraOpen: boolean;
  mediaFiles: File[] | File | null;
  mediaPreviewUrls: previewObj[] | null;
  isTyping: string;
  isTypingRoomId: string | null;
  messageInfo: DirectMessageProps | GroupMessageProps | null;
};

// type for conversationSlice

export type conversationSliceProps = {
  direct_chat: {
    DirectConversations: DirectConversationProps[] | null;
    current_direct_conversation: DirectConversationProps | null;
    current_direct_messages: DirectMessageProps[] | [];
  };
  group_chat: {
    GroupConversations: GroupConversationProps[] | null;
    current_group_conversation: GroupConversationProps | null;
    current_group_messages: GroupMessageProps[] | [];
  };
  fullImagePreview: DirectMessageProps | GroupMessageProps | null;
};
