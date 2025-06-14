import mongoose from "mongoose";

const GroupConversationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    avatar: {
      type: String,
    },
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    about: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("GroupConversation", GroupConversationSchema);
