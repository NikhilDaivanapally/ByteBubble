import { model, Schema } from "mongoose";
import { FriendshipDoc } from "../types/friendship/friendship.type";
const friendShipSchema = new Schema<FriendshipDoc>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    actionUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Prevent duplicate friend relationships in both directions
friendShipSchema.index({ sender: 1, recipient: 1 }, { unique: true });

export default model<FriendshipDoc>("Friendship", friendShipSchema);
