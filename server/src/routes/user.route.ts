import { RequestHandler, Router } from "express";
import Friendship from "../models/friendship.model";
import { upload } from "../middlewares/multer.middleware";
import { ensureAuthenticated } from "../middlewares/auth.middleware";
import {
  createGroup,
  getDirectConversation,
  getDirectConversations,
  getFile,
  getFriendrequest,
  getFriends,
  getGroupConversation,
  getGroupConversations,
  getUnreadMessagesCount,
  getUsers,
  handleUpload,
  updateUserPassword,
  updateUserProfile,
  handleUpdateGroupDetails,
} from "../controllers/user.controller";

const router = Router();

router.patch(
  "/update-password",
  ensureAuthenticated,
  updateUserPassword as RequestHandler
);

router.patch(
  "/profile",
  ensureAuthenticated,
  upload.single("avatar"),
  updateUserProfile as RequestHandler
);
router.get("/get_users", ensureAuthenticated, getUsers as RequestHandler);
router.get("/get_friends", ensureAuthenticated, getFriends as RequestHandler);
router.get(
  "/get_friend_request",
  ensureAuthenticated,
  getFriendrequest as RequestHandler
);
router.get(
  "/get_direct_conversations",
  ensureAuthenticated,
  getDirectConversations as RequestHandler
);
router.get(
  "/get_group_conversations",
  ensureAuthenticated,
  getGroupConversations as RequestHandler
);

router.post(
  "/get_direct_conversation",
  ensureAuthenticated,
  getDirectConversation as RequestHandler
);

router.post(
  "/get_group_conversation",
  ensureAuthenticated,
  getGroupConversation as RequestHandler
);
router.get(
  "/unread_counts",
  ensureAuthenticated,
  getUnreadMessagesCount as RequestHandler
);
router.post(
  "/create_group",
  ensureAuthenticated,
  upload.single("avatar"),
  createGroup as RequestHandler
);
router.post(
  "/upload",
  ensureAuthenticated,
  upload.single("file"),
  handleUpload as RequestHandler
);

router.get("/file/:id", ensureAuthenticated, getFile as RequestHandler);
router.put(
  "/group-details",
  ensureAuthenticated,
  upload.single("avatar"),
  handleUpdateGroupDetails as RequestHandler
);

router.post("/addrequest", async (req, res) => {
  const { sender, recipient } = req.body;
  const data = await Friendship.create({
    sender,
    recipient,
  });
  res.json({ status: "success", data: data });
});

export default router;
