import { Schema } from "mongoose";

export const textSchema = new Schema(
  { text: { type: String, required: true } },
  { _id: false }
);
