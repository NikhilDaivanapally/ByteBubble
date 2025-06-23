// models/Settings.ts
import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },

    notifications: {
      messages: {
        messageNotifications: { type: Boolean, default: true },
        inAppSounds: { type: Boolean, default: true },
      },
      groupChats: {
        groupChatNotifications: { type: Boolean, default: true },
        inAppSounds: { type: Boolean, default: true },
      },
      others: {
        reactions: { type: Boolean, default: true },
        groupEvents: { type: Boolean, default: true },
      },
    },
    privacy: {
      readReceipts: { type: Boolean, default: true },
      lastSeenVisible: { type: Boolean, default: true },
      profilePhotoVisibleTo: {
        type: String,
        enum: ["everyone", "connections", "nobody"],
        default: "everyone",
      },
      AboutVisibleTo: {
        type: String,
        enum: ["everyone", "connections", "nobody"],
        default: "everyone",
      },
      groupsAddPermission: {
        type: String,
        enum: ["everyone", "connections", "nobody"],
        default: "everyone",
      },
    },
    behavior: {
      enterToSend: { type: Boolean, default: true },
      autoDownloadMedia: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", SettingsSchema);
