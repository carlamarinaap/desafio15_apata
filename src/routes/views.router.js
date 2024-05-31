import express from "express";
import {
  chat,
  failRegisterView,
  failloginView,
  getUserCart,
  loginView,
  passwordRestoreView,
  productsView,
  profileView,
  realTimeProducts,
  registerView,
  restoreLinkView,
  rootView,
  socketView,
} from "../controllers/views.controller.js";
import { mail, mockingProducts } from "../controllers/products.controller.js";
import { isLoggedIn, verifyRole } from "../middlewares.js";

const router = express.Router();

router.get("/", rootView);
router.get("/socket", socketView);
router.get("/register", registerView);
router.get("/failRegister", failRegisterView);
router.get("/login", loginView);
router.get("/faillogin", failloginView);
router.get("/passwordRestore", passwordRestoreView);
router.get("/restoreLink", restoreLinkView);
router.get("/mockingproducts", mockingProducts);
router.get("/mail", mail);

router.use(isLoggedIn);
router.get("/realTimeProducts", verifyRole, realTimeProducts);
router.get("/chat", chat);
router.get("/carts/:cid", getUserCart);
router.get("/profile", profileView);
router.get("/products", productsView);

export default router;
