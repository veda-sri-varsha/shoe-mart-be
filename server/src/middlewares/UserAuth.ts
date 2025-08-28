import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.schema";
import config from "../config";
import handler from "../services/handler";

export interface AuthRequest extends Request {
  user?: any;
}

const UserAuth = handler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ message: "No access token provided" });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user;
    next();
  }
);

export const authorize =
  (...requiredRoles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized: No user found" });
    if (!requiredRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: You are not authorized" });
    }
    next();
  };

export default UserAuth;
