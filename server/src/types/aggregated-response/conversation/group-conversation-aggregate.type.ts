import { GroupParticipantMeta } from "../../conversation/group-conversation.type";
import { AggregatedGroupMessage } from "../message/group-message-aggregate.type";
import { User } from "../user-aggregate.type";

export type AggregatedGroupConversation = {
  _id: string;
  name: string;
  avatar: string;
  about: string;
  admin: User;
  participants: User[];
  messages: AggregatedGroupMessage[];
  createdAt: string;
  updatedAt: string;
  meta: Record<string, GroupParticipantMeta>;
};
