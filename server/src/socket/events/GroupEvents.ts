import { Server, Socket } from "socket.io";
import {
  handleAddMembers,
  handleCreateGroup,
  handleAdminDismiss,
  handleAdminAssign,
  handleRemoveMember,
} from "../handlers/GroupHandler";

export default function registerGroupEvents(socket: Socket, io: Server) {
  socket.on("group:create", async (data) => {
    handleCreateGroup(data, io);
  });
  socket.on("group:admin:assign", async (data) => {
    handleAdminAssign(data, io);
  });
  socket.on("group:admin:dismiss", async (data) => {
    handleAdminDismiss(data, io);
  });

  socket.on("group:add:members", async (data) => {
    handleAddMembers(data, io);
  });

  socket.on("group:remove:member", async (data) => {
    handleRemoveMember(data, io);
  });

  socket.on("group:update", async () => {});
  socket.on("group:delete", async () => {});
  socket.on("group:join", async () => {});
  socket.on("group:leave", async () => {});
}
