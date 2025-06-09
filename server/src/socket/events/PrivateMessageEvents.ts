import { Server, Socket } from "socket.io";
import {
  handleAudioMessage,
  handleGetDirectMessages,
  handleMessageSeen,
  handleMessageUnreadClear,
  handleMessageUnreadUpdate,
  handlePhotoMessage,
  handleTextMessage,
} from "../handlers/PrivateMessageHandler";

export default function registerPrivateMessageEvents(
  socket: Socket,
  io: Server
) {
  socket.on("messages:get", async (data, callback) => {
    handleGetDirectMessages(data, callback);
  });
  socket.on("message:send", async (messagePayload) => {
    switch (messagePayload.messageType) {
      case "text":
        await handleTextMessage(messagePayload, io);
        break;
      case "photo":
        await handlePhotoMessage(messagePayload, io);
        break;
      case "audio":
        await handleAudioMessage(messagePayload, io);
        break;
      default:
        console.warn("Unknown message type:", messagePayload.messageType);
    }
  });

  socket.on("message:seen", async (messagePayload) => {
    handleMessageSeen(messagePayload, io);
  });
  socket.on("message:unread:update", async (messagePayload) => {
    handleMessageUnreadUpdate(messagePayload, io);
  });

  socket.on("messages:unread:clear", async (messagePayload) => {
    handleMessageUnreadClear(messagePayload, io);
  });
}
