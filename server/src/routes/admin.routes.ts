import { Router } from "express";
import UserAuth, { authorize } from "../middlewares/UserAuth";
import AuthRoles from "../constants/authRoles";
import {
  getAllVendors,
  activateVendor,
  deactivateVendor,
} from "../controllers/admin.controller";

const router: Router = Router();

router.get(
  "/vendors",
  UserAuth,
  authorize(AuthRoles.ADMIN),
  getAllVendors
);

router.put(
  "/vendors/:vendorId/activate",
  UserAuth,
  authorize(AuthRoles.ADMIN),
  activateVendor
);

router.put(
  "/vendors/:vendorId/deactivate",
  UserAuth,
  authorize(AuthRoles.ADMIN),
  deactivateVendor
);

export default router;
