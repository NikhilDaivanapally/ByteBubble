import { Server } from "socket.io";
import { userSelectFields } from "../../constants";
import User from "../../models/user.model";
import Friendship from "../../models/friendship.model";

export async function handleFriendRequest(
  { sender, recipient }: any,
  io: Server
) {
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
    if (recipientUser.socketId) {
      io.to(recipientUser.socketId).emit("friend:request:received", {
        message: "You received a new friend request",
        friendRequest,
        from: senderUser,
      });
    }

    // Notify sender
    if (senderUser.socketId) {
      io.to(senderUser.socketId).emit("friend:request:sent", {
        message: "Friend request sent successfully",
        friendRequest,
        to: recipientUser,
      });
    }
  } catch (error) {
    console.error("Error in friend:request :", error);
  }
}

export async function handleFriendRequestAccept(
  { request_id }: any,
  io: Server
) {
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
    if (senderUser.socketId) {
      io.to(senderUser.socketId).emit("friend:request:accepted", {
        message: `${receiverUser.userName} accepted your friend request`,
        request,
        friend: receiverUser,
      });
    }

    // Notify receiver
    if (receiverUser.socketId) {
      io.to(receiverUser.socketId).emit("friend:request:accepted", {
        message: `You accepted ${senderUser.userName}'s friend request`,
        request,
        friend: senderUser,
      });
    }
  } catch (error) {
    console.error("Error in friend:request:accept:", error);
  }
}
