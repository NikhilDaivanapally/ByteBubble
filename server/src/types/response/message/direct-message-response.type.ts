import { Types } from "mongoose";
import { MessageContent } from "../../message-content-type";
import { MessageType } from "../../../constants/message-types";

export type DirectMessageResponse = {
  _id: Types.ObjectId;
  messageType: MessageType;
  message: MessageContent;
  isIncoming: boolean;
  isOutgoing: boolean;
  status: string;
  isRead: boolean;
  conversationId: Types.ObjectId;
  deletedFor: Types.ObjectId[];
  isDeletedForEveryone: boolean;
  reactions: {
    user: Types.ObjectId;
    emoji: string;
  }[];
  isEdited: boolean;
  editedAt?: Date;
  systemEventType?: string;
  metadata?: string;
  eventUserSnapshot?: {
    _id: Types.ObjectId;
    userName: string;
    avatar: string;
  };
  createdAt: Date;
  updatedAt: Date;
};
