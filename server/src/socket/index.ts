import http from "http";
import { app } from "../app";
import { Server } from "socket.io";
import User from "../models/user.model";
import OneToOneMessage from "../models/oneToOneMessage.model";
import registerPrivateEvents from "./events/PrivateEvents";
import registerGroupEvents from "./events/GroupEvents";
import registerGroupMessageEvents from "./events/GroupMessageEvents";
import registerPrivateMessageEvents from "./events/PrivateMessageEvents";
import registerFriendRequestEvents from "./events/FriendRequestEvents";
import registerTypingEvents from "./events/TypingEvents";
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
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

  registerPrivateEvents(socket, io);
  registerGroupEvents(socket, io);
  registerPrivateMessageEvents(socket, io);
  registerGroupMessageEvents(socket, io);
  registerFriendRequestEvents(socket, io);
  registerTypingEvents(socket, io);

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
