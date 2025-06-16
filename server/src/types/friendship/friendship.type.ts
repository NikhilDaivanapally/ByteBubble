import { Types } from "mongoose";

export interface FriendshipDoc extends Document {
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  status: "pending" | "accepted" | "declined";
  actionUser?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
