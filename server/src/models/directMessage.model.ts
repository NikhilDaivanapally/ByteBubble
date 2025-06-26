import mongoose, { Schema, model } from "mongoose";
import { textSchema } from "../types/message-schemas/text.schema";
import { audioSchema } from "../types/message-schemas/audio.schema";
import { imageSchema } from "../types/message-schemas/image.schema";
import { DirectMessageDoc } from "../types/model/message/direct-message-model.type";
import { directEventTypes } from "../constants/system-event-types";
import { userSnapshotSchema } from "../types/message-schemas/userSnapshot.schema";
import { messageTypes } from "../constants/message-types";
import { linkSchema } from "../types/message-schemas/link.schema";
import { safeDiscriminator } from "../utils/safeDiscriminator";

const directMessageSchema = new Schema<DirectMessageDoc>(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "DirectConversation",
      required: true,
    },
    messageType: { type: String, enum: messageTypes, required: true },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    deletedFor: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isDeletedForEveryone: { type: Boolean, default: false },
    reactions: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        emoji: String,
      },
    ],
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { discriminatorKey: "messageType" }
);

directMessageSchema.index({ conversationId: 1 });

const DirectMessage =
  mongoose.models.DirectMessage ||
  model<DirectMessageDoc>("DirectMessage", directMessageSchema);

// Discriminators
export const DirectSystemMessage = safeDiscriminator<DirectMessageDoc>(
  DirectMessage,
  "DirectSystem",
  new Schema({
    systemEventType: {
      type: String,
      required: true,
      enum: directEventTypes,
    },
    metadata: { type: String, required: true },
    eventUserSnapshot: userSnapshotSchema,
  }),
  "system"
);

const DirectTextMessage = safeDiscriminator(
  DirectMessage,
  "DirectText",
  new Schema({
    message: { type: textSchema, required: true },
  }),
  "text"
);

const DirectAudioMessage = safeDiscriminator(
  DirectMessage,
  "DirectAudio",
  new Schema({
    message: { type: audioSchema, required: true },
  }),
  "audio"
);

const DirectImageMessage = safeDiscriminator(
  DirectMessage,
  "DirectImage",
  new Schema({
    message: { type: imageSchema, required: true },
  }),
  "image"
);

const DirectLinkMessage = safeDiscriminator(
  DirectMessage,
  "DirectLink",
  new Schema({
    message: { type: linkSchema, required: true },
  }),
  "link"
);

export {
  DirectMessage,
  DirectTextMessage,
  DirectAudioMessage,
  DirectImageMessage,
  DirectLinkMessage,
};
