import { Router } from "express";
import {
  generateRazorPayOrderId,
  generateOrder,
  getOrders,
  getOrderAdmin,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orders.controller";
import UserAuth, { authorize } from "../middlewares/UserAuth";
import AuthRoles from "../constants/authRoles";

const router: Router = Router();

router.post(
  "/",
  UserAuth,
  authorize(AuthRoles.ADMIN, AuthRoles.USER),
  generateOrder
);

router.put("/:id", UserAuth, authorize(AuthRoles.ADMIN), updateOrderStatus);

router.put(
  "/user/:id",
  UserAuth,
  authorize(AuthRoles.ADMIN, AuthRoles.USER),
  updateOrderStatus
);

router.patch(
  "/:id",
  UserAuth,
  authorize(AuthRoles.ADMIN, AuthRoles.USER),
  deleteOrder
);

router.get(
  "/",
  UserAuth,
  authorize(AuthRoles.ADMIN, AuthRoles.USER),
  getOrders
);

router.get("/:id", UserAuth, authorize(AuthRoles.ADMIN), getOrderAdmin);

router.post(
  "/razorpay",
  UserAuth,
  authorize(AuthRoles.ADMIN, AuthRoles.USER),
  generateRazorPayOrderId
);

export default router;
