import { Router } from "express";
import authRoutes from "./auth.routes";
import collectionRoute from "./collection.routes";
import couponRoute from './coupon.routes';
import orderRoute from './order.routes';
import productRoute from "./product.routes";
import adminRoutes from "./admin.routes";

const router: Router = Router();

router.use("/auth", authRoutes);
router.use("/collections", collectionRoute);
router.use('/coupons', couponRoute);
router.use('/orders', orderRoute);
router.use("/products", productRoute);
router.use("/admin", adminRoutes);

export default router;
