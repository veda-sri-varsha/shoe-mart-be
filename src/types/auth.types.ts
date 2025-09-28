import { Document, Types } from "mongoose";
import AuthRoles from "../constants/authRoles";

export type User = Document & {
  name: string;
  email: string;
  password: string;
  role: (typeof AuthRoles)[keyof typeof AuthRoles];
  isVerified: boolean;
  verifyOtp?: string;
  verifyOtpExpireAt?: Date;
  resetOtp?: string;
  resetOtpExpireAt?: Date;
  refreshToken?: string;
  forgotPasswordToken?: string;
  forgotPasswordExpire?: Date;

  generateAccessToken(): string;
  generateRefreshToken(): string;
  generateForgotPasswordToken(): string;
  generateEmailVerification(): string;
  comparePassword(enteredPassword: string): Promise<boolean>;

};
