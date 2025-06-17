import { Document, Types } from "mongoose";

export interface User extends Document {
  userName: string;
  email?: string;
  password?: string;
  about?: string;
  avatar?: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  verified?: boolean;
  otp?: string;
  otpExpiryAt?: string;
  socketId?: string;
  status?: string;
  googleId?: string;
  blockedUsers: Types.ObjectId[];
  isPasswordCorrect(password: string): Promise<boolean>;
  isOtpCorrect(otp: string): Promise<boolean>;
  createPasswordResetToken(): Promise<boolean>;
}
