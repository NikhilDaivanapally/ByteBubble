import mongoose, { Types } from "mongoose";
import { filterObj } from "../utils/filterObj";
import { uploadCloudinary } from "../utils/cloudinary";
import User from "../models/user.model";
import { NextFunction, Request, Response } from "express";
import Friendship from "../models/friendship.model";
import { User as UserType } from "../types/user.type";
import DirectConversation from "../models/DirectConversation.model";
import GroupConversation from "../models/GroupConversation.model";
import { Message } from "../models/message.mode";
import {
  DirectConversationInput,
  formatDirectConversations,
  formatGroupConversations,
  GroupConversationInput,
} from "../utils/formatConversations";
import { group, individual } from "../utils/conversationTypes";
import { userSelectFields } from "../constants";

interface updateProfileRequest extends Request {
  user?: {
    _id: string;
  };
}

const updateProfile = async (req: updateProfileRequest, res: Response) => {
  const filteredBody = filterObj(req.body, "userName", "about", "email");
  const avatarLocalpath = req.file?.path;
  let avatar;
  if (avatarLocalpath) {
    avatar = await uploadCloudinary(avatarLocalpath);
  }

  if (avatar?.secure_url) {
    filteredBody.avatar = avatar.secure_url;
  }
  const userDoc = await User.findByIdAndUpdate(req.user?._id, filteredBody, {
    new: true,
    validateModifiedOnly: true,
  });

  res.status(200).json({
    status: "success",
    data: userDoc,
    message: "User Updated successfully",
  });
  return;
};

const getUsers = async (req: updateProfileRequest, res: Response) => {
  const currentUserId = req.user?._id;
  const all_users = await User.find({ verified: true }).select(
    userSelectFields
  );

  // Fetch friendships where the current user is either sender or recipient
  const currentuser_friends = await Friendship.find({
    $or: [{ sender: currentUserId }, { recipient: currentUserId }],
  });

  // Extract IDs that are not the current user's ID
  const friendIds = currentuser_friends.map((friendship) => {
    return String(friendship.sender) === String(currentUserId)
      ? friendship?.recipient?.toString()
      : friendship?.sender?.toString();
  });
  const remaining_users = all_users.filter((user) => {
    return (
      !friendIds.includes(user?._id?.toString()!) &&
      user?._id?.toString() !== currentUserId?.toString()
    );
  });
  res.status(200).json({
    status: "success",
    data: remaining_users,
    message: "Users found successfully!",
  });
};

