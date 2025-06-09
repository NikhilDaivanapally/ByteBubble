import { Server, Socket } from "socket.io";
import {
  handleFriendRequest,
  handleFriendRequestAccept,
} from "../handlers/FriendRequestHandler";

export default function registerFriendRequestEvents(
  socket: Socket,
  io: Server
) {
  socket.on("friend:request", async (data) => {
    handleFriendRequest(data, io);
  });

  socket.on("friend:request:accept", async (data) => {
    handleFriendRequestAccept(data, io);
  });
}
