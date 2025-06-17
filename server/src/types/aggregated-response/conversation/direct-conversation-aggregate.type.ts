import { DirectParticipantMeta } from "../../model/conversation/direct-conversation-model.type";
import { AggregatedDirectMessage } from "../message/direct-message-aggregate.type";
import { User } from "../user-aggregate.type";

export type AggregatedDirectConversation = {
  _id: string;
  user: User;
  meta: Record<string, DirectParticipantMeta>;
  messages: AggregatedDirectMessage[];
};
