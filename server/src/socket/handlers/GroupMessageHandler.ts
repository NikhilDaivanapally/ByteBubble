import { Server } from "socket.io";
import { Readable } from "stream";
import { formatGroupMessages } from "../../utils/formatMessages";
import { v2 as cloudinary } from "cloudinary";
import { gridFSBucket } from "../../db/connectDB";
import { emitToGroup } from "../utils/emitUtils";
import {
  GroupAudioMessage,
  GroupImageMessage,
  GroupMessage,
  GroupTextMessage,
} from "../../models/groupMessage.model";
import User from "../../models/user.model";
import { GroupMessageResponse } from "../../types/response/message/group-message-response.type";
import { ObjectId } from "bson";
import { MessageType } from "../../constants/message-types";
import { MessageContent } from "../../types/message-content-type";

type GroupMessageProps = {
  _id: string;
  senderId: string;
  recipientsIds: string[];
  messageType: MessageType;
  message: MessageContent;
  conversationId: string;
  createdAt: string;
  updatedAt: string;
};

function buildGroupMessage(message: GroupMessageProps) {
  return {
    _id: message?._id,
    sender: message?.senderId,
    recipients: message?.recipientsIds,
    messageType: message?.messageType,
    message: message?.message,
    conversationId: message?.conversationId,
    createdAt: message?.createdAt,
    updatedAt: message?.updatedAt,
  };
}

export async function handleGetGroupMessages(data: any, callback: any) {
  const messages = await GroupMessage.find({
    conversationId: data.conversationId,
  }).populate({ path: "sender", select: "_id userName avatar" });
  let formatted: GroupMessageResponse[] = formatGroupMessages(
    messages,
    data.authUserId
  );
  callback(formatted);
}

export async function handleGroupTextMessage(messagePayload: any, io: Server) {
  const {
    _id,
    messageType,
    message,
    conversationId,
    createdAt,
    updatedAt,
    from,
    senderId,
    recipientsIds,
  } = messagePayload;
  const formatMessage = {
    _id,
    messageType,
    message,
    conversationId,
    from,
    senderId,
    recipientsIds,
    createdAt,
    updatedAt,
  };
  await emitToGroup({ senderId, recipientsIds, message: formatMessage, io });
  await GroupTextMessage.create(buildGroupMessage(messagePayload));
}

export async function handleGroupImageMessage(messagePayload: any, io: Server) {
  const { senderId, recipientsIds } = messagePayload;
  const { file, text } = messagePayload?.message;
  const image = await cloudinary.uploader.upload(file[0].blob);
  const message = {
    ...messagePayload,
    message: { imageUrl: image?.secure_url, description: text || "" },
  };
  await emitToGroup({ senderId, recipientsIds, message, io });
  await GroupImageMessage.create(buildGroupMessage(message));
}

export async function handleGroupAudioMessage(messagePayload: any, io: Server) {
  const { senderId, recipientsIds } = messagePayload;

  // Convert the Blob to a readable stream
  const readableStream = new Readable();
  readableStream.push(Buffer.from(messagePayload.message));
  readableStream.push(null);

  // Upload to GridFS
  const uploadStream = gridFSBucket.openUploadStream(
    new ObjectId().toHexString()
  );
  readableStream.pipe(uploadStream);
  uploadStream.on("finish", async () => {
    const message = {
      ...messagePayload,
      message: { audioId: uploadStream.id },
    };
    await emitToGroup({ senderId, recipientsIds, message, io });
    await GroupAudioMessage.create(buildGroupMessage(message));
  });
}

export async function handleMessage(messagePayload: any, io: Server) {
  const { senderId, recipientsIds } = messagePayload;
  await emitToGroup({ senderId, recipientsIds, message: messagePayload, io });
  await GroupMessage.create(buildGroupMessage(messagePayload));
}

export async function handleGroupMessageSeen(messagePayload: any, io: Server) {
  const sender = await User.findById(messagePayload?.senderId).select(
    "socketId -_id"
  );
  if (sender?.socketId) {
    io.to(sender?.socketId!).emit("group:message:status:seen", messagePayload);
  }
  await GroupMessage.findOneAndUpdate(
    { _id: messagePayload?.messageId, readBy: { $ne: messagePayload?.user } },
    { $addToSet: { readBy: messagePayload?.user } }
  );
}

export async function handleGroupMessageUnreadUpdate(
  messagePayload: any,
  io: Server
) {
  const recipientsSocketIds = messagePayload.recipientsIds.map(
    async (id: string) => {
      const { socketId }: any = await User.findById(id).select("socketId -_id");
      return socketId;
    }
  );
  if (recipientsSocketIds?.length) {
    Promise.all(recipientsSocketIds).then((socketIds) => {
      socketIds.forEach((socketId) => {
        if (socketId) {
          io.to(socketId).emit("group:messages:unread:count", messagePayload);
        }
      });
    });
  }
}

export async function handleGroupMessageUnreadClear(data: any, io: Server) {
  const { conversationId, recipient, sender, user } = data;
  const Sender = await User.findById(sender);
  if (Sender?.socketId) {
    io.to(Sender?.socketId!).emit("group:messages:status:seen", {
      conversationId,
      user,
    });
  }
  console.log("Running clear unread");

  const messages = await GroupMessage.find({
    conversationId,
    recipients: recipient,
    "readBy.userId": { $ne: user.userId },
  });

  if (messages.length > 0) {
    const bulkOps = messages.map((msg) => ({
      updateOne: {
        filter: { _id: msg._id },
        update: {
          $addToSet: {
            readBy: {
              userId: user.userId,
              seenAt: user.seenAt,
              isRead: user.isRead,
            },
          },
        },
      },
    }));

    await GroupMessage.bulkWrite(bulkOps);
  }
}
