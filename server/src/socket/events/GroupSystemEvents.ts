import { Server, Socket } from "socket.io";
import { handleGenerateMessage } from "../handlers/GroupSystemHandler";

export default function registerGroupSystemEvents(socket: Socket, io: Server) {
  socket.on("system:group:users:added", async (data) => {
    handleGenerateMessage(data, io);
  });
  socket.on("system:group:user:removed", async (data) => {
    handleGenerateMessage(data, io);
  });
  socket.on("system:group:admin:assign", async (data) => {
    handleGenerateMessage(data, io);
  });
  socket.on("system:group:admin:dismiss", async (data) => {
    handleGenerateMessage(data, io);
  });
  socket.on("system:group:renamed", async (data) => {
    handleGenerateMessage(data, io);
  });
  socket.on("system:group:icon:changed", async (data) => {
    handleGenerateMessage(data, io);
  });
  socket.on("system:group:description:updated", async (data) => {
    handleGenerateMessage(data, io);
  });
}
