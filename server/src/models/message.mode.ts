import mongoose, { Schema } from "mongoose";
import { Message } from "../types/message.type";
import { individual } from "../utils/conversationTypes";

// Base message schema with discriminators for specific message types
const messageSchema = new Schema<Message>(
  {
    _id: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipients: {
      type: mongoose.Schema.Types.Mixed, // Can dynamically hold either ObjectId or array
      required: true,
      validate: {
        validator: function (
          recipients: string | number | Uint8Array<ArrayBufferLike>
        ): boolean {
          if (this.conversationType === individual) {
            // Validate for a single ObjectId in OneToOneMessage
            const valid = mongoose.Types.ObjectId.isValid(recipients);
            return valid;
          } else if (
            this.conversationType === "OneToManyMessage" &&
            Array.isArray(recipients)
          ) {
            // Validate for an array of ObjectIds in OneToManyMessage
            return recipients.every((id) =>
              mongoose.Types.ObjectId.isValid(id)
            );
          }
          return false;
        },
        message:
          "Invalid recipients: OneToOneMessage requires a single recipient, OneToManyMessage requires an array.",
      },
    },
    messageType: {
      type: String,
      enum: ["text", "audio", "photo", "video", "link", "reply"],
      required: true,
    },
    isRead: { type: Boolean, default: false },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "conversationType", // Dynamic reference
      required: true,
    },
    conversationType: {
      type: String,
      enum: [individual, "OneToManyMessage"], // The model this refers to
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { discriminatorKey: "messageType" }
);

// Create the base model
const Message = mongoose.model<Message>("Message", messageSchema);

// Discriminators for specific message types
const TextMessage = Message.discriminator(
  "text",
  new mongoose.Schema({
    message: {
      type: new mongoose.Schema({
        text: { type: String, required: true },
      }),
      required: true,
    },
  })
);

const AudioMessage = Message.discriminator(
  "audio",
  new mongoose.Schema({
    message: {
      type: new mongoose.Schema({
        audioId: { type: mongoose.Types.ObjectId, required: true },
      }),
      required: true,
    },
  })
);

const PhotoMessage = Message.discriminator(
  "photo",
  new mongoose.Schema({
    message: {
      type: new mongoose.Schema({
        photoUrl: { type: String, required: true },
        description: String,
      }),
      required: true,
    },
  })
);

const VideoMessage = Message.discriminator(
  "video",
  new mongoose.Schema({
    message: {
      type: new mongoose.Schema({
        videoUrl: { type: String, required: true },
        description: String,
      }),
      required: true,
    },
  })
);

const LinkMessage = Message.discriminator(
  "link",
  new mongoose.Schema({
    message: {
      type: new mongoose.Schema({
        text: { type: String, required: true },
      }),
      required: true,
    },
  })
);

// Reply message schema with dynamic fields for different types of replies
const ReplyMessage = Message.discriminator(
  "reply",
  new mongoose.Schema({
    repliedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message", // Reference to the original message being replied to
      required: true,
    },
    replyType: {
      type: String,
      enum: ["text", "audio", "photo", "video"], // Reply type (text, audio, photo, video)
      required: true,
    },
    message: {
      type: mongoose.Schema.Types.Mixed, // Allows dynamic types
      required: true,
      validate: {
        validator: function (value: any) {
          // Type assertion to specify 'this' refers to the document
          const doc = this as any; // Type assertion to make TypeScript aware of the document context

          switch (doc.replyType) {
            case "text":
            case "link":
              // For text and link, ensure `message` is an object with a `text` field
              return (
                typeof value === "object" &&
                value.text &&
                typeof value.text === "string"
              );
            case "audio":
              // For audio, ensure `message` has an `Id` field that is a valid ObjectId
              return (
                typeof value === "object" &&
                value.Id &&
                mongoose.Types.ObjectId.isValid(value.Id)
              );
            case "photo":
            case "video":
              // For photo and video, ensure `message` has `url` and optional `description`
              return (
                typeof value === "object" &&
                value.url &&
                typeof value.url === "string" &&
                (typeof value.description === "undefined" ||
                  typeof value.description === "string")
              );
            default:
              return false; // Invalid replyType
          }
        },
        message: "Invalid message format for the given replyType.",
      },
    },
  })
);

export {
  Message,
  TextMessage,
  AudioMessage,
  PhotoMessage,
  VideoMessage,
  LinkMessage,
  ReplyMessage,
};
