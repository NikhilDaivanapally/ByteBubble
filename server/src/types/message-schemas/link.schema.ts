import { Schema } from "mongoose";

export const linkSchema = new Schema(
  { url: { type: String, required: true } },
  { _id: false }
);
