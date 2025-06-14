import { Server } from "socket.io";
import User from "../../models/user.model";
import { Message } from "../../models/message.mode";
import { Readable } from "stream";
import { formatGroupMessages } from "../../utils/formatMessages";
import { v2 as cloudinary } from "cloudinary";
import { gridFSBucket } from "../../db/connectDB";
import { emitToGroup } from "../utils/emitUtils";

type GroupMessageProps = {
  _id: string;
  senderId: string;
  recipientsIds: string;
  messageType: "link" | "text" | "photo" | "audio";
  message: {
    text?: string;
    audioId?: string;
  };
  conversationType: string;
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
    conversationType: message?.conversationType,
    conversationId: message?.conversationId,
    createdAt: message?.createdAt,
    updatedAt: message?.updatedAt,
  };
}

export async function handleGetGroupMessages(data: any, callback: any) {
  const messages = await Message.find({
    conversationId: data.conversationId,
  });
  let formatted = formatGroupMessages(messages, data.authUserId);

  callback(formatted);
}

export async function handleGroupTextMessage(messagePayload: any, io: Server) {
  const { senderId, recipientsIds } = messagePayload;
  await emitToGroup({ senderId, recipientsIds, message: messagePayload, io });
  await Message.create(buildGroupMessage(messagePayload));
}

export async function handleGroupPhotoMessage(messagePayload: any, io: Server) {
  const { senderId, recipientsIds } = messagePayload;
  const { file, text } = messagePayload?.message;
  const image = await cloudinary.uploader.upload(file[0].blob);
  const message = {
    ...messagePayload,
    message: { photoUrl: image?.secure_url, description: text || "" },
  };
  await emitToGroup({ senderId, recipientsIds, message, io });
  await Message.create(buildGroupMessage(message));
}

export async function handleGroupAudioMessage(messagePayload: any, io: Server) {
  const { senderId, recipientsIds } = messagePayload;

  // Convert the Blob to a readable stream
  const readableStream = new Readable();
  readableStream.push(Buffer.from(messagePayload.message));
  readableStream.push(null);

  // Upload to GridFS
  const uploadStream = gridFSBucket.openUploadStream(crypto.randomUUID());
  readableStream.pipe(uploadStream);
  uploadStream.on("finish", async () => {
    const message = {
      ...messagePayload,
      message: { audioId: uploadStream.id },
    };
    await emitToGroup({ senderId, recipientsIds, message, io });
    await Message.create(buildGroupMessage(message));
  });
}

export async function handleGroupMessageSeen(messagePayload: any, io: Server) {
  const sender = await User.findById(messagePayload?.senderId).select(
    "socketId -_id"
  );
  if (sender?.socketId) {
    io.to(sender?.socketId!).emit("group:message:status:seen", messagePayload);
  }
  console.log("Running Messages Seen");
  await Message.findOneAndUpdate(
    { _id: messagePayload?.messageId, isRead: { $ne: messagePayload?.user } },
    { $addToSet: { isRead: messagePayload?.user } }
  );
}

export async function handleGroupMessageUnreadUpdate(
  messagePayload: any,
  io: Server
) {
  const recipientsSocketIds = messagePayload.recipientsIds.map(
    async (id: string) => {
      const { socketId }: any =
        await User.findById(id).select("socketId -_id");
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
  console.log(data);
  const Sender = await User.findById(sender);
  if (Sender?.socketId) {
    io.to(Sender?.socketId!).emit("group:messages:status:seen", {
      conversationId,
      user,
    });
  }
  console.log("Running clear unread");

  const messages = await Message.find({
    conversationId,
    recipients: recipient,
    "isRead.userId": { $ne: user.userId },
  });

  if (messages.length > 0) {
    const bulkOps = messages.map((msg) => ({
      updateOne: {
        filter: { _id: msg._id },
        update: {
          $addToSet: {
            isRead: {
              userId: user.userId,
              seenAt: user.seenAt,
              isSeen: user.isSeen,
            },
          },
        },
      },
    }));

    await Message.bulkWrite(bulkOps);
  }
}
