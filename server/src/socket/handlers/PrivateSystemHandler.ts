import { Server } from "socket.io";
import User from "../../models/user.model";
import { DirectSystemMessage } from "../../models/directMessage.model";

export async function handleUserBlock(data: any, io: Server) {
  const {
    _id,
    messageType,
    systemEventType,
    metadata,
    eventUserSnapshot,
    conversationId,
    senderId,
    recipientId,
    createdAt,
    updatedAt,
  } = data;
  const recipient = await User.findById(recipientId).select("socketId -_id");
  if (recipient?.socketId) {
    io.to(recipient?.socketId).emit("blocked", data);
  }
  await User.findByIdAndUpdate(senderId, {
    $addToSet: { blockedUsers: recipientId },
  });
  await DirectSystemMessage.create({
    _id,
    sender: senderId,
    recipient: recipientId,
    conversationId,
    messageType,
    systemEventType,
    metadata,
    eventUserSnapshot,
    createdAt,
    updatedAt,
  });
}
export async function handleUserUnblock(data: any, io: Server) {
  const {
    _id,
    messageType,
    systemEventType,
    metadata,
    eventUserSnapshot,
    conversationId,
    senderId,
    recipientId,
    createdAt,
    updatedAt,
  } = data;
  const recipient = await User.findById(recipientId).select("socketId -_id");
  if (recipient?.socketId) {
    io.to(recipient?.socketId).emit("unblocked", data);
  }
  await User.findByIdAndUpdate(senderId, {
    $pull: { blockedUsers: recipientId },
  });
  await DirectSystemMessage.create({
    _id,
    sender: senderId,
    recipient: recipientId,
    conversationId,
    messageType,
    systemEventType,
    metadata,
    eventUserSnapshot,
    createdAt,
    updatedAt,
  });
}
