import { Types } from "mongoose";
import { MessageContent } from "../../message-content-type";
import { MessageType } from "../../../constants/message-types";
import { GroupSystemEventType } from "../../../constants/system-event-types";

export type AggregatedGroupMessage = {
  _id: Types.ObjectId;
  sender: {
    _id: Types.ObjectId;
    userName: string;
    avatar: string | undefined;
  };
  recipients: Types.ObjectId[];
  conversationId: Types.ObjectId;
  messageType: MessageType;
  message: MessageContent;
  readBy: Types.ObjectId[];
  deletedFor: Types.ObjectId[];
  isDeletedForEveryone: boolean;
  reactions: {
    user: Types.ObjectId;
    emoji: string;
  }[];
  isEdited: boolean;
  editedAt?: Date;
  systemEventType?: GroupSystemEventType;
  metadata?: any;
  eventUserSnapshot?: {
    _id: Types.ObjectId;
    userName: string;
    avatar: string;
  };
  createdAt: Date;
  updatedAt: Date;
};
