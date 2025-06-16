import { Schema } from "mongoose";

export const imageSchema = new Schema(
  {
    imageUrl: { type: String, required: true },
    description: { type: String, default: null },
  },
  { _id: false }
);
