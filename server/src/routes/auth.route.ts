import { Router } from "express";
import passport from "passport";
import { upload } from "../middlewares/multer.middleware";
import {
  RegisterUser,
  sendOTP,
  verifyOTP,
  loginUser,
  forgotpassword,
  resetpassword,
  googleLogin,
  loginSuccess,
  loginFailed,
  logout,
} from "../controllers/auth.controller";
import { ensureAuthenticated } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", upload.single("avatar"), RegisterUser, sendOTP);
router.post("/send-otp", sendOTP);
router.post("/verifyotp", verifyOTP);
router.post("/login", loginUser);
router.post("/forgot-password", forgotpassword);
router.post("/reset-password", resetpassword);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback", googleLogin);
router.get("/login/success", ensureAuthenticated, loginSuccess);
router.get("/login/failed", loginFailed);

router.post("/logout", ensureAuthenticated, logout);

export default router;
