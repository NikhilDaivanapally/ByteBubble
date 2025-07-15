import { Server } from "socket.io";
import User from "../../models/user.model";
import {
  GroupMessage,
  GroupSystemMessage,
} from "../../models/groupMessage.model";
import { GroupMessageResponse } from "../../types/response/message/group-message-response.type";
import { formatGroupMessages } from "../../utils/formatMessages";

// export async function handleUserRemovedfromGroup(data: any, io: Server) {
//   const { senderId, recipientsIds } = data;
//   await GroupSystemMessage.create({
//     _id: data?._id,
//     sender: data?.senderId,
//     recipients: data?.recipientsIds,
//     messageType: data?.messageType,
//     systemEventType: data?.systemEventType,
//     metadata: data?.metadata,
//     eventUserSnapshot: data?.eventUserSnapshot,
//     conversationId: data?.conversationId,
//     createdAt: data?.createdAt,
//     updatedAt: data?.updatedAt,
//   });

//   const sender = await User.findById(senderId).select("socketId -_id");
//   if (sender?.socketId) {
//     io.to(sender.socketId).emit("system:user:removed:success", data);
//   }

//   const socketPromises = recipientsIds.map((id: string) =>
//     User.findById(id)
//       .select("socketId -_id")
//       .then((user) => user?.socketId)
//   );

//   const socketIds = await Promise.all(socketPromises);
//   socketIds.forEach((socketId) => {
//     if (socketId) {
//       io.to(socketId).emit("system:user:removed:boradcast", data);
//     }
//   });
// }

export async function handleGenerateMessage(message: any, io: Server) {
  try {
    // generate the system message
    const groupMessage = await GroupMessage.create(message);
    const messages = await GroupMessage.find({
      _id: groupMessage?._id,
    }).populate({ path: "sender", select: "_id userName avatar" });
    let formatted: GroupMessageResponse[] = formatGroupMessages(
      messages,
      message?.sender
    );
    const socketPromises = [message?.sender, ...message?.recipients].map(
      (id: any) =>
        User.findById(id)
          .select("socketId -_id")
          .then((user) => user?.socketId)
    );
    const socketIds = await Promise.all(socketPromises);
    socketIds.forEach((socketId) => {
      if (socketId) {
        io.to(socketId).emit("group:message:new", formatted[0]);
      }
    });
  } catch (err) {
    console.log("error", err);
  }
}
