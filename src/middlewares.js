import jwt from "jsonwebtoken";
import config from "./config/config.js";
import { userService } from "./repositories/index.js";
import multer from "multer";
import path from "path";

async function verifyRole(req, res, next) {
  try {
    const userId = jwt.verify(req.signedCookies.jwt, config.privateKey).id;
    if (userId === 1) {
      req.logger.INFO("Usuario autorizado");
      next();
    } else {
      const user = await userService.getById(userId);
      if (user.role === "premium") {
        req.logger.INFO("Usuario autorizado");
        next();
      } else {
        req.logger.INFO(`Usuario no autorizado`);
        return res.status(403).redirect("products");
      }
    }
  } catch (error) {
    req.logger.FATAL(error.message);
    res.status(500).send(error.message);
  }
}

async function isLoggedIn(req, res, next) {
  try {
    const userId = jwt.verify(req.signedCookies.jwt, config.privateKey).id;
    req.logger.INFO("Usuario logueado: " + userId);
    next();
  } catch (error) {
    req.logger.WARN("Usuario sin loguear");
    let msg = "Debe inicia sesión";
    res.render("login", { msg });
  }
}
const storageConfig = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, folder)); // Carpeta donde se guardarán los archivos
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Nombre del archivo
    },
  });

// Middlewares de multer para diferentes tipos de archivos
const uploadProfileImg = multer({ storage: storageConfig("profiles") }).single(
  "profileImg"
);
const uploadProductImg = multer({ storage: storageConfig("products") }).array(
  "productImg",
  5
); // hasta 5 imágenes de producto
const uploadDocImg = multer({ storage: storageConfig("documents") }).array(
  "documents",
  3
);

export { verifyRole, isLoggedIn, uploadProfileImg, uploadProductImg, uploadDocImg };
