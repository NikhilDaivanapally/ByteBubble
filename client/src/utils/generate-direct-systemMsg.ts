import { DirectSystemEventType } from "../constants/system-event-types";
import { DirectConversationProps } from "../types";

export const generateDirectSystemMessage = ({
  eventType,
  from,
  to,
  currentUserId,
  currentConversation,
}: {
  eventType: DirectSystemEventType;
  from: string;
  to: { _id: string | undefined; userName: string | undefined };
  currentUserId: string | undefined;
  currentConversation: DirectConversationProps | null;
}): string => {
  const fromName = from === currentUserId ? "You" : currentConversation?.name;
  const toName = to?._id === currentUserId ? "you" : to?.userName;
  switch (eventType) {
    case DirectSystemEventType.USER_BLOCKED:
      return `${fromName} Blocked ${toName}`;
    case DirectSystemEventType.USER_UNBLOCKED:
      return `${fromName} Unblocked ${toName}`;
    case DirectSystemEventType.MESSAGES_UNSENT:
      return ` Message unsent`;
    default:
      return "System notification";
  }
};
