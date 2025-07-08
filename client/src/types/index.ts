export type MessageContent = {
  text: string;
  url: string;
  // audioId: string;
  imageUrl: string;
  description?: string;
  fileId: string;
  fileName: string;
  fileType: string;
  size: number;
  duration: number;
  source: string;
  previewUrl: string;
  pdfPreviewUrl?: string;
};

export type DirectMessage = {
  messageType: MessageType | undefined;
  systemEventType?: DirectSystemEventType | undefined;
  message: MessageContent;
  metadata?: string | undefined;
  eventUserSnapshot?:
    | {
        _id: string;
        userName: string;
        avatar: string;
      }
    | undefined;
  isEdited: boolean;
  editedAt?: Date | undefined;
  deletedFor: string[];
  isDeletedForEveryone: boolean;
  createdAt: Date | string | undefined;
};

export type UserProps = {
  _id: string;
  userName: string;
  email: string;
  avatar?: string;
  about?: string;
  createdAt: string;
  updatedAt: string;
  socketId: string;
  status: "Online" | "Offline" | string;
  verified: boolean;
  blockedUsers: string[];
};

export type FriendRequestProps = {
  _id: string;
  sender: UserProps;
  recipient: UserProps;
};

export type DirectParticipantMeta = {
  isArchived?: boolean;
  isMuted?: boolean;
  lastSeen?: Date | null;
  // Add other user preferences if needed
};
export type MessageType =
  | "link"
  | "text"
  | "audio"
  | "image"
  | "video"
  | "document"
  | "reply"
  | "system";
export type DirectSystemEventType =
  | "user_blocked"
  | "user_unblocked"
  | "message_unsent"
  | "chat_cleared"
  | "chat_deleted"
  | "archived"
  | "chat_muted";

export type DirectConversationProps = {
  _id: string;
  userId: string;
  name: string;
  avatar: string | undefined;
  meta: Record<string, DirectParticipantMeta>;
  isOnline: boolean;
  message: DirectMessage;
  unreadMessagesCount: number;
  isRead: boolean;
  isOutgoing: boolean;
  time: Date | string;
  about: string | undefined;
};

export type DirectMessageProps = {
  _id: string;
  messageType: MessageType;
  message: MessageContent;
  isIncoming: boolean;
  isOutgoing: boolean;
  status: string;
  isRead: boolean;
  readAt: string;
  conversationId: string;
  deletedFor: string[];
  isDeletedForEveryone: boolean;
  reactions: { user: string; emoji: string }[];
  isEdited: boolean;
  editedAt?: Date | undefined;
  systemEventType: DirectSystemEventType;
  metadata: string;
  eventUserSnapshot: {
    _id: string;
    userName: string;
    avatat?: string | undefined;
  };
  createdAt: string;
  updatedAt: Date;
};

export type GroupSystemEventType =
  | "user_added"
  | "user_removed"
  | "user_left"
  | "group_renamed"
  | "group_created"
  | "admin_assigned"
  | "admin_removed"
  | "group_muted"
  | "group_icon_changed"
  | "group_description_updated"
  | "message_pinned";

export type GroupParticipantMeta = {
  isMuted?: boolean;
  // Add other user preferences if needed
};
export type GroupMessage = {
  messageType: MessageType | undefined;
  systemEventType: GroupSystemEventType | undefined;
  message: MessageContent;
  metadata: string;
  eventUserSnapshot:
    | {
        _id: string;
        userName: string;
        avatar: string;
      }
    | undefined;
  isEdited: boolean;
  editedAt: Date | undefined;
  deletedFor: string[];
  isDeletedForEveryone: boolean;
  createdAt: string | undefined;
};
export type GroupMessageProps = {
  _id: string;
  messageType: MessageType;
  message: MessageContent;
  isIncoming: boolean;
  isOutgoing: boolean;
  from: {
    _id: string;
    userName: string;
    avatar?: string | undefined;
  };
  status: string;
  readBy: {
    userId: string;
    isRead: boolean;
    seenAt: Date;
  }[];
  conversationId: string;
  deletedFor: string[];
  isDeletedForEveryone: boolean;
  reactions: { user: string; emoji: string }[];
  isEdited: boolean;
  editedAt?: Date | undefined;
  systemEventType: DirectSystemEventType;
  metadata: string;
  eventUserSnapshot: {
    _id: string;
    userName: string;
    avatat?: string | undefined;
  };
  createdAt: string;
  updatedAt: Date;
};
export type GroupConversationProps = {
  _id: string;
  name: string;
  avatar: string | undefined;
  about: string;
  admin: UserProps;
  users: UserProps[];
  message: GroupMessage;
  from: {
    _id: string;
    userName: string;
    avatar: string | undefined;
  };
  isOutgoing: boolean;
  time: string;
  unreadMessagesCount: number;
  readBy: string[];
  meta: Record<string, GroupParticipantMeta>;
};

// type for appSlice

export type previewObj = {
  url: string;
  file: File;
};

export type appSliceProps = {
  onlineStatus: boolean;
  friends: UserProps[] | [];
  users: UserProps[] | [];
  friendRequests: FriendRequestProps[] | [];
  activeChatId: string | null;
  chatType: "direct" | "group" | null;
  isCameraOpen: boolean;
  mediaFiles: File[] | File | null;
  mediaFilePreviews: previewObj[];
  isTyping: string;
  isTypingRoomId: string | null;
  directMessageInfo: DirectMessageProps | null;
  groupMessageInfo: GroupMessageProps | null;
  unreadCount: {
    directChats: number;
    groupChats: number;
    total: number;
  };
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
  pdfPreview: DirectMessageProps | GroupMessageProps | null;
};
