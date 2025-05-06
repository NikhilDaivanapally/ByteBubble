import { RequestHandler, Router } from "express";
import Friendship from "../models/friendship.model";
import { upload } from "../middlewares/multer.middleware";
import { ensureAuthenticated } from "../middlewares/auth.middleware";
import {
  messagepost,
  createGroup,
  getConversation,
  getDirectConversations,
  getFriendrequest,
  getFriends,
  getGroupConversations,
  getUsers,
  updateProfile,
} from "../controllers/user.controller";

const router = Router();

router.patch(
  "/update-profile",
  ensureAuthenticated,
  upload.single("avatar"),
  updateProfile as RequestHandler
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
  "/get_conversation",
  ensureAuthenticated,
  getConversation as RequestHandler
);
router.post(
  "/create_group",
  ensureAuthenticated,
  upload.single("avatar"),
  createGroup as RequestHandler
);

router.post("/message", messagepost);
router.post("/addrequest", async (req, res) => {
  const { sender, recipient } = req.body;
  const data = await Friendship.create({
    sender,
    recipient,
  });
  res.json({ status: "success", data: data });
});

export default router;
