import mongoose, { model, Schema } from "mongoose";
import { GroupMessageDoc } from "../types/model/message/group-message-model.type";
import { textSchema } from "../types/message-schemas/text.schema";
import { audioSchema } from "../types/message-schemas/audio.schema";
import { imageSchema } from "../types/message-schemas/image.schema";
import { userSnapshotSchema } from "../types/message-schemas/userSnapshot.schema";
import { groupEventTypes } from "../constants/system-event-types";
import { messageTypes } from "../constants/message-types";
import { linkSchema } from "../types/message-schemas/link.schema";
import { safeDiscriminator } from "../utils/safeDiscriminator";
import { documentSchema } from "../types/message-schemas/document.schema";

export const ReadBySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isRead: { type: Boolean, default: false },
    seenAt: { type: Date, default: null },
  },
  { _id: false }
); // _id: false to prevent automatic _id for subdocuments

const groupMessageSchema = new Schema<GroupMessageDoc>(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipients: [{ type: Schema.Types.ObjectId, ref: "User" }],
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "GroupConversation",
      required: true,
    },
    messageType: { type: String, enum: messageTypes, required: true },
    readBy: { type: [ReadBySchema], default: [] },
    deletedFor: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isDeletedForEveryone: { type: Boolean, default: false },
    reactions: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        emoji: String,
      },
    ],
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { discriminatorKey: "messageType" }
);

groupMessageSchema.index({ conversationId: 1 });

const GroupMessage =
  mongoose.models.GroupMessage || model("GroupMessage", groupMessageSchema);

// Discriminators
export const GroupSystemMessage = safeDiscriminator<GroupMessageDoc>(
  GroupMessage,
  "GroupSystem",
  new Schema({
    systemEventType: {
      type: String,
      required: true,
      enum: groupEventTypes,
    },
    metadata: { type: String, required: true },
    eventUserSnapshot: userSnapshotSchema,
  }),
  "system"
);

const GroupTextMessage = safeDiscriminator<GroupMessageDoc>(
  GroupMessage,
  "GroupText",
  new Schema({
    message: { type: textSchema, required: true },
  }),
  "text"
);

const GroupAudioMessage = safeDiscriminator<GroupMessageDoc>(
  GroupMessage,
  "GroupAudio",
  new Schema({
    message: { type: audioSchema, required: true },
  }),
  "audio"
);

const GroupImageMessage = safeDiscriminator<GroupMessageDoc>(
  GroupMessage,
  "GroupImage",
  new Schema({
    message: { type: imageSchema, required: true },
  }),
  "image"
);

const GroupLinkMessage = safeDiscriminator<GroupMessageDoc>(
  GroupMessage,
  "GroupLink",
  new Schema({
    message: { type: linkSchema, required: true },
  }),
  "link"
);

const GroupDocumentMessage = safeDiscriminator(
  GroupMessage,
  "GroupDocument",
  new Schema({
    message: { type: documentSchema, required: true },
  }),
  "document"
);

export {
  GroupMessage,
  GroupTextMessage,
  GroupAudioMessage,
  GroupImageMessage,
  GroupLinkMessage,
  GroupDocumentMessage,
};
