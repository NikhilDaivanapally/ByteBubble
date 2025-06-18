import { Document, InferSchemaType, Types } from "mongoose";
import { MessageType } from "../../../constants/message-types";
import { userSnapshotSchema } from "../../message-schemas/userSnapshot.schema";
import { MessageContent } from "../../message-content-type";
import { ReadBySchema } from "../../../models/groupMessage.model";

export interface GroupMessageDoc extends Document {
  _id: Types.ObjectId;
  sender: Types.ObjectId;
  recipients: Types.ObjectId[];
  conversationId: Types.ObjectId;
  messageType: MessageType;
  message: MessageContent;
  readBy: InferSchemaType<typeof ReadBySchema>[];
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
  eventUserSnapshot?: InferSchemaType<typeof userSnapshotSchema>;
  createdAt: Date;
  updatedAt: Date;
}
