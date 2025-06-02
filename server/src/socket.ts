import { Server } from "socket.io";
import http from "http";
import { app } from "./app";
import User from "./models/user.model";
import OneToOneMessage from "./models/oneToOneMessage.model";
import { v2 as cloudinary, v2 } from "cloudinary";
import { gridFSBucket } from "./db/connectDB";
import { Readable } from "stream";
import Friendship from "./models/friendship.model";
import { Message } from "./models/message.mode";
import {
  formatDirectMessages,
  formatGroupMessages,
} from "./utils/formatMessages";
import { group, individual } from "./utils/conversationTypes";
import mongoose from "mongoose";
import { formatDirectConversations } from "./utils/formatConversations";
import OneToManyMessage from "./models/oneToManyMessage.model";
import { userSelectFields } from "./constants";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
  // adapter: createAdapter(redis),
});

io.on("connection", async (socket) => {
  const user_id = socket.handshake.query["auth_id"];
  // const socket_id = socket.id;
  if (user_id !== null && Boolean(user_id)) {
    try {
      const user = await User.findByIdAndUpdate(
        user_id, // user id
        {
          socket_id: socket.id, // update
          status: "Online",
        },
        { new: true } // return updated doc
      );

      const friends = await OneToOneMessage.aggregate([
        {
          $match: {
            participants: {
              $in: [user?._id],
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "participants",
            foreignField: "_id",
            as: "user",
            pipeline: [
              {
                $match: {
                  _id: { $ne: user?._id }, // Exclude the current user from the participants
                },
              },
              {
                $project: {
                  password: 0, // Exclude sensitive fields
                  confirmPassword: 0,
                  verified: 0,
                  friends: 0,
                },
              },
            ],
          },
        },
        {
          $unwind: "$user", // Unwind since we expect only one user in the array
        },
        {
          $project: {
            _id: 0,
            user: 1,
          },
        },
      ]);
      const socket_ids = friends?.map(async (friend) => {
        return friend?.user?.socket_id;
      });

      const EmmitStatusTo = await Promise.all(socket_ids);

      EmmitStatusTo.forEach((socketId) => {
        if (socketId) {
          const socketExists = io.sockets.sockets.get(socketId);
          if (socketExists) {
            io.to(socketId).emit("user:online", {
              id: user_id,
            });
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  socket.on("friend:request", async ({ sender, recipient }) => {
    try {
      const [senderUser, recipientUser] = await Promise.all([
        User.findById(sender).select(userSelectFields),
        User.findById(recipient).select(userSelectFields),
      ]);
      if (!senderUser || !recipientUser) return;
      const newRequest = await Friendship.create({ sender, recipient });

      const friendRequest = await Friendship.findById(newRequest._id)
        .select("_id sender recipient status")
        .populate([
          { path: "sender", select: userSelectFields },
          { path: "recipient", select: userSelectFields },
        ]);

      // Notify recipient
      if (recipientUser.socket_id) {
        io.to(recipientUser.socket_id).emit("friend:request:received", {
          message: "You received a new friend request",
          friendRequest,
          from: senderUser,
        });
      }

      // Notify sender
      if (senderUser.socket_id) {
        io.to(senderUser.socket_id).emit("friend:request:sent", {
          message: "Friend request sent successfully",
          friendRequest,
          to: recipientUser,
        });
      }
    } catch (error) {
      console.error("Error in friend:request :", error);
    }
  });

  socket.on(
    "friend:request:accept",
    async ({ request_id }: { request_id: string }) => {
      try {
        const request = await Friendship.findById(request_id);
        if (!request) return;
        const [senderUser, receiverUser] = await Promise.all([
          User.findById(request.sender).select(userSelectFields),
          User.findById(request.recipient).select(userSelectFields),
        ]);

        if (!senderUser || !receiverUser) return;

        request.status = "accepted";
        await request.save({ validateModifiedOnly: true });

        // Notify sender
        if (senderUser.socket_id) {
          io.to(senderUser.socket_id).emit("friend:request:accepted", {
            message: `${receiverUser.userName} accepted your friend request`,
            request,
            friend: receiverUser,
          });
        }

        // Notify receiver
        if (receiverUser.socket_id) {
          io.to(receiverUser.socket_id).emit("friend:request:accepted", {
            message: `You accepted ${senderUser.userName}'s friend request`,
            request,
            friend: senderUser,
          });
        }
      } catch (error) {
        console.error("Error in friend:request:accept:", error);
      }
    }
  );

  socket.on("start:conversation", async ({ to, from }) => {
    try {
      if (!to || !from) {
        return socket.emit("error", {
          message: "Both sender and recipient are required.",
        });
      }

      // check if a conversation already exists
      const exisitingConversation = await OneToOneMessage.findOne({
        participants: { $all: [to, from] },
      });

      // If it doesn't exist, create a new one
      if (!exisitingConversation) {
        await OneToOneMessage.create({ participants: [from, to] });
      }

      // Fetch the conversation and associated data
      const conversation = await OneToOneMessage.aggregate([
        {
          $match: {
            participants: {
              $all: [
                new mongoose.Types.ObjectId(from),
                new mongoose.Types.ObjectId(to),
              ],
            },
          },
        },
        {
          $lookup: {
            from: "users",
            let: { participants: "$participants" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ["$_id", "$$participants"] },
                      { $ne: ["$_id", new mongoose.Types.ObjectId(from)] },
                    ],
                  },
                },
              },
              {
                $project: {
                  password: 0,
                  passwordResetExpires: 0,
                  passwordResetToken: 0,
                  confirmPassword: 0,
                  verified: 0,
                  otp_expiry_time: 0,
                  otp: 0,
                  __v: 0,
                },
              },
            ],
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $lookup: {
            from: "messages",
            localField: "_id",
            foreignField: "conversationId",
            as: "messages",
          },
        },
        {
          $project: {
            _id: 1,
            messages: 1,
            user: {
              _id: 1,
              userName: 1,
              email: 1,
              gender: 1,
              avatar: 1,
              about: 1,
              socket_id: 1,
              createdAt: 1,
              updatedAt: 1,
              status: 1,
            },
          },
        },
      ]);

      if (conversation.length === 0) {
        return socket.emit("error", { message: "Conversation not found." });
      }

      // Format the data
      const formattedConversations = formatDirectConversations(
        conversation,
        from
      );

      socket.emit("chat:start", formattedConversations[0]);
    } catch (error) {
      socket.emit("error", { message: "Failed to initiate chat." });
    }

    const existing_conversations = await OneToOneMessage.find({
      participants: { $all: [to, from] },
    });
    if (existing_conversations.length === 0) {
      await OneToOneMessage.create({
        participants: [to, from],
      });
    }
  });

  socket.on("group:create", async (data) => {
    const { title, image, participants, admin } = data;
    const avatar = await v2.uploader.upload(image);
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
  });

  socket.on("messages:get", async (data, callback) => {
    const messages = await Message.find({
      conversationId: data.conversationId,
    });
    let formatted;
    if (data?.chatType == "group") {
      formatted = formatGroupMessages(messages, data.authUserId);
    } else {
      formatted = formatDirectMessages(messages, data.authUserId);
    }
    callback(formatted);
  });

  socket.on("message:send", async (messagePayload) => {
    switch (messagePayload.messageType) {
      case "text":
        if (messagePayload.conversationType === individual) {
          const sender = await User.findById(messagePayload.sender).select(
            "socket_id -_id"
          );
          const recipient = await User.findById(
            messagePayload.recipients
          ).select("socket_id -_id");
          if (sender?.socket_id) {
            io.to(sender?.socket_id).emit(
              "message:status:sent",
              messagePayload
            );
          }
          if (recipient?.socket_id) {
            io.to(recipient?.socket_id).emit("message:new", messagePayload);
          }
          await Message.create(messagePayload);
        } else if (messagePayload.conversationType === group) {
          const sender = await User.findById(messagePayload.sender).select(
            "socket_id -_id"
          );
          if (sender?.socket_id) {
            io.to(sender?.socket_id).emit(
              "message:status:sent",
              messagePayload
            );
          }
          const recipientsSocketIds = messagePayload.recipients.map(
            async (id: string) => {
              const { socket_id }: any =
                await User.findById(id).select("socket_id -_id");
              return socket_id;
            }
          );
          if (recipientsSocketIds?.length) {
            Promise.all(recipientsSocketIds).then((socketIds) => {
              socketIds.forEach((socketId) => {
                if (socketId) {
                  io.to(socketId).emit("message:new", messagePayload);
                }
              });
            });
          }
          await Message.create(messagePayload);
        }

        break;

      case "photo":
        const { file, text } = messagePayload?.message;
        const image = await v2.uploader.upload(file[0].blob);
        const message = {
          ...messagePayload,
          message: { photoUrl: image?.secure_url, description: text || "" },
        };

        if (messagePayload.conversationType === individual) {
          const sender = await User.findById(messagePayload.sender).select(
            "socket_id -_id"
          );
          const recipient = await User.findById(
            messagePayload.recipients
          ).select("socket_id -_id");

          if (sender?.socket_id) {
            io.to(sender?.socket_id).emit("message:status:sent", message);
          }

          if (recipient?.socket_id) {
            io.to(recipient?.socket_id).emit("message:new", message);
          }
          await Message.create(message);
        } else if (messagePayload.conversationType === group) {
          const sender = await User.findById(messagePayload.sender).select(
            "socket_id -_id"
          );
          if (sender?.socket_id) {
            io.to(sender?.socket_id).emit("message:status:sent", message);
          }
          const recipientsSocketIds = messagePayload.recipients.map(
            async (id: string) => {
              const { socket_id }: any =
                await User.findById(id).select("socket_id -_id");
              return socket_id;
            }
          );
          if (recipientsSocketIds?.length) {
            Promise.all(recipientsSocketIds).then((socketIds) => {
              socketIds.forEach((socketId) => {
                if (socketId) {
                  io.to(socketId).emit("message:new", message);
                }
              });
            });
          }
          await Message.create(message);
        }

        break;

      case "audio":
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

          if (messagePayload.conversationType === individual) {
            const sender = await User.findById(messagePayload.sender).select(
              "socket_id -_id"
            );
            const recipient = await User.findById(
              messagePayload.recipients
            ).select("socket_id -_id");

            if (sender?.socket_id) {
              io.to(sender?.socket_id).emit("message:status:sent", message);
            }

            if (recipient?.socket_id) {
              io.to(recipient?.socket_id).emit("message:new", message);
            }
            await Message.create(message);
          } else if (messagePayload.conversationType === group) {
            const sender = await User.findById(messagePayload.sender).select(
              "socket_id -_id"
            );
            if (sender?.socket_id) {
              io.to(sender?.socket_id).emit("message:status:sent", message);
            }
            const recipientsSocketIds = messagePayload.recipients.map(
              async (id: string) => {
                const { socket_id }: any =
                  await User.findById(id).select("socket_id -_id");
                return socket_id;
              }
            );
            if (recipientsSocketIds?.length) {
              Promise.all(recipientsSocketIds).then((socketIds) => {
                socketIds.forEach((socketId) => {
                  if (socketId) {
                    io.to(socketId).emit("message:new", message);
                  }
                });
              });
            }
            await Message.create(message);
          }
        });

        break;

      default:
        break;
    }
  });

  socket.on("message:seen", async (messagePayload) => {
    const sender = await User.findById(messagePayload?.sender).select(
      "socket_id -_id"
    );
    if (sender?.socket_id) {
      io.to(sender?.socket_id!).emit("message:status:seen", messagePayload);
    }
    await Message.findOneAndUpdate(
      { _id: messagePayload?._id },
      { $set: { isRead: true } }
    );
  });

  socket.on("message:unread:update", async (messagePayload) => {
    switch (messagePayload?.conversationType) {
      case individual:
        const recipient = await User.findById(messagePayload.recipients);
        if (recipient?.socket_id) {
          io.to(recipient?.socket_id).emit(
            "messages:unread:count",
            messagePayload
          );
        }
        break;
      case group:
        const recipientsSocketIds = messagePayload.recipients.map(
          async (id: string) => {
            const { socket_id }: any =
              await User.findById(id).select("socket_id -_id");
            return socket_id;
          }
        );
        if (recipientsSocketIds?.length) {
          Promise.all(recipientsSocketIds).then((socketIds) => {
            socketIds.forEach((socketId) => {
              if (socketId) {
                io.to(socketId).emit("messages:unread:count", messagePayload);
              }
            });
          });
        }
        break;
      default:
        break;
    }
  });

  socket.on("messages:unread:clear", async (data) => {
    const { conversationId, recipients, sender } = data;
    const Sender = await User.findById(sender);
    if (Sender?.socket_id) {
      io.to(Sender?.socket_id!).emit("messages:status:seen", conversationId);
    }
    await Message.updateMany(
      { conversationId, recipients },
      { $set: { isRead: true } }
    );
  });

  interface TypingData {
    roomId: string;
    user: {
      userName: string;
      auth_id: string;
    };
    chatType: "individual" | "group";
    currentConversation: string[] | string;
  }

  interface UserSocketInfo {
    socket_id: string;
  }

  // show typing - stopTyping status event
  socket.on("typing:start", async (data: TypingData) => {
    const { roomId, user, chatType, currentConversation } = data;

    try {
      switch (chatType) {
        case "individual": {
          const recipient = await User.findById(currentConversation as string)
            .select("socket_id -_id")
            .lean<UserSocketInfo | null>();

          if (recipient?.socket_id) {
            io.to(recipient.socket_id).emit("user:typing:start", {
              userName: user.userName,
              roomId,
            });
          }
          break;
        }

        case "group": {
          const groupInfo = await OneToManyMessage.findById(roomId)
            .select("admin")
            .lean<{ admin: string } | null>();
          if (!groupInfo) {
            return;
          }
          const { admin } = groupInfo;
          const recipientIds: string[] = [
            ...(currentConversation as string[]),
            admin.toString(),
          ].filter((id) => id !== user.auth_id);
          const socketInfoPromises = recipientIds.map(async (id) => {
            const user = await User.findById(id).select("socket_id -_id");
            return user?.socket_id;
          });

          const recipients = await Promise.all(socketInfoPromises);

          recipients.forEach((socketId) => {
            if (socketId && io.sockets.sockets.get(socketId)) {
              io.to(socketId).emit("user:typing:start", {
                userName: user.userName,
                roomId,
              });
            }
          });
          break;
        }
        default:
          console.warn(
            "Invalid chat type specified. Typing event not emitted."
          );
          break;
      }
    } catch (error: any) {
      console.error("Error handling typing event:", error.message || error);
    }
  });

  socket.on("typing:stop", async (data: TypingData) => {
    const { roomId, user, chatType, currentConversation } = data;

    try {
      switch (chatType) {
        case "individual": {
          const recipient = await User.findById(currentConversation as string)
            .select("socket_id -_id")
            .lean<UserSocketInfo | null>();

          if (recipient?.socket_id) {
            io.to(recipient.socket_id).emit("user:typing:stop", {
              userName: user.userName,
              roomId,
            });
          }
          break;
        }

        case "group": {
          const messageDoc = await OneToManyMessage.findById(roomId)
            .select("admin")
            .lean<{ admin: string } | null>();

          if (!messageDoc) {
            return;
          }

          const { admin } = messageDoc;
          const recipientIds: string[] = [
            ...(currentConversation as string[]),
            admin.toString(),
          ].filter((id) => id !== user.auth_id);

          const socketInfoPromises = recipientIds.map(async (id) => {
            const user = await User.findById(id).select("socket_id -_id");
            return user?.socket_id;
          });

          const recipients = await Promise.all(socketInfoPromises);

          recipients.forEach((socketId) => {
            if (socketId && io.sockets.sockets.get(socketId)) {
              io.to(socketId).emit("user:typing:stop", {
                userName: user.userName,
                roomId,
              });
            }
          });
          break;
        }

        default:
          console.warn(
            "Invalid type provided. Unable to emit stop typing event."
          );
          break;
      }
    } catch (error: any) {
      console.error(
        "Error handling user:typing:stop event:",
        error.message || error
      );
    }
  });

  socket.on("exit", async (data) => {
    const { user_id, friends } = data;
    if (!user_id || !friends) return;
    await User.findByIdAndUpdate(
      user_id, // user id
      {
        socket_id: socket.id, // update
        status: "Offline",
      },
      { new: true } // return updated doc
    );
    const socket_ids = friends?.map(async (id: string) => {
      const { socket_id }: any =
        await User.findById(id).select("socket_id -_id");
      return socket_id;
    });

    const EmmitStatusTo = await Promise.all(socket_ids);
    EmmitStatusTo.forEach((socketId) => {
      if (socketId) {
        const socketExists = io.sockets.sockets.get(socketId);
        if (socketExists) {
          io.to(socketId).emit("user:offline", {
            id: user_id,
          });
        } else {
          console.error(`Socket ID not connected: ${socketId}`);
        }
      } else {
        console.error("Encountered a null or undefined socket ID.");
      }
    });

    socket.disconnect(true);
  });
});

export { server };
