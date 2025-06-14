import { v2 as cloudinary } from "cloudinary";
import GroupConversation from "../../models/GroupConversation.model";
import { Server } from "socket.io";
import mongoose, { Types } from "mongoose";
import User from "../../models/user.model";
// import { ObjectId } from "mongodb";
// import { ObjectId } from "mongodb";
export async function handleCreateGroup(data: any, io: Server) {
  const { title, image, participants, admin } = data;
  const avatar = await cloudinary.uploader.upload(image);
  const document = await GroupConversation.create({
    title,
    avatar: avatar?.secure_url,
    participants,
    admin,
  });

  // Populate references and convert to plain JS object
  let groupCreated = await GroupConversation.findById(document?._id)
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
  const socketIds = participants.map((el: any) => el?.socketId);
  io.to(admin?.socketId).emit("group:new:admin", formattedConversation);
  socketIds.forEach((socketId: any) => {
    if (socketId) {
      io.to(socketId).emit("group:new", formattedConversation);
    } else {
      console.error("Encountered a null or undefined socket ID.");
    }
  });
}

export async function handleAddMembersToGroup(data: any, io: Server) {
  const { _id, senderId, members } = data;

  const newMembers = members
    ?.map(({ _id }: { _id: string }) => {
      if (mongoose.Types.ObjectId.isValid(_id)) {
        return mongoose.Types.ObjectId.createFromHexString(_id);
      }
    })
    .filter((el: any) => el);
  await GroupConversation.updateOne(
    { _id },
    {
      $addToSet: {
        participants: {
          $each: newMembers,
        },
      },
    }
  );

  const sender = await User.findById(senderId).select("socketId -_id");
  if (sender?.socketId) {
    io.to(sender.socketId).emit("group:new:members", {});
  }

  const socketPromises = members.map((member: any) =>
    User.findById(member?._id)
      .select("socketId -_id")
      .then((user) => user?.socketId)
  );

  const socketIds = await Promise.all(socketPromises);
  console.log(socketIds);
  socketIds.forEach((socketId) => {
    if (socketId) {
      io.to(socketId).emit("group:new:members", data);
    }
  });
}
