import { Server } from "socket.io";
import User from "../../models/user.model";

export async function emitToPrivate({
  senderId,
  recipientId,
  message,
  io,
}: {
  senderId: string;
  recipientId: string;
  message: any;
  io: Server;
}) {
  const [sender, recipient] = await Promise.all([
    User.findById(senderId).select("socket_id -_id"),
    User.findById(recipientId).select("socket_id -_id"),
  ]);
  if (sender?.socket_id) {
    io.to(sender.socket_id).emit("message:status:sent", message);
  }
  if (recipient?.socket_id) {
    io.to(recipient?.socket_id).emit("message:new", message);
  }
}

export async function emitToGroup({
  senderId,
  recipientsIds,
  message,
  io,
}: {
  senderId: string;
  recipientsIds: string[];
  message: any;
  io: Server;
}) {
  const sender = await User.findById(senderId).select("socket_id -_id");
  if (sender?.socket_id) {
    io.to(sender.socket_id).emit("group:message:status:sent", message);
  }

  const socketPromises = recipientsIds.map((id) =>
    User.findById(id)
      .select("socket_id -_id")
      .then((user) => user?.socket_id)
  );

  const socketIds = await Promise.all(socketPromises);
  socketIds.forEach((socketId) => {
    if (socketId) {
      io.to(socketId).emit("group:message:new", message);
    }
  });
}
