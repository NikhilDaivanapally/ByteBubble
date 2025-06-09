import { v2 as cloudinary } from "cloudinary";
import OneToManyMessage from "../../models/oneToManyMessage.model";
import { Server } from "socket.io";

export async function handleCreateGroup(data:any, io: Server) {
  const { title, image, participants, admin } = data;
  const avatar = await cloudinary.uploader.upload(image);
  const document = await OneToManyMessage.create({
    title,
    avatar: avatar?.secure_url,
    participants,
    admin,
  });

  // Populate references and convert to plain JS object
  let groupCreated = await OneToManyMessage.findById(document?._id)
    .populate(["admin", "participants"])
    .lean();

  const formattedConversation = {
    _id: groupCreated?._id,
    name: groupCreated?.title,
    avatar: groupCreated?.avatar,
    admin: groupCreated?.admin,
    users: groupCreated?.participants,
    message: {
      messageType: null,
      message: null,
      createdAt: null,
    },
    from: null,
    isOutgoing: null,
    time: "",
    isSeen: null,
    unreadMessagesCount: 0,
  };
  const socket_ids = participants.map((el: any) => el?.socket_id);
  io.to(admin?.socket_id).emit("group:new:admin", formattedConversation);
  socket_ids.forEach((socketId: any) => {
    if (socketId) {
      io.to(socketId).emit("group:new", formattedConversation);
    } else {
      console.error("Encountered a null or undefined socket ID.");
    }
  });
}
