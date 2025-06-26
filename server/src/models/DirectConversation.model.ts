import { Schema, model } from "mongoose";
import { DirectConversationDoc } from "../types/model/conversation/direct-conversation-model.type";

const directConversationSchema = new Schema<DirectConversationDoc>(
  {
    participants: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      validate: {
        validator: (v: Schema.Types.ObjectId[]) => v.length === 2,
        message: "Direct conversation must have exactly two participants",
      },
      required: true,
    },
    // Stores per-user preferences like mute, archive, lastSeen
    meta: {
      type: Map,
      of: new Schema(
        {
          isArchived: { type: Boolean, default: false },
          isMuted: { type: Boolean, default: false },
          lastSeen: { type: Date, default: null },
          // Add more fields like notification preferences here
        },
        { _id: false }
      ),
      default: {},
    },
  },
  { timestamps: true }
);

directConversationSchema.index({ participants: 1 });

export default model<DirectConversationDoc>("DirectConversation", directConversationSchema);
