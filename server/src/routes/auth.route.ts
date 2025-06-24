import { Router } from "express";
import passport from "passport";
import { upload } from "../middlewares/multer.middleware";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp,
  logout,
  googleLogin,
  loginSuccess,
  loginFailed,
} from "../controllers/auth.controller";

import { ensureAuthenticated } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", upload.single("avatar"), registerUser, sendOtp);
router.post("/send-otp", sendOtp);
router.post("/verifyotp", verifyOtp);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get("/google/callback", googleLogin);
router.get("/login/success", ensureAuthenticated, loginSuccess);
router.get("/login/failed", loginFailed);

router.post("/logout", ensureAuthenticated, logout);

export default router;
