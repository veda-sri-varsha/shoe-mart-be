import { Router } from "express";
import {
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCoupon,
} from "../controllers/coupon.controller";
import UserAuth, { authorize } from "../middlewares/UserAuth";
import AuthRoles from "../constants/authRoles";

const router:Router = Router();

router.post("/", UserAuth, authorize(AuthRoles.ADMIN), createCoupon);
router.patch("/:id", UserAuth, authorize(AuthRoles.ADMIN, AuthRoles.VENDOR), deleteCoupon);
router.put("/action/:id", UserAuth, authorize(AuthRoles.ADMIN, AuthRoles.VENDOR), updateCoupon);
router.get("/", UserAuth, authorize(AuthRoles.ADMIN, AuthRoles.VENDOR), getCoupons);

export default router;
