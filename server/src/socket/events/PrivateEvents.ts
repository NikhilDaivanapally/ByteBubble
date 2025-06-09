import { Server, Socket } from "socket.io";
import { handleStartConversation } from "../handlers/PrivateHandler";

export default function registerPrivateEvents(socket: Socket, io: Server) {
  socket.on("start:conversation", async (data) => {
    handleStartConversation(data, socket);
  });
}
