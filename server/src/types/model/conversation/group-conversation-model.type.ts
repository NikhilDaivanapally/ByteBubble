import { Types } from "mongoose";

// structure of the GroupParticipantMeta map value
export interface GroupParticipantMeta {
  isMuted?: boolean;
  // Add other user preferences if needed
}

export interface GroupConversationDoc extends Document {
  name: String;
  avatar?: String;
  about: string;
  createdBy?: Types.ObjectId;
  admins: [Types.ObjectId, Types.ObjectId]; // one or above
  participants: [Types.ObjectId, Types.ObjectId]; // two or above two
  meta?: Map<string, GroupParticipantMeta>; // key = userId (as string), value = meta for that user
  createdAt: Date;
  updatedAt: Date;
}
