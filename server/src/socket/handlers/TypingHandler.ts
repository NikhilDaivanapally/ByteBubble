import { Server } from "socket.io";
import User from "../../models/user.model";

interface TypingData {
  roomId: string;
  user: {
    userName: string;
    auth_id: string;
  };
  chatType: "direct" | "group";
  currentConversation: string[] | string;
}

interface UserSocketInfo {
  socketId: string;
}

export async function handleStartTyping(data: TypingData, io: Server) {
  const { roomId, user, chatType, currentConversation } = data;
  try {
    switch (chatType) {
      case "direct": {
        const recipient = await User.findById(currentConversation as string)
          .select("socketId -_id")
          .lean<UserSocketInfo | null>();

        if (recipient?.socketId) {
          io.to(recipient.socketId).emit("user:typing:start", {
            userName: user.userName,
            roomId,
          });
        }
        break;
      }

      case "group": {
        const recipientIds: string[] = (currentConversation as [])?.filter(
          (id: string) => id !== user.auth_id
        );
        const socketInfoPromises = recipientIds.map(async (id) => {
          const user = await User.findById(id).select("socketId -_id");
          return user?.socketId;
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
      case "direct": {
        const recipient = await User.findById(currentConversation as string)
          .select("socketId -_id")
          .lean<UserSocketInfo | null>();

        if (recipient?.socketId) {
          io.to(recipient.socketId).emit("user:typing:stop", {
            userName: user.userName,
            roomId,
          });
        }
        break;
      }

      case "group": {
        const recipientIds: string[] = (currentConversation as [])?.filter(
          (id: string) => id !== user.auth_id
        );

        const socketInfoPromises = recipientIds.map(async (id) => {
          const user = await User.findById(id).select("socketId -_id");
          return user?.socketId;
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
