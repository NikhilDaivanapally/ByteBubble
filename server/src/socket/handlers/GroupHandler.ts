import { v2 as cloudinary } from "cloudinary";
import GroupConversation from "../../models/GroupConversation.model";
import { Server } from "socket.io";
import mongoose, { Types } from "mongoose";
import User from "../../models/user.model";
import { formatGroupConversations } from "../../utils/formatConversations";
import { getGroupConversationsPipeline } from "../../pipelines/conversations/getGroupConversations.pipeline";
import { AggregatedGroupConversation } from "../../types/aggregated-response/conversation/group-conversation-aggregate.type";
import { GroupConversationResponse } from "../../types/response/conversation/group-conversation-response.type";
import { GroupMessage } from "../../models/groupMessage.model";
import { ObjectId } from "bson";
import { formatGroupMessages } from "../../utils/formatMessages";
import { GroupMessageResponse } from "../../types/response/message/group-message-response.type";
export async function handleCreateGroup(data: any, io: Server) {
  const { name, image, participants, createdBy } = data;

  let doc: any = {
    name,
    participants,
    createdBy: createdBy?._id,
    admins: [createdBy?._id],
  };

  if (image) {
    const avatar = await cloudinary.uploader.upload(image);
    doc.avatar = avatar?.secure_url;
  }
  // create group
  const document = await GroupConversation.create(doc);

  const messagePayload = {
    _id: new ObjectId().toHexString(),
    sender: createdBy?._id,
    recipients: participants,
    messageType: "system",
    systemEventType: "group_created",
    metadata: createdBy,
    userSnapshotSchema: createdBy,
    conversationId: document._id,
  };

  // add group created system message
  await GroupMessage.create(messagePayload);

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
      createdBy?._id as string
    );

  const socketPromises = participants.map((id: Types.ObjectId) =>
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

export async function handleAdminAssign(data: any, io: Server) {
  try {
    const { memberId, conversationId, broadCastTo } = data;
    await GroupConversation.findByIdAndUpdate(
      conversationId,
      { $addToSet: { admins: memberId } },
      { new: true }
    );
    const socketPromises = broadCastTo.map((id: any) =>
      User.findById(id)
        .select("socketId -_id")
        .then((user) => user?.socketId)
    );

    const socketIds = await Promise.all(socketPromises);
    socketIds.forEach((socketId) => {
      if (socketId) {
        io.to(socketId).emit("group:admin:assign:success", {
          memberId,
          conversationId,
        });
      }
    });
  } catch (error) {}
}

export async function handleAdminDismiss(data: any, io: Server) {
  // try {
  //   const { _id, conversationId, messagePayload } = data;
  //   const { sender, recipients } = messagePayload;

  //   // removed _id in admins array
  //   const conversation = await GroupConversation.findByIdAndUpdate(
  //     conversationId,
  //     { $pull: { admins: _id } },
  //     { new: true }
  //   );

  //   // generate the system message
  //   const groupMessage = await GroupMessage.create(messagePayload);
  //   const messages = await GroupMessage.find({
  //     _id: groupMessage?._id,
  //   }).populate({ path: "sender", select: "_id userName avatar" });
  //   let formatted: GroupMessageResponse[] = formatGroupMessages(
  //     messages,
  //     sender
  //   );
  //   const socketPromises = [sender, ...recipients].map((id: any) =>
  //     User.findById(id)
  //       .select("socketId -_id")
  //       .then((user) => user?.socketId)
  //   );

  //   const socketIds = await Promise.all(socketPromises);
  //   socketIds.forEach((socketId) => {
  //     if (socketId) {
  //       io.to(socketId).emit("group:message:new", formatted[0]);
  //     }
  //   });
  // } catch (err) {
  //   console.log("error", err);
  // }

  try {
    const { memberId, conversationId, broadCastTo } = data;
    await GroupConversation.findByIdAndUpdate(
      conversationId,
      { $pull: { admins: memberId } },
      { new: true }
    );
    const socketPromises = broadCastTo.map((id: any) =>
      User.findById(id)
        .select("socketId -_id")
        .then((user) => user?.socketId)
    );

    const socketIds = await Promise.all(socketPromises);
    socketIds.forEach((socketId) => {
      if (socketId) {
        io.to(socketId).emit("group:admin:dismiss:success", {
          memberId,
          conversationId,
        });
      }
    });
  } catch (error) {}
}

export async function handleAddMembers(data: any, io: Server) {
  const { conversationId, senderId, members, broadCastTo } = data;

  const newMembers = members
    ?.map(({ _id }: { _id: string }) => {
      if (mongoose.Types.ObjectId.isValid(_id)) {
        return mongoose.Types.ObjectId.createFromHexString(_id);
      }
    })
    .filter((el: any) => el);
  await GroupConversation.findByIdAndUpdate(conversationId, {
    $addToSet: {
      participants: {
        $each: newMembers,
      },
    },
  });

  const socketPromises = broadCastTo.map((id: any) =>
    User.findById(id)
      .select("socketId -_id")
      .then((user) => user?.socketId)
  );

  const socketIds = await Promise.all(socketPromises);
  socketIds.forEach((socketId) => {
    if (socketId) {
      io.to(socketId).emit("group:remove:member:success", {
        members,
        conversationId,
      });
    }
  });
}

export async function handleRemoveMember(data: any, io: Server) {
  try {
    const { memberId, conversationId, broadCastTo } = data;
    await GroupConversation.findByIdAndUpdate(
      conversationId,
      { $pull: { participants: memberId, admins: memberId } },
      { new: true }
    );
    const socketPromises = broadCastTo.map((id: any) =>
      User.findById(id)
        .select("socketId -_id")
        .then((user) => user?.socketId)
    );

    const socketIds = await Promise.all(socketPromises);
    socketIds.forEach((socketId) => {
      if (socketId) {
        io.to(socketId).emit("group:remove:member:success", {
          memberId,
          conversationId,
        });
      }
    });
  } catch (error) {}
}
