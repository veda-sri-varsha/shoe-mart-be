import { Router } from "express";
import {
  getAllProducts,
  addProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  productByCollectionId,
  searchProductsController,
} from "../controllers/product.controller";
import UserAuth, { authorize } from "../middlewares/UserAuth";
import AuthRoles from "../constants/authRoles";

const router: Router = Router();

router.post(
  "/",
  UserAuth,
  authorize(AuthRoles.ADMIN, AuthRoles.VENDOR),
  addProduct
);

router.get("/search", searchProductsController);

router.put(
  "/:id",
  UserAuth,
  authorize(AuthRoles.ADMIN, AuthRoles.VENDOR),
  updateProduct
);
router.patch(
  "/:id",
  UserAuth,
  authorize(AuthRoles.ADMIN, AuthRoles.VENDOR),
  deleteProduct
);
router.get(
  "/",
  // UserAuth,
  getAllProducts
);
router.get(
  "/:id",
  // UserAuth,
  // authorize(AuthRoles.ADMIN, AuthRoles.VENDOR),
  getProductById
);
router.get(
  "/collection/:id",
  // UserAuth,
  // authorize(AuthRoles.ADMIN, AuthRoles.VENDOR),
  productByCollectionId
);

export default router;
