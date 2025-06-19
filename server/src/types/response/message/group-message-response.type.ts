import { Types } from "mongoose";
import { MessageContent } from "../../message-content-type";
import { MessageType } from "../../../constants/message-types";

export type GroupMessageResponse = {
  _id: Types.ObjectId;
  messageType: MessageType;
  message: MessageContent;
  isIncoming: boolean;
  isOutgoing: boolean;
  from: {
    _id: Types.ObjectId;
    userName: string;
    avatar?: string | undefined;
  };
  status: string;
  readBy: { userId: Types.ObjectId; isRead: boolean; seenAt: Date }[];
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

// _id: el?._id,
//     messageType: el?.messageType,
//     message: el?.message,
//     isIncoming: el?.recipients.includes(authUserId),
//     isOutgoing: el?.sender == authUserId,
//     from: el?.sender,
//     status: "sent",
//     readBy: el?.readBy,
//     conversationId: el?.conversationId,
//     deletedFor: el?.deletedFor,
//     isDeletedForEveryone: el?.isDeletedForEveryone,
//     reactions: el?.reactions,
//     isEdited: el?.isEdited,
//     editedAt: el?.editedAt,
//     systemEventType: el?.systemEventType,
//     metadata: el?.metadata,
//     eventUserSnapshot: el.eventUserSnapshot,
//     createdAt: el?.createdAt,
//     updatedAt: el?.updatedAt,
