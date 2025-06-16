import { Types } from "mongoose";

// structure of the meta map value
interface ParticipantMeta {
  isArchived?: boolean;
  isMuted?: boolean;
  lastSeen?: Date | null;
  // Add other user preferences if needed
}

export interface DirectConversationDoc extends Document {
  participants: [Types.ObjectId, Types.ObjectId]; // always two
  meta: Map<string, ParticipantMeta>; // key = userId (as string), value = meta for that user
  createdAt: Date;
  updatedAt: Date;
}
