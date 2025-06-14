import mongoose, { Schema, Types } from "mongoose";

const DirectConversationSchema = new Schema(
  {
    participants: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      validate: {
        validator: (v: Types.ObjectId[]) => v.length === 2,
        message: "Direct conversation must have exactly two participants",
      },
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("OneToOneMessage", DirectConversationSchema);
