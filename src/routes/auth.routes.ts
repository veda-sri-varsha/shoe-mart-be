import { Router } from "express";
import {
  signup,
  login,
  logout,
  verifyEmail,
  getProfile,
  getAllUsers,
  forgotPassword,
  resetPassword,
  refreshToken
} from "../controllers/auth.controller";
import { signupLimiter, loginLimiter } from "../schema/auth.zod";
import UserAuth, { authorize } from "../middlewares/UserAuth";
import AuthRoles from "../constants/authRoles";

const router: Router = Router();

router.post("/signup", signupLimiter, signup);
router.post("/login", loginLimiter, login);
router.post("/verify-email", verifyEmail);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);

router.get("/profile", getProfile);
router.get("/users", UserAuth, authorize(AuthRoles.ADMIN), getAllUsers);

export default router;
