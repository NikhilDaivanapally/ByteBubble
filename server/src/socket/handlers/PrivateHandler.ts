import { Socket } from "socket.io";
import DirectConversation from "../../models/DirectConversation.model";
import mongoose from "mongoose";
import { formatDirectConversations } from "../../utils/formatConversations";

export async function handleStartConversation(
  { to, from }: any,
  socket: Socket
) {
  try {
    if (!to || !from) {
      return socket.emit("error", {
        message: "Both sender and recipient are required.",
      });
    }

    // check if a conversation already exists
    const exisitingConversation = await DirectConversation.findOne({
      participants: { $all: [to, from] },
    });

    // If it doesn't exist, create a new one
    if (!exisitingConversation) {
      await DirectConversation.create({ participants: [from, to] });
    }

    // Fetch the conversation and associated data
    const conversation = await DirectConversation.aggregate([
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
                otpExpiryTime: 0,
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
            socketId: 1,
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
    console.log({ to, from }, formattedConversations);

    socket.emit("chat:start", formattedConversations[0]);
  } catch (error) {
    socket.emit("error", { message: "Failed to initiate chat." });
  }

  const existing_conversations = await DirectConversation.find({
    participants: { $all: [to, from] },
  });
  if (existing_conversations.length === 0) {
    await DirectConversation.create({
      participants: [to, from],
    });
  }
}
