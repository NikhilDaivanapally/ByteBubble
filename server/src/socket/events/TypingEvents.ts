import { Server, Socket } from "socket.io";
import { handleStartTyping, handleStopTyping } from "../handlers/TypingHandler";

export default function registerTypingEvents(socket: Socket, io: Server) {
  socket.on("typing:start", async (data) => {
    handleStartTyping(data, io);
  });
  socket.on("typing:stop", async (data) => {
    handleStopTyping(data, io);
  });
}
