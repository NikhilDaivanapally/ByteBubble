import { Server, Socket } from "socket.io";
import { handleUserRemovedfromGroup } from "../handlers/GroupSystemHandler";

export default function registerGroupSystemEvents(socket: Socket, io: Server) {
  socket.on("system:user:removed", async (data) => {
    handleUserRemovedfromGroup(data, io);
  });
}
