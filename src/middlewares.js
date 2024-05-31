import jwt from "jsonwebtoken";
import config from "./config/config.js";
import { userService } from "./repositories/index.js";

export async function verifyRole(req, res, next) {
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

export async function isLoggedIn(req, res, next) {
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