const getFriends = async (
  req: updateProfileRequest,
  res: Response,
  next: NextFunction
) => {
  const pipeline = [
    // Match documents where the sender or recipient matches the provided ID
    {
      $match: {
        $and: [
          {
            $or: [{ sender: req.user?._id }, { recipient: req.user?._id }],
          },
          { status: "accepted" },
        ],
      },
    },
    // Determine the other party (the sender or recipient that is NOT the provided ID)
    {
      $project: {
        otherParty: {
          $cond: {
            if: { $eq: ["$sender", req.user?._id] },
            then: "$recipient",
            else: "$sender",
          },
        },
      },
    },
    // Lookup to fetch the details of the other party from the 'users' collection
    {
      $lookup: {
        from: "users", // The collection containing user data
        localField: "otherParty", // Field in the current collection
        foreignField: "_id", // Field in the 'users' collection
        as: "userDetails", // Output field containing matched user documents
        pipeline: [
          // Exclude fields here using $project
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
      },
    },
    // Unwind the userDetails array
    {
      $unwind: "$userDetails",
    },
    // Group all userDetails into a single array
    {
      $group: {
        _id: null, // Group all documents together
        users: { $addToSet: "$userDetails" }, // Combine all userDetails into a single array
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ];
  const Userfriends = await Friendship.aggregate(pipeline);
  res.status(200).json({
    status: "success",
    data: Userfriends[0]?.users,
    message: "friends found successfully",
  });
};

const getFriendrequest = async (req: updateProfileRequest, res: Response) => {
  const requests = await Friendship.find({
    $or: [
      {
        recipient: req.user?._id,
      },
      {
        sender: req.user?._id,
      },
    ],
    status: "pending",
  })
    .select("_id sender recipient")
    .populate({
      path: "sender recipient",
      select: userSelectFields,
    });
  res.status(200).json({
    status: "success",
    data: requests,
    message: "friend requests found successfully",
  });
};

const getDirectConversations = async (
  req: updateProfileRequest,
  res: Response
) => {
  try {
    const Existing_Direct_Conversations = await DirectConversation.aggregate([
      {
        $match: {
          participants: {
            $in: [req.user?._id],
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
                _id: { $ne: req.user?._id }, // Exclude the current user from the participants
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
        },
      },
      {
        $unwind: "$user", // Unwind since we expect only one user in the array
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
          messages: 1, // Include messages
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
          }, // The user field will now contain the desired user object
        },
      },
    ]);

    const authUserId = req.user?._id as string;
    const formatted = formatDirectConversations(
      Existing_Direct_Conversations,
      authUserId
    );
    res.status(200).json({
      status: "success",
      data: formatted,
      message: "Existing DirectConversations found successfully",
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "Error",
      data: null,
      message: "Error while fetching the DirectConversations",
    });
    return;
  }
};

const getGroupConversations = async (
  req: updateProfileRequest,
  res: Response
) => {
  try {
    const Existing_Group_Conversations = await GroupConversation.aggregate([
      {
        $match: {
          $or: [
            { participants: { $all: [req.user?._id] } },
            { admin: req.user?._id },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "admin",
          foreignField: "_id",
          as: "admin",
          pipeline: [
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
        },
      },
      {
        $unwind: {
          path: "$admin",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "participants",
          pipeline: [
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
        },
      },
      // Lookup messages
      {
        $lookup: {
          from: "messages",
          localField: "_id",
          foreignField: "conversationId",
          as: "messages",
        },
      },
      // Unwind messages
      {
        $unwind: {
          path: "$messages",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup sender details
      {
        $lookup: {
          from: "users",
          localField: "messages.sender",
          foreignField: "_id",
          as: "messages.senderDetails",
        },
      },
      // Unwind senderDetails
      {
        $unwind: {
          path: "$messages.senderDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Replace sender with senderDetails
      {
        $addFields: {
          "messages.sender": {
            _id: "$messages.senderDetails._id",
            userName: "$messages.senderDetails.userName",
            avatar: "$messages.senderDetails.avatar",
          },
        },
      },
      // Remove the now redundant senderDetails
      {
        $project: {
          "messages.senderDetails": 0,
        },
      },
      // Regroup messages
      {
        $group: {
          _id: "$_id",
          name: { $first: "$title" },
          avatar: { $first: "$avatar" },
          about: { $first: "$about" },
          admin: { $first: "$admin" },
          participants: { $first: "$participants" },
          messages: { $push: "$messages" },
        },
      },
    ]);
    console.log(Existing_Group_Conversations);

    const authUserId = req.user?._id as string;
    const formatted = formatGroupConversations(
      Existing_Group_Conversations,
      authUserId
    );

    res.status(200).json({
      status: "success",
      data: formatted,
      message: "Existing GroupConversations found successfully",
    });
    return;
  } catch (err) {
    console.log(err);
    // Handle error appropriately
    res.status(400).json({
      status: "Error",
      data: null,
      message: "Error while fetching the GroupConversations",
    });
    return;
  }
};

const getConversation = async (req: updateProfileRequest, res: Response) => {
  const { conversationId, conversationType } = req.body;
  const authUserId = req.user?._id || "";
  // let conversation: DirectConversationInput | GroupConversationInput;
  switch (conversationType) {
    case individual:
      const Directconversation = await DirectConversation.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(conversationId),
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
                  _id: { $ne: req.user?._id }, // Exclude the current user from the participants
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
          },
        },
        {
          $unwind: "$user", // Unwind since we expect only one user in the array
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
            messages: 1, // Include messages
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
            }, // The user field will now contain the desired user object
          },
        },
      ]);
      const formattedDirectConversation = formatDirectConversations(
        Directconversation,
        authUserId
      );
      const hasMessages =
        formattedDirectConversation[0]?.message?.message ?? null;
      if (hasMessages) {
        res.status(200).json({
          status: "success",
          data: {
            conversationType,
            conversation: formattedDirectConversation
              ? formattedDirectConversation[0]
              : null,
          },
          message: "Conversation found successfully",
        });
        return;
      }
      res.status(200).json({
        status: "success",
        data: null,
        message: "Conversation Notfound due to no Messages successfully",
      });
      return;
      break;
    case "GroupConversation":
      const Groupconversation = await GroupConversation.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(conversationId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "admin",
            foreignField: "_id",
            as: "admin",
            pipeline: [
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
          },
        },
        {
          $unwind: {
            path: "$admin",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "participants",
            foreignField: "_id",
            as: "participants",
            pipeline: [
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
          },
        },
        // Lookup messages
        {
          $lookup: {
            from: "messages",
            localField: "_id",
            foreignField: "conversationId",
            as: "messages",
          },
        },
        // Unwind messages
        {
          $unwind: {
            path: "$messages",
            preserveNullAndEmptyArrays: true,
          },
        },
        // Lookup sender details
        {
          $lookup: {
            from: "users",
            localField: "messages.sender",
            foreignField: "_id",
            as: "messages.senderDetails",
          },
        },
        // Unwind senderDetails
        {
          $unwind: {
            path: "$messages.senderDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        // Replace sender with senderDetails
        {
          $addFields: {
            "messages.sender": {
              _id: "$messages.senderDetails._id",
              userName: "$messages.senderDetails.userName",
              avatar: "$messages.senderDetails.avatar",
            },
          },
        },
        // Remove the now redundant senderDetails
        {
          $project: {
            "messages.senderDetails": 0,
          },
        },
        // Regroup messages
        {
          $group: {
            _id: "$_id",
            name: { $first: "$title" },
            avatar: { $first: "$avatar" },
            about: { $first: "$about" },
            admin: { $first: "$admin" },
            participants: { $first: "$participants" },
            messages: { $push: "$messages" },
          },
        },
      ]);
      const formattedGroupConversation = formatGroupConversations(
        Groupconversation,
        authUserId
      );
      // const hasGroupMessage =
      // formattedGroupConversation[0]?.message?.message ?? null;
      if (formattedGroupConversation.length) {
        res.status(200).json({
          status: "success",
          data: {
            conversationType,
            conversation: formattedGroupConversation
              ? formattedGroupConversation[0]
              : null,
          },
          message: "Conversation found successfully",
        });
        return;
      }
      res.status(200).json({
        status: "success",
        data: null,
        message: "Conversation Notfound due to no Messages successfully",
      });
      return;
      break;
  }
};

const createGroup = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { title, users, admin } = req.body;
    const avatarLocalPath = req.file?.path;

    if (!title || !users || !admin) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: title, users, or admin",
      });
    }

    // Parse participants safely
    let participants: string[];
    try {
      participants = typeof users === "string" ? JSON.parse(users) : users;
      if (!Array.isArray(participants)) throw new Error();
    } catch {
      return res.status(400).json({
        status: "error",
        message: "Invalid 'users' format. Expected a JSON array.",
      });
    }

    // Upload avatar if available
    const avatarUploadResult = avatarLocalPath
      ? await uploadCloudinary(avatarLocalPath)
      : null;
    const avatar = avatarUploadResult?.secure_url || "";

    // Create group
    let group = await GroupConversation.create({
      title,
      participants,
      admin,
      avatar,
    });

    // Populate references and convert to plain JS object
    let groupDoc = await GroupConversation.findById(group?._id)
      .populate(["admin", "participants"])
      .lean();

    if (!groupDoc) {
      return res.status(500).json({
        status: "error",
        message: "Failed to retrieve the created group",
      });
    }

    // Add messages array to result
    const resultGroup = { ...groupDoc, messages: [] };

    return res.status(200).json({
      status: "success",
      data: resultGroup,
      message: "Group created successfully",
    });
  } catch (error) {
    console.error("createGroup error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const messagepost = async (req: Request, res: Response) => {
  const data = req.body;
  console.log(data);
  const createmsg = await Message.create(data);
  res.json({ status: 200, data: createmsg });
};

export {
  updateProfile,
  getUsers,
  getFriends,
  getFriendrequest,
  getDirectConversations,
  getGroupConversations,
  getConversation,
  createGroup,
  messagepost,
};
