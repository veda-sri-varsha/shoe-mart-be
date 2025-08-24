import mongoose from "mongoose";
import AuthRoutes from "../constants/authRoles";
import config from "../config";
import jwt from "jsonwebtoken";
import { IUser } from "../types/types";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      maxLength: [50, "Name should not be more than 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password should be at least 6 characters"],
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(AuthRoutes),
      default: AuthRoutes.USER,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    forgotPasswordToken: String,
    forgotPasswordExpire: Date,
    verifyToken: String,
    verifyTokenExpire: Date,
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.methods.generateAccessToken = function (): string {
  return jwt.sign({ id: this._id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRATION || "25m",
  });
};

userSchema.methods.generateRefreshToken = function (): string {
  return jwt.sign({ id: this._id }, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRATION || "7d",
  });
};

userSchema.methods.generateEmailVerificationToken = function (): string {
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  this.verifyToken = token;
  this.verifyTokenExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return token;
};

const User = mongoose.model<IUser>("User", userSchema);
export default User;
