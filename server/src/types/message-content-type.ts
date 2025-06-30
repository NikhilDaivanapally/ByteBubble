import { InferSchemaType } from "mongoose";
import { textSchema } from "./message-schemas/text.schema";
import { imageSchema } from "./message-schemas/image.schema";
import { audioSchema } from "./message-schemas/audio.schema";
import { documentSchema } from "./message-schemas/document.schema";
import { linkSchema } from "./message-schemas/link.schema";

export type TextMessageData = InferSchemaType<typeof textSchema>;
export type AudioMessageData = InferSchemaType<typeof audioSchema>;
export type PhotoMessageData = InferSchemaType<typeof imageSchema>;
export type LinkMessageData = InferSchemaType<typeof linkSchema>;
export type DocumentMessageData = InferSchemaType<typeof documentSchema>;

export type MessageContent =
  | TextMessageData
  | AudioMessageData
  | PhotoMessageData
  | LinkMessageData
  | DocumentMessageData;
