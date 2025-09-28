import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/user.schema";
import AuthRoles from "../constants/authRoles";
import { signupSchema, loginSchema } from "../schema/auth.zod";
import mailHelper from "../utils/mailHelper";
import handler from "../services/handler";
import CustomError from "../services/customError";
import jwt from "jsonwebtoken";
import config from "../config";

export const cookieOptions = {
  expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  httpOnly: true,
};

const generateOtp = (expiryMinutes: number = 10) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
  const expireAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
  return { otp, expireAt };
};

export const signup = handler(async (req: Request, res: Response) => {
  const validate = signupSchema.safeParse(req.body);
  if (!validate.success) throw new CustomError("Invalid input", 400, validate.error.issues);

  const { name, email, password, role } = validate.data;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) throw new CustomError("User already exists", 400);

  const { otp, expireAt } = generateOtp(10);

  const newUser = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role || AuthRoles.USER,
    isVerified: false,
    verifyOtp: otp,
    verifyOtpExpireAt: expireAt,
  });

  await mailHelper({
    email: newUser.email,
    subject: "Verify your email - My Shoe Mart",
    message: `Hello ${newUser.name},\n\nYour OTP for email verification is: ${otp}\n\nThis OTP will expire in 10 minutes.`,
  });

  res.status(201).json({
    success: true,
    statusCode: 201,
    message: "User registered successfully. Check your email for OTP.",
    data: {
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
      }
    }
  });
});

export const verifyEmail = handler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) throw new CustomError("Email and OTP are required", 400);

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new CustomError("User not found", 404);

  if (user.isVerified) throw new CustomError("Email already verified", 400);

  if (!user.verifyOtp || !user.verifyOtpExpireAt) {
    throw new CustomError("No OTP found. Please request a new one.", 400);
  }

  if (new Date() > user.verifyOtpExpireAt) {
    const { otp: newOtp, expireAt } = generateOtp(10);
    user.verifyOtp = newOtp;
    user.verifyOtpExpireAt = expireAt;
    await user.save();

    await mailHelper({
      email: user.email,
      subject: "Your new OTP - My Shoe Mart",
      message: `Hello ${user.name},\n\nYour new OTP for email verification is: ${newOtp}\n\nThis OTP will expire in 10 minutes.`,
    });

    return res.status(400).json({ 
      success: false, 
      statusCode: 400,
      message: "OTP expired. New OTP sent to your email.",
    });
  }

  if (user.verifyOtp !== otp) throw new CustomError("Invalid OTP", 400);

  user.isVerified = true;
  user.verifyOtp = undefined;
  user.verifyOtpExpireAt = undefined;
  await user.save();

  return res.status(200).json({ 
    success: true, 
    statusCode: 200, 
    message: "Email verified successfully",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      }
    }
  });
});

export const login = handler(async (req: Request, res: Response) => {
  const validate = loginSchema.safeParse(req.body);
  if (!validate.success) throw new CustomError("Invalid input", 400, validate.error.issues);

  const { email, password } = validate.data;

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) throw new CustomError("Invalid credentials", 400);

  if (!user.isVerified) {
    throw new CustomError("Please verify your email before logging in", 403);
  }

const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) throw new CustomError("Invalid credentials", 400);

  const accessToken = user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
  });

  res.clearCookie("token");

  return res.status(200).json({
    success: true,
    statusCode: 200,  
    message: "Login successful",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        refreshToken: refreshToken
      }
    }
  });
});


export const refreshToken = handler(async (req: Request, res: Response) => {
  const incomingRefreshToken = (req.cookies && req.cookies.refreshToken) || req.body.refreshToken;
  if (!incomingRefreshToken) throw new CustomError("Refresh token required", 401);

  let decoded: any;
  try {
    decoded = jwt.verify(incomingRefreshToken, config.JWT_REFRESH_SECRET || "");
  } catch (err: any) {
    throw new CustomError("Invalid or expired refresh token", 401, err?.message);
  }

  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user) throw new CustomError("User not found", 401);

  if (user.refreshToken !== incomingRefreshToken) {
    throw new CustomError("Refresh token is invalid or has been rotated", 401);
  }

  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = await user.generateRefreshToken();

  res.cookie("accessToken", newAccessToken, cookieOptions);
  res.cookie("refreshToken", newRefreshToken, cookieOptions);

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Access token refreshed successfully",
    data: { accessToken: newAccessToken },
  });
});


export const logout = handler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) throw new CustomError("Email is required", 400);

  const user = await User.findOne({ email });
  if (!user) throw new CustomError("User not found", 404);

  user.refreshToken = undefined;
  await user.save({ validateBeforeSave: false });

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.status(200).json({ 
    success: true,
    statusCode: 200,
    message: "Logout successful",
    data: {},
  });
});

export const forgotPassword = handler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) throw new CustomError("Email is required", 400);

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new CustomError("User not found", 404);

  const { otp, expireAt } = generateOtp(10);
  user.resetOtp = otp;
  user.resetOtpExpireAt = expireAt;
  await user.save({ validateBeforeSave: false });

  await mailHelper({
    email: user.email,
    subject: "Your Password Reset OTP - My Shoe Mart",
    message: `Hello ${user.name},\n\nYour OTP for password reset is: ${otp}\nThis OTP will expire in 10 minutes.`,
  });

  res.status(200).json({ 
    success: true, 
    statusCode: 200, 
    message: "Password reset OTP sent to your email.",
  });
});

export const resetPassword = handler(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    throw new CustomError("Enter valid email, OTP and newPassword", 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new CustomError("User not found", 404);

  if (!user.resetOtp || !user.resetOtpExpireAt) {
    throw new CustomError("No OTP found. Please request a new one.", 400);
  }

  if (user.resetOtp !== otp) {
    throw new CustomError("Invalid OTP", 400);
  }

  if (user.resetOtpExpireAt.getTime() < Date.now()) {
    throw new CustomError("OTP expired", 400);
  }

  user.password = newPassword;
  user.resetOtp = undefined;
  user.resetOtpExpireAt = undefined;
  await user.save();

  res.status(200).json({ 
    success: true, 
    statusCode: 200,
    message: "Password reset successfully",
  });
});

export const updatePassword = handler(async (req: Request, res: Response) => {
  const { email, oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new CustomError("All fields (oldPassword, newPassword, confirmPassword) are required", 400);
  }

  if (newPassword !== confirmPassword) {
    throw new CustomError("New password and confirm password do not match", 400);
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new CustomError("User not found", 404);

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isOldPasswordValid) {
    throw new CustomError("Old password is incorrect", 400);
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ 
    success: true, 
    statusCode: 200,
    message: "Password updated successfully",
  });
});

export const getProfile = handler(async (req: Request, res: Response) => {
  const { userId } = req.body as { userId: string };

  const user = await User.findById(userId);
  if (!user) throw new CustomError("User not found", 404);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Profile retrieved successfully",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      }
    }
  });
});

export const getAllUsers = handler(async (req: Request, res: Response) => {
  const users = await User.find();

  if (!users || users.length === 0) {
    return res.status(200).json({ 
      success: true,
      statusCode: 200,
      message: "No users found",
      data: {
        users: [],
        count: 0
      }
    });
  }

  const formattedUsers = users.map(user => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  }));

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Users retrieved successfully",
    data: {
      users: formattedUsers,
      count: users.length
    }
  });
});