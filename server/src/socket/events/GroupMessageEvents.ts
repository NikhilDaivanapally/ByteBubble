import { Server, Socket } from "socket.io";
import {
  handleGetGroupMessages,
  handleGroupAudioMessage,
  handleGroupMessageSeen,
  handleGroupMessageUnreadClear,
  handleGroupMessageUnreadUpdate,
  handleGroupPhotoMessage,
  handleGroupTextMessage,
} from "../handlers/GroupMessageHandler";

export default function registerGroupMessageEvents(socket: Socket, io: Server) {
  socket.on("group:messages:get", async (data, callback) => {
    handleGetGroupMessages(data, callback);
  });
  socket.on("group:message:send", async (messagePayload) => {
    switch (messagePayload.messageType) {
      case "text":
        await handleGroupTextMessage(messagePayload, io);
        break;
      case "photo":
        await handleGroupPhotoMessage(messagePayload, io);
        break;
      case "audio":
        await handleGroupAudioMessage(messagePayload, io);
        break;
      default:
        console.warn("Unknown message type:", messagePayload.messageType);
    }
  });

  socket.on("group:message:seen", async (messagePayload) => {
    handleGroupMessageSeen(messagePayload, io);
  });

  socket.on("group:message:unread:update", async (messagePayload) => {
    handleGroupMessageUnreadUpdate(messagePayload, io);
  });

  socket.on("group:messages:unread:clear", async (messagePayload) => {
    handleGroupMessageUnreadClear(messagePayload, io);
  });
}
