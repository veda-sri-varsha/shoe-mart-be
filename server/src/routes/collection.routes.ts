import { Router } from "express";
import {
  createCollection,
  updateCollection,
  deleteCollection,
  getAllCollections,
} from "../controllers/collection.controller";
import UserAuth, { authorize } from "../middlewares/UserAuth";
import AuthRoles from "../constants/authRoles";

const router: Router = Router();

router.get("/", getAllCollections);
router.post("/", UserAuth, authorize(AuthRoles.ADMIN,AuthRoles.VENDOR),createCollection);
router.put("/:id", UserAuth, authorize(AuthRoles.ADMIN, AuthRoles.VENDOR),updateCollection);
router.patch("/:id", UserAuth, authorize(AuthRoles.ADMIN, AuthRoles.VENDOR), deleteCollection);


export default router;
