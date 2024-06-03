import express from "express";
import {
  current,
  changeRole,
  chargeProfileImg,
  chargeDocumentation,
} from "../controllers/user.controller.js";
import { uploadProfileImg, uploadProductImg, uploadDocImg } from "../middlewares.js";

const router = express.Router();

router.post("/:uid/profileImg", uploadProfileImg, chargeProfileImg);
router.post("/:uid/documents", uploadDocImg, chargeDocumentation);
router.put("/premium/:uid", changeRole);
router.get("/current", current);

export default router;
