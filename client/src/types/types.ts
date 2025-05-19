export type User = {
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
};

// export type friend = {};

// export type Conversation = {};

export type DirectConversation = {
  id: string;
  userId: string;
  name: string;
  online: boolean;
  avatar?: string;
  msg: {
    type: string;
    message: {
      _id?: string;
      text?: string;
      audioId?: string;
      photoUrl?: string;
      description?: string;
    };
    createdAt: Date;
  };
  unread: number;
  seen: boolean;
  outgoing: boolean;
  time: Date;
  pinned: boolean;
  about?: string;
};

export type DirectMessage = {
  id: string;
  type: string;
  message: {
    _id?: string;
    text?: string;
    audioId?: string;
    photoUrl?: string;
    description?: string;
  };
  createdAt: string;
  updateAt: string;
  incoming: boolean;
  outgoing: boolean;
  status: string;
  seen: boolean;
};

export type GroupConversation = {
  id: string;
  title: string;
  img: string;
  users: User[];
  admin?: User;
  msg: {
    type: string;
    message: {
      _id: string;
      text?: string;
      audioId?: string;
      photoUrl?: string;
      description?: string;
    };
    createdAt: Date;
  };
  from: string;
  unread: number;
  seen: boolean;
  outgoing: boolean;
  time: Date;
  about?: string;
};

export type GroupMessage = {
  id: string;
  type: string;
  message: {
    _id: string;
    text?: string;
    audioId?: string;
    photoUrl?: string;
    description?: string;
  };
  createdAt: string;
  updateAt: string;
  incoming: boolean;
  outgoing: boolean;
  status: string;
  seen: boolean;
  from: string;
  conversationId?: string;
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
  friends: User[] | [];
  activeChatId: string | null;
  chatType: string | null;
  isCameraOpen: boolean;
  mediaFiles: File[] | File | null;
  mediaPreviewUrls: previewObj[] | null;
};

// type for conversationSlice

export type conversationSliceProps = {
  direct_chat: {
    DirectConversations: DirectConversation[] | null;
    current_direct_conversation: DirectConversation | null;
    current_direct_messages: DirectMessage[] | [];
  };
  group_chat: {
    GroupConversations: GroupConversation[] | null;
    current_group_conversation: GroupConversation | null;
    current_group_messages: GroupMessage[] | [];
  };
  fullImagePreview: DirectMessage | GroupMessage | null;
};
