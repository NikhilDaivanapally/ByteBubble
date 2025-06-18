import { Server } from "socket.io";
import { v2 as cloudinary } from "cloudinary";
import { gridFSBucket } from "../../db/connectDB";
import { Readable } from "stream";
import { formatDirectMessages } from "../../utils/formatMessages";
import { emitToPrivate } from "../utils/emitUtils";
import {
  DirectAudioMessage,
  DirectImageMessage,
  DirectMessage,
  DirectTextMessage,
} from "../../models/directMessage.model";
import User from "../../models/user.model";

type MessageProps = {
  _id: string;
  senderId: string;
  recipientId: string;
  messageType: "link" | "text" | "image" | "audio" | "system";
  message: {
    text?: string;
    audioId?: string;
    imageUrl?: string;
    description?: string;
  };
  conversationId: string;
  createdAt: string;
  updatedAt: string;
};

function buildMessage(message: MessageProps) {
  return {
    _id: message?._id,
    sender: message?.senderId,
    recipient: message?.recipientId,
    messageType: message?.messageType,
    message: message?.message,
    conversationId: message?.conversationId,
    createdAt: message?.createdAt,
    updatedAt: message?.updatedAt,
  };
}

export async function handleGetDirectMessages(data: any, callback: any) {
  const messages = await DirectMessage.find({
    conversationId: data.conversationId,
  });
  let formatted = formatDirectMessages(messages, data.authUserId);

  callback(formatted);
}

export async function handleTextMessage(
  messagePayload: MessageProps,
  io: Server
) {
  const { senderId, recipientId } = messagePayload;
  await emitToPrivate({ senderId, recipientId, message: messagePayload, io });
  await DirectTextMessage.create(buildMessage(messagePayload));
}

export async function handlePhotoMessage(messagePayload: any, io: Server) {
  const { senderId, recipientId } = messagePayload;
  const { file, text } = messagePayload?.message;
  const image = await cloudinary.uploader.upload(file[0].blob);
  const message = {
    ...messagePayload,
    message: { imageUrl: image?.secure_url, description: text || "" },
  };
  await emitToPrivate({ senderId, recipientId, message, io });

  await DirectImageMessage.create(buildMessage(message));
}

export async function handleAudioMessage(messagePayload: any, io: Server) {
  const { senderId, recipientId } = messagePayload;

  // Convert the Blob to a readable stream
  const readableStream = new Readable();
  readableStream.push(Buffer.from(messagePayload.message));
  readableStream.push(null);

  // Upload to GridFS
  const uploadStream = gridFSBucket.openUploadStream(crypto.randomUUID());
  readableStream.pipe(uploadStream);

  uploadStream.on("finish", async () => {
    const message = {
      ...messagePayload,
      message: { audioId: uploadStream.id },
    };
    await emitToPrivate({ senderId, recipientId, message, io });
    await DirectAudioMessage.create(buildMessage(message));
  });
}

export async function handleMessageSeen(messagePayload: any, io: Server) {
  const sender = await User.findById(messagePayload?.senderId).select(
    "socketId -_id"
  );
  if (sender?.socketId) {
    io.to(sender?.socketId!).emit("message:status:seen", messagePayload);
  }
  await DirectMessage.findOneAndUpdate(
    { _id: messagePayload?._id },
    { $set: { isRead: true } }
  );
}

export async function handleMessageUnreadUpdate(
  messagePayload: any,
  io: Server
) {
  const recipient = await User.findById(messagePayload.recipientId);
  if (recipient?.socketId) {
    io.to(recipient?.socketId).emit("messages:unread:count", messagePayload);
  }
}

export async function handleMessageUnreadClear(data: any, io: Server) {
  const { conversationId, recipient, sender } = data;
  const Sender = await User.findById(sender);
  if (Sender?.socketId) {
    io.to(Sender?.socketId!).emit("messages:status:seen", conversationId);
  }
  await DirectMessage.updateMany(
    { conversationId, recipients: recipient },
    { $set: { isRead: true } }
  );
}
