import { v2 as cloudinary } from "cloudinary";
import GroupConversation from "../../models/groupConversation.model";
import { Server } from "socket.io";
import mongoose, { Types } from "mongoose";
import User from "../../models/user.model";
import { formatGroupConversations } from "../../utils/formatConversations";
import { getGroupConversationsPipeline } from "../../pipelines/conversations/getGroupConversations.pipeline";
import { AggregatedGroupConversation } from "../../types/aggregated-response/conversation/group-conversation-aggregate.type";
import { GroupConversationResponse } from "../../types/response/conversation/group-conversation-response.type";
export async function handleCreateGroup(data: any, io: Server) {
  const { name, image, participants, createdBy } = data;
  const avatar = await cloudinary.uploader.upload(image);
  const document = await GroupConversation.create({
    name,
    avatar: avatar?.secure_url,
    participants,
    createdBy,
  });

  const Groupconversation = await GroupConversation.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(document?._id),
      },
    },
    ...getGroupConversationsPipeline(),
  ]);

  const formattedGroupConversation: GroupConversationResponse[] =
    formatGroupConversations(
      Groupconversation as AggregatedGroupConversation[],
      createdBy as string
    );

  const participantsIds = participants.filter((id: string) => id !== createdBy);

  const sender = await User.findById(createdBy).select("socketId -_id");
  if (sender?.socketId) {
    io.to(sender.socketId).emit(
      "group:new:admin",
      formattedGroupConversation[0]
    );
  }

  const socketPromises = participantsIds.map((id: Types.ObjectId) =>
    User.findById(id)
      .select("socketId -_id")
      .then((user) => user?.socketId)
  );

  const socketIds = await Promise.all(socketPromises);
  socketIds.forEach((socketId) => {
    if (socketId) {
      io.to(socketId).emit("group:new", formattedGroupConversation[0]);
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
