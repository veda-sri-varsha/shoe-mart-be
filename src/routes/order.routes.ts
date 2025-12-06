import { Router } from "express";
import {
  generateRazorPayOrderId,
  generateOrder,
  getOrders,
  getOrderAdmin,
  updateOrderStatus,
  deleteOrder,
  verifyPayment,
} from "../controllers/order.controller";
import UserAuth, { authorize } from "../middlewares/UserAuth";
import AuthRoles from "../constants/authRoles";

const router: Router = Router();

router.post(
  "/",
  // UserAuth,
  authorize(AuthRoles.ADMIN, AuthRoles.USER),
  generateOrder
);

router.post(
  "/verify-payment",
  // UserAuth,
  authorize(AuthRoles.ADMIN, AuthRoles.USER),
  verifyPayment
);

router.post(
  "/razorpay",
  // UserAuth,
  authorize(AuthRoles.ADMIN, AuthRoles.USER),
  generateRazorPayOrderId
);

router.get(
  "/",
  // UserAuth,
  authorize(AuthRoles.ADMIN, AuthRoles.USER),
  getOrders
);

router.get(
  "/admin",
  UserAuth,
  authorize(AuthRoles.ADMIN),
  getOrderAdmin
);

router.put(
  "/user/:id",
  UserAuth,
  authorize(AuthRoles.ADMIN, AuthRoles.USER),
  updateOrderStatus
);

router.put(
  "/:id",
  UserAuth,
  authorize(AuthRoles.ADMIN),
  updateOrderStatus
);

router.delete(
  "/:id",
  UserAuth,
  authorize(AuthRoles.ADMIN, AuthRoles.USER),
  deleteOrder
);

export default router;
