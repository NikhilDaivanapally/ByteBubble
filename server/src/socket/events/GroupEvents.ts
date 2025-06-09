import { Server, Socket } from "socket.io";
import { handleCreateGroup } from "../handlers/GroupHandler";

export default function registerGroupEvents(socket: Socket, io: Server) {
  socket.on("group:create", async (data) => {
    handleCreateGroup(data, io);
  });
  socket.on("group:update", async () => {});
  socket.on("group:delete", async () => {});
  socket.on("group:add:member", async () => {});
  socket.on("group:remove:member", async () => {});
  socket.on("group:join", async () => {});
  socket.on("group:leave", async () => {});
}
