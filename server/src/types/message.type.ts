import { Document, Types } from "mongoose";

export interface Message extends Document {
  sender: Types.ObjectId;
  recipients: string[] | string;
  messageType: "text" | "audio" | "photo" | "video" | "link" | "reply";
  isRead: boolean;
  conversationId: Types.ObjectId;
  conversationType: "OneToOneMessage" | "OneToManyMessage";
  createdAt: Date;
  updatedAt: Date;
}
