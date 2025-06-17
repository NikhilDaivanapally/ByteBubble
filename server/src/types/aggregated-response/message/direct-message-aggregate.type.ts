import { Types } from "mongoose";
import { MessageContent } from "../../message-content-type";
import { MessageType } from "../../../constants/message-types";
import { DirectSystemEventType } from "../../../constants/system-event-types";

export type AggregatedDirectMessage = {
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
  systemEventType?:DirectSystemEventType;
  metadata?: any;
  eventUserSnapshot?: {
    _id: Types.ObjectId;
    userName: string;
    avatar: string;
  };
  createdAt: Date;
  updatedAt: Date;
};
