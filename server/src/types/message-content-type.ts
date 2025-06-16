import { InferSchemaType } from "mongoose";
import { textSchema } from "./message-schemas/text.schema";
import { imageSchema } from "./message-schemas/image.schema";
import { audioSchema } from "./message-schemas/audio.schema";

export type TextMessageData = InferSchemaType<typeof textSchema>;
export type AudioMessageData = InferSchemaType<typeof audioSchema>;
export type PhotoMessageData = InferSchemaType<typeof imageSchema>;
export type LinkMessageData = InferSchemaType<typeof textSchema>;

export type MessageContent =
  | TextMessageData
  | AudioMessageData
  | PhotoMessageData;
