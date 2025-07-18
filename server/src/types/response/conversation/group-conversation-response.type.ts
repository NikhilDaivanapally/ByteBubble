import { Types } from "mongoose";
import { MessageType } from "../../../constants/message-types";
import { GroupSystemEventType } from "../../../constants/system-event-types";
import { MessageContent } from "../../message-content-type";
import { User } from "../user-response.type";
import { GroupParticipantMeta } from "../../model/conversation/group-conversation-model.type";

export type GroupConversationResponse = {
  _id: string;
  name: string;
  avatar: string | undefined;
  about: string;
  createdBy: User;
  admins: string[];
  users: User[];
  message: {
    messageType: MessageType | undefined;
    systemEventType: GroupSystemEventType | undefined;
    message: MessageContent | "";
    metadata: string;
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
  from: {
    _id: Types.ObjectId;
    userName: string;
    avatar: string | undefined;
  };
  isOutgoing: boolean;
  time: Date | undefined;
  unreadMessagesCount: number;
  readBy: { userId: Types.ObjectId; isRead: boolean; seenAt: Date }[];
  meta: Record<string, GroupParticipantMeta>;
};
