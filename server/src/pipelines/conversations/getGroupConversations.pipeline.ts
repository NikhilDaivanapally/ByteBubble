export const getGroupConversationsPipeline = () => [
  {
    $lookup: {
      from: "users",
      localField: "createdBy",
      foreignField: "_id",
      as: "createdBy",
      pipeline: [
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
  {
    $unwind: {
      path: "$createdBy",
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
            otpExpiryAt: 0,
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
      from: "groupmessages",
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
      name: { $first: "$name" },
      avatar: { $first: "$avatar" },
      about: { $first: "$about" },
      admin: { $first: "$createdBy" },
      participants: { $first: "$participants" },
      messages: { $push: "$messages" },
      meta: { $first: "$meta" },
      createdAt: { $first: "$createdAt" },
      updatedAt: { $first: "$updatedAt" },
    },
  },
];
