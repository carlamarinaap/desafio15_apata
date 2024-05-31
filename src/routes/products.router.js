import express from "express";
import {
  addProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../controllers/products.controller.js";
import { verifyRole } from "../middlewares.js";

const router = express.Router();

router.get("/", getProducts);

router.get("/:pid", getProductById);

router.post("/", verifyRole, addProduct);

router.put("/:pid", updateProduct);

router.delete("/:pid", verifyRole, deleteProduct);

export default router;
