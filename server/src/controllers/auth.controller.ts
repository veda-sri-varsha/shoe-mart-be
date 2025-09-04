import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/user.schema";
import AuthRoles from "../constants/authRoles";
import { signupSchema, loginSchema } from "../schema/auth.zod";
import mailHelper from "../utils/mailHelper";
import handler from "../services/handler";
import CustomError from "../services/customError";
import { generateOtp } from "../utils/otpHelper";

export const cookieOptions = {
  expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  httpOnly: true,
};

export const signup = handler(async (req: Request, res: Response) => {
  const validate = signupSchema.safeParse(req.body);
   if (!validate.success) throw new CustomError("Invalid input", 400, validate.error.issues);

  const { name, email, password, role } = validate.data;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) throw new CustomError("User already exists", 400);


   const hashedPassword = await bcrypt.hash(password, 10);
  const { otp, expireAt } = generateOtp(10);

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

   res.status(201).json({
    success: true,
    statusCode: 201,
    message: "User registered successfully. Check your email for OTP.",
    user: newUser,
  });
});

export const verifyEmail = handler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

   if (!email || !otp) throw new CustomError("Email and OTP are required", 400);

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new CustomError("User not found", 404);

  if (user.isVerified)
    throw new CustomError("Email already verified", 400);

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

    return res
      .status(400)
      .json({ success:true, statusCode:400 ,message: "OTP expired. New OTP sent to your email." });
  }

   if (user.verifyOtp !== otp) throw new CustomError("Invalid OTP", 400);

  user.isVerified = true;
  user.verifyOtp = undefined;
  user.verifyOtpExpireAt = undefined;
  await user.save();

  return res.status(200).json({ success: true, statusCode: 200, message: "Email verified successfully" });
});

export const login = handler(async (req: Request, res: Response) => {
  const validate = loginSchema.safeParse(req.body);
   if (!validate.success) throw new CustomError("Invalid input", 400, validate.error.issues);


  const { email, password } = validate.data;

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );
  if (!user) throw new CustomError("Invalid credentials", 400);

  if (!user.isVerified) {
    throw new CustomError("Please verify your email before logging in", 403);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new CustomError("Invalid credentials", 400);

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
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
  if (!email) throw new CustomError("Email is required", 400);

  const user = await User.findOne({ email });
  if (!user) throw new CustomError("User not found", 404);

  user.refreshToken = undefined;
  await user.save({ validateBeforeSave: false });

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.status(200).json({ message: "Logout successful" });
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

  res.status(200).json({ success: true, statusCode: 200, message: "Password reset OTP sent to your email." });
});

export const resetPassword = handler(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    throw new CustomError("Enter valid email, OTP and newPassword", 400);
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

export const updatePassword = handler(async (req: Request, res: Response) => {
  const { email, oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ 
      success: false, 
      message: "All fields (oldPassword, newPassword, confirmPassword) are required" 
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ 
      success: false, 
      message: "New password and confirm password do not match" 
    });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isOldPasswordValid) {
    return res.status(400).json({ success: false, message: "Old password is incorrect" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.status(200).json({ success: true, message: "Password updated successfully" });
});

export const getProfile = handler(async (req: Request, res: Response) => {
  const { userId } = req.body as { userId: string };

  const user = await User.findById(userId);

  if (!user) {
    res.status(404).json({ success: false, message: "User Not Found" });
    return;
  }

  res.json({
    status: 200,
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
    return res.status(404).json({ 
      status: 404,
      message: "No users found",
      data: null
    });
  }

  res.status(200).json({
    status: 200,
    message: "Users retrieved successfully",
    data: {
      users: users,
      count: users.length
    }
  });
});
