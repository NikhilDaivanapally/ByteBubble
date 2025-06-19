import { Server } from "socket.io";
import User from "../../models/user.model";
import { GroupSystemMessage } from "../../models/groupMessage.model";

export async function handleUserRemovedfromGroup(data: any, io: Server) {
  const { senderId, recipientsIds } = data;
  await GroupSystemMessage.create({
    _id: data?._id,
    sender: data?.senderId,
    recipients: data?.recipientsIds,
    messageType: data?.messageType,
    systemEventType: data?.systemEventType,
    metadata: data?.metadata,
    eventUserSnapshot: data?.eventUserSnapshot,
    conversationId: data?.conversationId,
    createdAt: data?.createdAt,
    updatedAt: data?.updatedAt,
  });

  const sender = await User.findById(senderId).select("socketId -_id");
  if (sender?.socketId) {
    io.to(sender.socketId).emit("system:user:removed:success", data);
  }

  const socketPromises = recipientsIds.map((id: string) =>
    User.findById(id)
      .select("socketId -_id")
      .then((user) => user?.socketId)
  );

  const socketIds = await Promise.all(socketPromises);
  socketIds.forEach((socketId) => {
    if (socketId) {
      io.to(socketId).emit("system:user:removed:boradcast", data);
    }
  });
}
