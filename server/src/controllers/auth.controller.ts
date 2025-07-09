import User from "../models/user.model";
import { uploadCloudinary } from "../utils/cloudinary";
import { filterObj } from "../utils/filterObj";
import otpGenerator from "otp-generator";
import crypto from "crypto";
import { sendMail } from "../services/mailer";
import { OTP } from "../Templates/Mail/otp";
import { ResetPassord } from "../Templates/Mail/resetPassword";
import passport from "passport";
import { NextFunction, Request, Response } from "express";
import { Error } from "mongoose";
import { User as UserType } from "../types/model/user-model.type";

export interface AuthenticateRequest extends Request {
  userId?: string | undefined | unknown; // or a more specific type like ObjectId
}

const registerUser = async (
  req: AuthenticateRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userName, email, password, confirmPassword, about } = filterObj(
      req.body,
      "userName",
      "email",
      "password",
      "confirmPassword",
      "about"
    );

    // Check for missing required fields
    if (
      [userName, email, password, confirmPassword].some(
        (field) => field?.trim() === ""
      )
    ) {
      res.status(400).json({
        status: "error",
        message: "All fields are required to proceed.",
      });
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      res.status(400).json({
        status: "error",
        message: "Password and confirm password must match.",
      });
      return;
    }

    // Check for existing email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        status: "error",
        message: "This email address is already registered. Please sign in.",
      });
      return;
    }

    // Upload avatar if provided
    const avatarLocalPath = req.file?.path;
    const avatarUploadResult = avatarLocalPath
      ? await uploadCloudinary(avatarLocalPath)
      : null;

    // Build user data object
    const userData: any = {
      userName,
      email,
      password,
      status: "Offline",
      avatar: avatarUploadResult?.secure_url || "",
    };

    // Conditionally add "about" if valid
    if (about?.trim()) {
      userData.about = about.trim();
    }

    // Create new user
    const newUser = await User.create(userData);

    // Attach user ID to request for further processing (e.g., auto-login)
    req.userId = newUser._id;
    next();
  } catch (error) {
    res.status(500).json({
      status: "error",
      message:
        "An unexpected error occurred during registration. Please try again later.",
    });
    return;
  }
};

// sendOtp
const sendOtp = async (req: AuthenticateRequest, res: Response) => {
  try {
    const { userId } = req;

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    const otpExpiryAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const user = await User.findByIdAndUpdate(userId, {
      otpExpiryAt: otpExpiryAt,
    });

    if (!user) {
      res.status(404).json({
        status: "error",
        message: "User not found",
      });
      return;
    }

    user.otp = otp.toString();
    await user.save({ validateModifiedOnly: true });

    const emailSent = await sendMail({
      to: user.email!,
      subject: "Verification OTP ✉️",
      html: OTP(user.userName, otp),
    });

    if (!emailSent) {
      res.status(500).json({
        status: "error",
        message: "Failed to send OTP. Please try again.",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "OTP sent successfully.",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message:
        "An error occurred while sending OTP. Please try again.",
    });
  }
};

// verifyOTP
const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  //otp needs to be a string
  const { email, otp } = req.body;
  const user = await User.findOne({
    email,
    otpExpiryAt: { $gt: Date.now() },
  }).select("-password");
  if (!user) {
    res.status(400).json({
      status: "error",
      message: "Invalid email or the OTP has expired.",
    });
    return;
  }
  if (user.verified) {
    res.status(400).json({
      status: "error",
      message: "This email address has already been verified.",
    });
    return;
  }
  const isValid = await user.isOtpCorrect(otp);
  if (!isValid) {
    res.status(400).json({
      status: "error",
      message: "The OTP entered is incorrect.",
    });
    return;
  }

  // OTP is Correct
  user.verified = true;
  user.otp = undefined;
  user.otpExpiryAt = undefined;
  await user.save({ validateModifiedOnly: true });

  req.login(user, (err) => {
    if (err) {
      return next(err); // Handle error during the login process
    }
    res
      .cookie("connect.sid", req.sessionID, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .status(200)
      .json({
        status: "success",
        user: user,
        message: "OTP verified. Signup completed successfully.",
      });
  });
  return;
};

// login
const loginUser = async (
  req: AuthenticateRequest,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("local", async (err: Error, user: UserType) => {
    if (err) {
      return next(err); // Pass errors to the error handler
    }

    if (!user) {
      return res.status(401).json({
        message: "Email or password is incorrect.",
      });
    }

    req.login(user, (err) => {
      if (err) {
        return next(err); // Handle error during the login process
      }
      res
        .cookie("connect.sid", req.sessionID, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
        })
        .status(200)
        .json({
          status: "success",
          user: user,
          message: "User logged in successfully.",
        });
    });
  })(req, res, next); // Pass req, res, and next to the authenticate function
};

