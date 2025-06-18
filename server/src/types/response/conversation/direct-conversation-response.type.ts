import { Types } from "mongoose";
import { MessageType } from "../../../constants/message-types";
import { DirectSystemEventType } from "../../../constants/system-event-types";
import { DirectParticipantMeta } from "../../model/conversation/direct-conversation-model.type";
import { MessageContent } from "../../message-content-type";

export type DirectConversationResponse = {
  _id: string;
  userId: string;
  name: string;
  avatar: string | undefined;
  meta: Record<string, DirectParticipantMeta>;
  isOnline: boolean;
  message: {
    messageType: MessageType | undefined;
    systemEventType: DirectSystemEventType | undefined;
    message: MessageContent;
    metadata: string | undefined;
    eventUserSnapshot:
      | {
          _id: Types.ObjectId;
          userName: string;
          avatar: string;
        }
      | undefined;
    isEdited: boolean;
    editedAt: Date | undefined;
    deletedFor: Types.ObjectId[];
    isDeletedForEveryone: boolean;
    createdAt: Date | undefined;
  };
  unreadMessagesCount: number;
  isRead: boolean;
  isOutgoing: boolean;
  time: Date;
  about: string | undefined;
};
