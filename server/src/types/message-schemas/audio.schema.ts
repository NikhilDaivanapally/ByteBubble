import { Schema } from "mongoose";

export const audioSchema = new Schema(
  {
    fileId: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    size: { type: Number, required: true },
    duration: { type: Number, required: true },
    source: {
      type: String,
      enum: ["recorded", "uploaded"],
      required: true,
    },
  },
  { _id: false }
);
