import { Schema } from "mongoose";

export const audioSchema = new Schema(
  { audioId: { type: Schema.Types.ObjectId, required: true } },
  { _id: false }
);
