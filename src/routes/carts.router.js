import express from "express";
import {
  addCart,
  addProductInCart,
  cleanCartById,
  deleteProduct,
  getCartById,
  getCarts,
  purchase,
  updateProductsInCart,
  updateProductsQuantityInCart,
} from "../controllers/carts.controller.js";

const router = express.Router();

router.get("/", getCarts);
router.get("/:cid", getCartById);
router.get("/:cid/purchase", purchase);

router.post("/", addCart);
router.post("/:cid/products/:pid", addProductInCart);

router.delete("/:cid", cleanCartById);
router.delete("/:cid/products/:pid", deleteProduct);

router.put("/:cid", updateProductsInCart);
router.put("/:cid/products/:pid", updateProductsQuantityInCart);

export default router;
