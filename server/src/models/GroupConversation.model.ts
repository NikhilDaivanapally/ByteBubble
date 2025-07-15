import { model, Schema } from "mongoose";
import { GroupConversationDoc } from "../types/model/conversation/group-conversation-model.type";

const groupConversationSchema = new Schema<GroupConversationDoc>(
  {
    name: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admins: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    meta: {
      type: Map,
      of: new Schema(
        {
          isMuted: { type: Boolean, default: false },
          // Add more fields like notification preferences here
        },
        { _id: false }
      ),
      default: {},
    },
    about: {
      type: String,
      default: function () {
        return `Welcome to ${this.name} group!`;
      },
      trim: true,
    },
  },
  { timestamps: true }
);

// Ensure at least 2 participants and no duplicates
groupConversationSchema.path("participants").validate(function (value) {
  const unique = new Set(value.map(String));
  return unique.size >= 2 && unique.size === value.length;
}, "Group must have at least 2 unique participants.");

groupConversationSchema.index({ participants: 1 });
groupConversationSchema.index({ createdBy: 1 });

export default model<GroupConversationDoc>(
  "GroupConversation",
  groupConversationSchema
);
