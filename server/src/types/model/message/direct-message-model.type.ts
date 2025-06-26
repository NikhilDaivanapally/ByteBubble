import { Document, InferSchemaType, Types } from "mongoose";
import { MessageType } from "../../../constants/message-types";
import { userSnapshotSchema } from "../../message-schemas/userSnapshot.schema";
import { MessageContent } from "../../message-content-type";

export interface DirectMessageDoc extends Document {
  _id: Types.ObjectId;
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  conversationId: Types.ObjectId;
  messageType: MessageType;
  message: MessageContent;
  isRead: boolean;
  readAt: Date;
  deletedFor: Types.ObjectId[];
  isDeletedForEveryone: boolean;
  reactions: {
    user: Types.ObjectId;
    emoji: string;
  }[];
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  systemEventType?: string;
  metadata?: any;
  eventUserSnapshot?: InferSchemaType<typeof userSnapshotSchema>;
}
