import express from "express";
import { current, changeRole, showDocuments } from "../controllers/user.controller.js";
import { uploadProfileImg, uploadProductImg, uploadDocImg } from "../middlewares.js";

const router = express.Router();

router.post("/:uid/documents", uploadDocImg, showDocuments);
router.put("/premium/:uid", changeRole);
router.get("/current", current);

export default router;
