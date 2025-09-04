import mongoose from "mongoose";
import AuthRoutes from "../constants/authRoles";
import config from "../config";
import jwt from "jsonwebtoken";
import { User } from "../types/index";
import bcrypt from "bcrypt"
import crypto from "crypto";

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
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifyOtp: {
      type: String,
    },
    verifyOtpExpireAt: {
      type: Date,
    },
    resetOtp: {
      type: String,
    },
    resetOtpExpireAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ id: this._id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRATION || "25m",
  });
};

userSchema.methods.generateRefreshToken = function (): string {
  return jwt.sign({ id: this._id }, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRATION || "7d",
  });
};

userSchema.methods.generateForgotPasswordToken = function() {
  const token = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 mins
  return token;
};

const User = mongoose.model<User>("User", userSchema);
export default User;
