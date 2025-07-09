import mongoose from "mongoose";
import { uploadCloudinary } from "../utils/cloudinary";
import User from "../models/user.model";
import { NextFunction, Request, Response } from "express";
import Friendship from "../models/friendship.model";
import DirectConversation from "../models/DirectConversation.model";
import GroupConversation from "../models/GroupConversation.model";
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
import { DirectMessage } from "../models/directMessage.model";
import { GroupMessage } from "../models/groupMessage.model";
import { v2 } from "cloudinary";
import fs from "fs";
import { gridFSBucket } from "../db/connectDB";
import { convertPdfFirstPageToImage } from "../utils/convertPdfFirstPageToImage";
import { ObjectId } from "bson";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
  };
}

const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { name, about } = req.body;

    const updates: any = {};
    if (name !== undefined) updates.userName = name;
    if (about !== undefined) updates.about = about;
    const avatarLocalpath = req.file?.path;
    if (avatarLocalpath) {
      const image = await uploadCloudinary(avatarLocalpath);
      updates.avatar = image?.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      status: "success",
      data: updatedUser,
      message: "User Updated successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "failed", data: null, message: "Internal Server Error" });
  }
};

const updateUserPassword = async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return res.status(400).json({
      status: "failed",
      data: null,
      message: "Both current and new passwords are required.",
    });

  try {
    const userId = req.user?._id;
    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ status: "Not Found", data: null, message: "User not found." });

    const isMatch = await user.isPasswordCorrect(currentPassword);
    if (!isMatch)
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: "success",
      data: user,
      message: "Password Updated Successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "failed", data: null, message: "Internal Server Error" });
  }
};

const getUsers = async (req: AuthenticatedRequest, res: Response) => {
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
  req: AuthenticatedRequest,
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

const getFriendrequest = async (req: AuthenticatedRequest, res: Response) => {
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
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const Existing_Direct_Conversations = await DirectConversation.aggregate([
      {
        $match: {
          participants: {
            $in: [new mongoose.Types.ObjectId(req.user?._id)],
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
    res.status(400).json({
      status: "Error",
      data: null,
      message: "Error while fetching the DirectConversations",
    });
    return;
  }
};

const getGroupConversations = async (
  req: AuthenticatedRequest,
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
  req: AuthenticatedRequest,
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
  const formattedDirectConversation: DirectConversationResponse[] =
    formatDirectConversations(
      Directconversation as AggregatedDirectConversation[],
      authUserId as string
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
  req: AuthenticatedRequest,
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

  const formattedGroupConversation: GroupConversationResponse[] =
    formatGroupConversations(
      Groupconversation as AggregatedGroupConversation[],
      authUserId as string
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

const getUnreadMessagesCount = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id;
    const [directMessagesUnreadCount, groupMessagesUnreadCount] =
      await Promise.all([
        await DirectMessage.find({
          recipient: userId,
          isRead: false,
        }).countDocuments(),
        await GroupMessage.find({
          recipients: userId,
          readBy: { $ne: userId },
        }).countDocuments(),
      ]);
    res.status(200).json({
      status: "success",
      data: {
        directChats: directMessagesUnreadCount,
        groupChats: groupMessagesUnreadCount,
        total: directMessagesUnreadCount + groupMessagesUnreadCount,
      },
      message: "unread counts fetched successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: "Error",
      data: null,
      message: "Error while fetching unread counts",
    });
    return;
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

const handleUpload = async (req: AuthenticatedRequest, res: Response) => {
  const filePath = req?.file?.path;
  const originalName = req?.file?.originalname as string;
  const mimeType = req?.file?.mimetype;

  try {
    let previewUrl: string | null = null;
    let fileUrl: string | null = null;

    if (mimeType?.startsWith("image/") && filePath) {
      const uploadResult = await v2.uploader.upload(filePath, {
        folder: "chat-media",
        resource_type: "image",
        use_filename: true,
      });
      previewUrl = uploadResult.secure_url;
      fileUrl = previewUrl;
      fs.unlinkSync(filePath);
      return res.status(200).json({
        success: true,
        message: {
          imageUrl: fileUrl,
          description: null,
        },
      });
    } else if (mimeType == "application/pdf" && filePath) {
      previewUrl = await convertPdfFirstPageToImage(filePath);
    }
    //  All other files (DOCX, MP3, ZIP, MP4, etc.)
    // GridFS storage
    const uploadStream = gridFSBucket.openUploadStream(originalName, {
      contentType: mimeType,
    });
    if (!filePath) return;

    fs.createReadStream(filePath).pipe(uploadStream);

    uploadStream.on("finish", () => {
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        message: {
          fileId: uploadStream.id,
          fileName: originalName,
          fileType: mimeType,
          size: uploadStream.length,
          previewUrl,
        },
      });
    });
  } catch (error) {
    fs.unlinkSync(filePath as string);
    res.status(500).json({ success: false, error: "Upload failed" });
  }
};

const getFile = async (req: AuthenticatedRequest, res: Response) => {
  const fileId = req.params.id;
  try {
    const objectId = new ObjectId(fileId);
    // get file metadata first
    const file = await gridFSBucket!.find({ _id: objectId }).toArray();
    if (!file || file.length === 0) {
      res.status(404).json({ success: false, error: "File not found" });
      return;
    }
    const fileInfo = file[0];
    const mimeType = fileInfo.contentType;
    const downloadStream = gridFSBucket!.openDownloadStream(objectId);
    res.set("Content-Type", mimeType);
    downloadStream.pipe(res);
    downloadStream.on("error", (err: Error) => {
      res.status(400).send({
        success: false,
        error: "Something went wrong",
        message: err.message,
      });
    });
  } catch (err: any) {
    res.status(400).send({
      success: false,
      error: "Something went wrong",
      details: err.message,
    });
  }
};

export {
  getUsers,
  getFriends,
  getFriendrequest,
  getDirectConversations,
  getGroupConversations,
  getDirectConversation,
  getGroupConversation,
  getUnreadMessagesCount,
  createGroup,
  updateUserProfile,
  updateUserPassword,
  handleUpload,
  getFile,
};
