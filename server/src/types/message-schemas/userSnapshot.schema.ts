import { Schema } from "mongoose";

export const userSnapshotSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    userName: { type: String, required: true },
    avatar: { type: String, required: true },
  },
  { _id: false }
);
