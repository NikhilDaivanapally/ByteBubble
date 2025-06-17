import { Types } from "mongoose";
import { MessageContent } from "../../message-content-type";
import { MessageType } from "../../../constants/message-types";

export type DirectMessageResponse = {
  _id: Types.ObjectId;
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  conversationId: Types.ObjectId;
  messageType: MessageType;
  message: MessageContent;
  isRead: boolean;
  deletedFor: Types.ObjectId[];
  isDeletedForEveryone: boolean;
  reactions: {
    user: Types.ObjectId;
    emoji: string;
  }[];
  isEdited: boolean;
  editedAt?: Date;
  systemEventType?: string;
  metadata?: any;
  eventUserSnapshot?: {
    _id: Types.ObjectId;
    userName: string;
    avatar: string;
  };
  createdAt: Date;
  updatedAt: Date;
};
