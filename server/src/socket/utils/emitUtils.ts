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
    User.findById(senderId).select("socketId -_id"),
    User.findById(recipientId).select("socketId -_id"),
  ]);
  if (sender?.socketId) {
    io.to(sender.socketId).emit("message:status:sent", message);
  }
  if (recipient?.socketId) {
    io.to(recipient?.socketId).emit("message:new", message);
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
  const sender = await User.findById(senderId).select("socketId -_id");
  if (sender?.socketId) {
    io.to(sender.socketId).emit("group:message:status:sent", message);
  }

  const socketPromises = recipientsIds.map((id) =>
    User.findById(id)
      .select("socketId -_id")
      .then((user) => user?.socketId)
  );

  const socketIds = await Promise.all(socketPromises);
  socketIds.forEach((socketId) => {
    if (socketId) {
      io.to(socketId).emit("group:message:new", message);
    }
  });
}
