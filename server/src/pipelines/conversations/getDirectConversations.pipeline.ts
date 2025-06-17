export const getDirectConversationsPipeline = (userId: string | undefined) => [
  {
    $lookup: {
      from: "users",
      localField: "participants",
      foreignField: "_id",
      as: "user",
      pipeline: [
        {
          $match: {
            _id: { $ne: userId }, // Exclude the current user from the participants
          },
        },
        {
          $project: {
            password: 0,
            passwordChangedAt: 0,
            passwordResetExpires: 0,
            passwordResetToken: 0,
            confirmPassword: 0,
            verified: 0,
            otpExpiryAt: 0,
            blockedUsers: 0,
            googleId: 0,
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
      from: "directmessages",
      localField: "_id",
      foreignField: "conversationId",
      as: "messages",
    },
  },
  {
    $project: {
      _id: 1,
      messages: 1, // Include messages
      meta: 1,
      user: {
        _id: 1,
        userName: 1,
        email: 1,
        avatar: 1,
        about: 1,
        socketId: 1,
        createdAt: 1,
        updatedAt: 1,
        status: 1,
      }, // The user field will now contain the desired user object
    },
  },
];
