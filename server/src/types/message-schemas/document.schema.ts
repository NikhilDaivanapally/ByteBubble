import { Schema } from "mongoose";

export const documentSchema = new Schema(
  {
    previewUrl: { type: String },
    fileId: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false }
);
