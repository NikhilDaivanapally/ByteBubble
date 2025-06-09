import { Server } from "socket.io";
import User from "../../models/user.model";
import OneToManyMessage from "../../models/oneToManyMessage.model";

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
export async function handleStartTyping(data: TypingData, io: Server) {
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
        console.warn("Invalid chat type specified. Typing event not emitted.");
        break;
    }
  } catch (error: any) {
    console.error("Error handling typing event:", error.message || error);
  }
}
export async function handleStopTyping(data: TypingData, io: Server) {
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
}
