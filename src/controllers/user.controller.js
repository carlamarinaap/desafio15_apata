import passport from "passport";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { userService } from "../repositories/index.js";
import { verifyEmailToken } from "../config/passport.config.js";
import userSchema from "../dao/models/user.schema.js";
import path from "path";

export async function register(req, res, next) {
  passport.authenticate("register", async (err, user) => {
    try {
      if (err) {
        return res.redirect(`/failRegister?msg=${err}`);
      }
      if (!user) {
        return res.redirect("/failRegister?msg=Debe completar todos los campos");
      }
      res.cookie("jwt", user.token, {
        signed: true,
        httpOnly: true,
        maxAge: 1000 * 60 * 60,
      });
      res.redirect("/products");
    } catch (error) {
      req.logger.ERROR(error.message);
      next(error);
    }
  })(req, res, next);
}

export async function login(req, res, next) {
  passport.authenticate("login", async (err, user, info) => {
    try {
      if (err) {
        let msg = err;
        return res.render("login", { msg });
      }
      if (!user) {
        let msg = info.message;
        return res.render("login", { msg });
      }
      res
        .cookie("jwt", user.token, {
          signed: true,
          httpOnly: true,
          maxAge: 1000 * 60 * 60,
        })
        .redirect("/products");
    } catch (error) {
      req.logger.ERROR(error.message);
      next(error);
    }
  })(req, res, next);
}

export async function logout(req, res) {
  try {
    res.clearCookie("jwt");
    let msg = "Se cerró la sesión";
    res.render("login", { msg });
  } catch (error) {
    req.logger.ERROR(error.message);
    res.status(500).send(error.message);
  }
}

export async function passwordRestore(req, res) {
  try {
    let { email, password, confirm } = req.body;
    const token = req.cookies.emailToken;
    const isValidToken = verifyEmailToken(token);
    if (!isValidToken) {
      let msg = "El enlace ha expirado";
      return res.render("login", { msg });
    }
    const user = await userService.getByEmail(email);

    if (user && password && confirm && password === confirm) {
      const currentPassword = await userService.getByCreds(email, password);
      if (!currentPassword) {
        await userService.updatePassword(email, password);
        let msg = "Contraseña cambiada con éxito";
        res.render("login", { msg });
      } else {
        let msg = "No puede utilizar la contraseña anterior";
        res.render("login", { msg });
      }
    }
  } catch (error) {
    req.logger.ERROR(error.message);
    res.status(500).send(error.message);
  }
}

export async function current(req, res) {
  try {
    let user;
    if (req.signedCookies.jwt) {
      const userId = jwt.verify(req.signedCookies.jwt, config.privateKey).id;
      if (userId === 1) {
        user = config.userAdmin;
      } else {
        user = await userService.getById(userId);
      }
    } else {
      res.status(400).json("Nadie logueado");
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export async function githubcallbackapata(req, res) {
  try {
    res.cookie("jwt", req.user.token, {
      signed: true,
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    });
    res.redirect("/products");
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export async function changeRole(req, res) {
  try {
    const user = await userService.getById(req.params.uid);
    if (!user) {
      res.status(404).send("No se encontró el usuario");
    }
    if (user && user.role === "premium") {
      await userService.updateRole(user.email);
      res.status(200).send("Rol del usuario cambiado a user con éxito");
    }
    if (user && user.role === "user") {
      const filtro = user.documents.filter((file) => {
        return (
          file.name === "identificacion" ||
          file.name === "domicilio" ||
          file.name === "estadoCuenta"
        );
      });
      if (filtro.length === 3) {
        await userService.updateRole(user.email);
      }
      res.status(200).send("Rol del usuario cambiado a premium con éxito");
    }
    // else {devolver un error  indicando que el usuario  no ha terminado de procesar su documentacion}
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export async function githubLogin(req, res) {
  console.log("Pasa por user.controller");
}

export async function chargeProfileImg(req, res) {
  try {
    const userId = req.params.uid;
    const docPath = req.file.path;
    const user = await userService.getById(userId);
    if (!user) {
      return res.status(404).send("Usuario no encontrado");
    }
    const filtro = user.documents.find((file) => {
      return file.name === "ProfileImg";
    });

    if (!filtro) {
      user.documents.push({
        name: "ProfileImg",
        reference: `profiles/${path.basename(docPath)}`,
      });
    } else {
      filtro.reference = `profiles/${path.basename(docPath)}`;
    }
    await userSchema.findByIdAndUpdate(userId, user);

    res.status(200).send("Documentos subidos correctamente");
  } catch (error) {
    res.status(500).send("Error al subir los documentos" + error.message);
  }
}

export async function chargeDocumentation(req, res) {
  try {
    const userId = req.params.uid;
    const docPath = req.files;
    const user = await userService.getById(userId);
    if (!user) {
      return res.status(404).send("Usuario no encontrado");
    }

    if (docPath.identificacion) {
      const filtroIdentificacion = user.documents.find((file) => {
        return file.name === "identificacion";
      });

      if (!filtroIdentificacion) {
        user.documents.push({
          name: "identificacion",
          reference: `documents/${docPath.identificacion[0].filename}`,
        });
      } else {
        filtro.reference = `documents/${docPath.identificacion[0].filename}`;
      }
    }
    if (docPath.domicilio) {
      const filtroDomicilio = user.documents.find((file) => {
        return file.name === "domicilio";
      });

      if (!filtroDomicilio) {
        user.documents.push({
          name: "domicilio",
          reference: `documents/${docPath.domicilio[0].filename}`,
        });
      } else {
        filtro.reference = `documents/${docPath.domicilio[0].filename}`;
      }
    }
    if (docPath.estadoCuenta) {
      const filtroEstadoCta = user.documents.find((file) => {
        return file.name === "estadoCuenta";
      });

      if (!filtroEstadoCta) {
        user.documents.push({
          name: "estadoCuenta",
          reference: `documents/${docPath.estadoCuenta[0].filename}`,
        });
      } else {
        filtro.reference = `documents/${docPath.estadoCuenta[0].filename}`;
      }
    }

    await userSchema.findByIdAndUpdate(userId, user);

    res.status(200).send("Documentos subidos correctamente");
  } catch (error) {
    res.status(500).send("Error al subir los documentos" + error.message);
  }
}
