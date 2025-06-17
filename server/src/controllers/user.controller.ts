import mongoose, { Types } from "mongoose";
import { filterObj } from "../utils/filterObj";
import { uploadCloudinary } from "../utils/cloudinary";
import User from "../models/user.model";
import { NextFunction, Request, Response } from "express";
import Friendship from "../models/friendship.model";
import DirectConversation from "../models/directConversation.model";
import GroupConversation from "../models/groupConversation.model";
import {
  formatDirectConversations,
  formatGroupConversations,
} from "../utils/formatConversations";
import { userSelectFields } from "../constants/user-select-fields";
import { getDirectConversationsPipeline } from "../pipelines/conversations/getDirectConversations.pipeline";
import { getGroupConversationsPipeline } from "../pipelines/conversations/getGroupConversations.pipeline";
import { AggregatedDirectConversation } from "../types/aggregated-response/conversation/direct-conversation-aggregate.type";
import { AggregatedGroupConversation } from "../types/aggregated-response/conversation/group-conversation-aggregate.type";
import { DirectConversationResponse } from "../types/response/conversation/direct-conversation-response.type";
import { GroupConversationResponse } from "../types/response/conversation/group-conversation-response.type";

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
  const allUsers = await User.find({ verified: true }).select(userSelectFields);

  // Fetch friendships where the current user is either sender or recipient
  const currentUserFriends = await Friendship.find({
    $or: [{ sender: currentUserId }, { recipient: currentUserId }],
  });

  // Extract IDs that are not the current user's ID
  const friendIds = currentUserFriends.map((friendship) => {
    return String(friendship.sender) === String(currentUserId)
      ? friendship?.recipient?.toString()
      : friendship?.sender?.toString();
  });
  const restUsers = allUsers.filter((user) => {
    return (
      !friendIds.includes(user?._id?.toString()!) &&
      user?._id?.toString() !== currentUserId?.toString()
    );
  });
  res.status(200).json({
    status: "success",
    data: restUsers,
    message: "Users found successfull!",
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
              otpExpiryAt: 0,
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
  }).populate({
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
      ...getDirectConversationsPipeline(req.user?._id),
    ]);

    const authUserId = req.user?._id as string;
    const formatted: DirectConversationResponse[] = formatDirectConversations(
      Existing_Direct_Conversations as AggregatedDirectConversation[],
      authUserId as string
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
          participants: { $in: [req.user?._id] },
        },
      },
      ...getGroupConversationsPipeline(),
    ]);

    const authUserId = req.user?._id as string;
    const formatted: GroupConversationResponse[] = formatGroupConversations(
      Existing_Group_Conversations as AggregatedGroupConversation[],
      authUserId as string
    );

    res.status(200).json({
      status: "success",
      data: formatted,
      message: "Existing GroupConversations found successfully",
    });
    return;
  } catch (err) {
    res.status(400).json({
      status: "Error",
      data: null,
      message: "Error while fetching the GroupConversations",
    });
    return;
  }
};

const getDirectConversation = async (
  req: updateProfileRequest,
  res: Response
) => {
  const { conversationId } = req.body;
  const authUserId = req.user?._id || "";

  const Directconversation = await DirectConversation.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(conversationId),
      },
    },
    ...getDirectConversationsPipeline(req.user?._id),
  ]);
  const formattedDirectConversation = formatDirectConversations(
    Directconversation,
    authUserId
  );
  const hasMessages = formattedDirectConversation[0]?.message?.message ?? null;
  if (hasMessages) {
    res.status(200).json({
      status: "success",
      data: {
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
};

const getGroupConversation = async (
  req: updateProfileRequest,
  res: Response
) => {
  const { conversationId } = req.body;
  const authUserId = req.user?._id || "";

  const Groupconversation = await GroupConversation.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(conversationId),
      },
    },
    ...getGroupConversationsPipeline(),
  ]);

  const formattedGroupConversation = formatGroupConversations(
    Groupconversation,
    authUserId
  );

  if (formattedGroupConversation.length) {
    res.status(200).json({
      status: "success",
      data: {
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

export {
  updateProfile,
  getUsers,
  getFriends,
  getFriendrequest,
  getDirectConversations,
  getGroupConversations,
  getDirectConversation,
  getGroupConversation,
  createGroup,
};
