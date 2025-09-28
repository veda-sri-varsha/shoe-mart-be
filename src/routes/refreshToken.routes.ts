import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.schema";
import config from "../config";
import CustomError from "../services/customError"; 
import handler from "../services/handler";   

const router = express.Router();

router.post(
  "/refresh-token",
  handler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new CustomError("Refresh token required", 400);
    }

    let decoded: { id: string };
    try {
      decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as {
        id: string;
      };
    } catch (err) {
      throw new CustomError("Invalid or expired refresh token", 401);
    }

    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== refreshToken) {
      throw new CustomError("Invalid refresh token", 401);
    }

    const newAccessToken = user.generateAccessToken();

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  })
);

export default router;
