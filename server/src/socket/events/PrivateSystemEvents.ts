import { Server, Socket } from "socket.io";
import {
  handleUserBlock,
  handleUserUnblock,
} from "../handlers/PrivateSystemHandler";

export default function registerPrivateSystemEvents(
  socket: Socket,
  io: Server
) {
  socket.on("system:user:block", async (data) => {
    handleUserBlock(data, io);
  });
  socket.on("system:user:unblock", async (data) => {
    handleUserUnblock(data, io);
  });
}
