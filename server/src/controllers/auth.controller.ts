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
import { Error, Types } from "mongoose";
import { User as UserType } from "../types/user.type";

interface RegisterUserProps {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  about: string;
  gender: string;
}

export interface AuthenticateRequest extends Request {
  userId?: string | undefined | unknown; // or a more specific type like ObjectId
}

const registerUser = async (
  req: AuthenticateRequest,
  res: Response,
  next: NextFunction
) => {
  // collect the Data from re body
  // In incoming data we get noraml data & avatar (image) to handle this we use multer & cloudinary
  const filteredBody: RegisterUserProps = filterObj(
    req.body,
    "userName",
    "email",
    "password",
    "confirmPassword",
    "about",
    "gender"
  );
  if (Object.values(filteredBody).some((field) => field?.trim() === "")) {
    res.status(400).json({
      status: "error",
      message: "All fields are Required",
    });
    return;
  }
  const existing_user = await User.findOne({ email: filteredBody.email });
  if (existing_user) {
    res.status(409).json({
      status: "error",
      message: "Email already in use, Please login.",
    });
    return;
  }
  if (String(filteredBody.password) !== String(filteredBody.confirmPassword)) {
    res.status(400).json({
      status: "error",
      message: "password and confirmPassword must be same",
    });
    return;
  }

  const avatarLocalpath = req.file?.path;

  let avatar;
  if (avatarLocalpath) {
    avatar = await uploadCloudinary(avatarLocalpath);
  }
  const new_user = await User.create({
    ...filteredBody,
    status: "Offline",
    avatar: avatar?.secure_url || "",
  });

  req.userId = new_user._id;
  next();
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

    const otpExpiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes

    const user = await User.findByIdAndUpdate(userId, {
      otp_expiry_time: otpExpiryTime,
    });

    if (!user) {
      res.status(404).json({
        status: "error",
        message: "User Not found!",
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
        message: "Failed to send OTP",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "OTP sent successfully!",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to send OTP",
    });
  }
};

// verifyOTP
const verifyOtp = async (req: Request, res: Response) => {
  //otp needs to be a string
  const { email, otp } = req.body;
  const user = await User.findOne({
    email,
    otp_expiry_time: { $gt: Date.now() },
  }).select("-password");
  if (!user) {
    res.status(400).json({
      status: "error",
      message: "Email is invalid or OTP expired",
    });
    return;
  }
  if (user.verified) {
    res.status(400).json({
      status: "error",
      message: "Email is already verified",
    });
    return;
  }
  const isValid = await user.isOtpCorrect(otp);
  if (!isValid) {
    res.status(400).json({
      status: "error",
      message: "OTP is incorrect",
    });
    return;
  }

  // OTP is Correct
  user.verified = true;
  user.otp = undefined;
  user.otp_expiry_time = undefined;
  await user.save({ validateModifiedOnly: true });
  res.status(200).json({
    status: "success",
    user: user,
    message: "OTP verified and  signup successfull",
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
        message: "email or password is incorrect",
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
          message: "User logged in Successfully",
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
      message: "Invalid email address",
    });
    return;
  }
  console.log(email);
  const user = await User.findOne({ email: email });

  if (!user) {
    // res No User found with this Email
    res.status(404).json({
      status: "error",
      message: "There is no user with email address.",
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
      message: "Password Reset URL is sent to email!",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    // res Error occured While Sending the Email
    res.status(500).json({
      message: "There was an error sending the email. Try again later!",
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
        message: "Reset token is missing or invalid",
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
        message: "Token is invalid or has expired",
      });
      return;
    }

    user.password = newPassword;
    user.confirmPassword = confirmNewPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save(); // run validators & trigger pre-save middleware like hashing

    res.status(200).json({
      status: "success",
      message: "Password has been reset successfully",
    });
    return;
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Something went wrong while reseting the password",
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
      message: "User logout Successfully",
    });
  });
};

const googleLogin = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("google", (err: Error, user: UserType) => {
    if (err || !user) {
      return res.redirect("https://byte-messenger.vercel.app/login");
    }

    req.login(user, (err) => {
      if (err) {
        return res.redirect("https://byte-messenger.vercel.app/login");
      }

      // Redirect to your frontend with a success query param
      return res.redirect("https://byte-messenger.vercel.app");
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
