import express from "express";
import passport from "passport";
import {
  current,
  githubLogin,
  githubcallbackapata,
  login,
  logout,
  passwordRestore,
  register,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/passwordRestore", passwordRestore);

router.get("/logout", logout);
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  githubLogin
);
router.get(
  "/githubcallbackapata",
  passport.authenticate("github", { failureRedirect: "/login" }),
  githubcallbackapata
);

export default router;