const loginSuccess = async (req: Request, res: Response) => {
  const user = req.user;

  if (user) {
    res.status(200).json({
      status: "success",
      user: user,
      message: "User logged in Successfully",
    });
  }
};

// forgotpassword
const forgotPassword = async (req: Request, res: Response) => {
  // get users email
  const { email } = req.body;
  const isvalidemailformat = email.match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
  if (!isvalidemailformat) {
    res.status(404).json({
      status: "error",
      message: "Invalid email address.",
    });
    return;
  }
  const user = await User.findOne({ email: email });

  if (!user) {
    // res No User found with this Email
    res.status(404).json({
      status: "error",
      message: "No user found with the provided email address.",
    });
    return;
  }
  try {
    // Generate the random reset Token hash it and set it in the DB and also set the Reset token expiry time for 10 min
    const resetToken = await user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    const resetURL = `https://byte-messenger.vercel.app/reset-password?token=${resetToken}`;
    // send the resetURL to the email
    await sendMail({
      to: user.email!,
      subject: "Password Reset 🔑",
      html: ResetPassord(user.userName, resetURL),
      attachments: [],
    });
    // res Reset Password Link sent to Email
    res.status(200).json({
      status: "success",
      message: "Password reset link has been sent to your email address.",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({
      message:
        "There was an error sending the reset email. Please try again later.",
    });
  }
};

// resetpassword
const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    const { newPassword, confirmNewPassword } = req.body;

    if (!token || typeof token !== "string") {
      res.status(400).json({
        status: "error",
        message: "Reset token is missing or invalid.",
      });
      return;
    }

    if (!newPassword || !confirmNewPassword) {
      res.status(400).json({
        status: "error",
        message: "Please provide both new password and confirmation",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      res.status(400).json({
        status: "error",
        message: "Passwords do not match",
      });
      return;
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({
        status: "error",
        message: "The token is invalid or has expired.",
      });
      return;
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save(); // run validators & trigger pre-save middleware like hashing

    res.status(200).json({
      status: "success",
      message: "Your password has been reset successfully.",
    });
    return;
  } catch (error) {
    res.status(400).json({
      status: "error",
      message:
        "An error occurred while resetting your password. Please try again.",
    });
    return;
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.status(200).json({
      status: "success",
      message: "User logged out successfully.",
    });
  });
};

const googleLogin = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("google", (err: Error, user: UserType) => {
    if (err || !user) {
      return res.redirect("https://bytebubble.vercel.app/signin");
    }

    req.login(user, (err) => {
      if (err) {
        return res.redirect("https://bytebubble.vercel.app/signin");
      }

      // Redirect to your frontend with a success query param
      return res.redirect("https://bytebubble.vercel.app/chat");
    });
  })(req, res, next); // Call the passport function with req, res, and next
};

const loginFailed = (_: Request, res: Response) => {
  res.status(401).json({
    success: false,
    message: "failure",
  });
};

export {
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
};
