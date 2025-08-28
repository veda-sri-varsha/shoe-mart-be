import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user.schema";
import AuthRoles from "../constants/authRoles";
import { signupSchema, loginSchema } from "../schema/auth.zod";
import mailHelper from "../utils/mailHelper";
import handler from "../services/handler";
import { email } from "zod";

export const signup = handler(async (req: Request, res: Response) => {
  const validate = signupSchema.safeParse(req.body);
  if (!validate.success) {
    return res.status(400).json({ errors: validate.error.issues });
  }

  const { name, email, password, role } = validate.data;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const newUser = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: role || AuthRoles.USER,
    isVerified: false,
  });

  await mailHelper({
    email: newUser.email,
    subject: "Verify your email - My Shoe Mart",
    message: `Hello ${newUser.name},\n\nYour OTP for email verification is: ${otp}\n\nThis OTP will expire in 10 minutes.`,
  });

  return res.status(201).json({
    message:
      "User registered successfully. Please check your email for the OTP.",
  });
});

export const verifyEmail = handler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.isVerified)
    return res.status(200).json({ message: "Email already verified" });

  if (!user.verifyOtp || !user.verifyOtpExpireAt) {
    return res
      .status(400)
      .json({ message: "No OTP found. Please request a new one." });
  }

  if (new Date() > user.verifyOtpExpireAt) {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verifyOtp = newOtp;
    user.verifyOtpExpireAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await mailHelper({
      email: user.email,
      subject: "Your new OTP - My Shoe Mart",
      message: `Hello ${user.name},\n\nYour new OTP for email verification is: ${newOtp}\n\nThis OTP will expire in 10 minutes.`,
    });

    return res
      .status(400)
      .json({ message: "OTP expired. New OTP sent to your email." });
  }

  if (user.verifyOtp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  user.isVerified = true;
  user.verifyOtp = undefined;
  user.verifyOtpExpireAt = undefined;
  await user.save();

  return res.status(200).json({ message: "Email verified successfully" });
});

export const login = handler(async (req: Request, res: Response) => {
  const validate = loginSchema.safeParse(req.body);
  if (!validate.success) {
    return res.status(400).json({ errors: validate.error.issues });
  }

  const { email, password } = validate.data;

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  if (!user.isVerified) {
    return res
      .status(403)
      .json({ message: "Please verify your email before logging in" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid)
    return res.status(400).json({ message: "Invalid credentials" });

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 25 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.clearCookie("token");

  return res.status(200).json({
    message: "Login successful",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
  });
});

export const logout = handler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  user.refreshToken = undefined;
  await user.save({ validateBeforeSave: false });

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.status(200).json({ message: "Logout successful" });
});

export const forgotPassword = handler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.resetOtp = otp;
  user.resetOtpExpireAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save({ validateBeforeSave: false });

  await mailHelper({
    email: user.email,
    subject: "Your Password Reset OTP - My Shoe Mart",
    message: `Hello ${user.name},\n\nYour OTP for password reset is: ${otp}\nThis OTP will expire in 10 minutes.`,
  });

  res.status(200).json({ message: "Password reset OTP sent to your email." });
});

export const resetPassword = handler(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Enter valid email, OTP and newPassword",
    });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (!user.resetOtp || !user.resetOtpExpireAt) {
    return res
      .status(400)
      .json({
        success: false,
        message: "No OTP found. Please request a new one.",
      });
  }

  if (user.resetOtp !== otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  if (user.resetOtpExpireAt.getTime() < Date.now()) {
    return res.status(400).json({ success: false, message: "OTP expired" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetOtp = undefined;
  user.resetOtpExpireAt = undefined;
  await user.save();

  res.json({ success: true, message: "Password reset successfully" });
});

export const getProfile = handler(async (req: Request, res: Response) => {
  const { userId } = req.body as { userId: string };

  const user = await User.findById(userId);

  if (!user) {
    res.status(404).json({ success: false, message: "User Not Found" });
    return;
  }

  res.json({
    success: true,
    userData: {
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
  });
});

export const getAllUsers = handler(async (req: Request, res: Response) => {
  const users = await User.find();

  if (!users || users.length === 0) {
    return res.status(404).json({ success: false, message: "No users found" });
  }

  res.status(200).json({
    success: true,
    users: users,
  });
});
