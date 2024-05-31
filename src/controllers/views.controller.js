import MessageManager from "../dao/manager_mongo/messageManager.js";
import CartsManager from "../dao/manager_mongo/cartsManager.js";
import jwt from "jsonwebtoken";
import userSchema from "../dao/models/user.schema.js";
import config from "../config/config.js";
import { port } from "../commander.js";
import { productService, userService } from "../repositories/index.js";
import { verifyEmailToken } from "../config/passport.config.js";

const mm = new MessageManager();
const cm = new CartsManager();

export async function rootView(req, res) {
  res.redirect("/login");
}

export async function socketView(req, res) {
  res.render("socket");
}

export async function realTimeProducts(req, res) {
  try {
    const userId = jwt.verify(req.signedCookies.jwt, config.privateKey).id;
    let userEmail;
    if (userId === 1) {
      userEmail = "admin";
    } else {
      const user = await userService.getById(userId);
      userEmail = user.email;
    }
    const products = await productService.get(req.body);
    const allProducts = await productService.get({ limit: products.totalDocs });
    res.render("realTimeProducts", { allProducts, userEmail, port });
  } catch (error) {
    req.logger.ERROR(error.message);
    res.status(500).send(error.messages);
  }
}

export async function chat(req, res) {
  try {
    if (req.signedCookies.jwt) {
      const userId = jwt.verify(req.signedCookies.jwt, config.privateKey).id;
      if (userId === 1) {
        res.status(200).redirect("/products");
      }
    }
    const messages = await mm.getMessages();
    res.render("chat", { messages });
  } catch (error) {
    req.logger.ERROR(error.message);
    res.status(500).send(error.messages);
  }
}

export async function getUserCart(req, res) {
  try {
    const cartId = req.params.cid;
    const cart = await cm.getCartById(req.params.cid);
    const cartJSON = JSON.parse(JSON.stringify(cart));
    let amount = 0;
    cartJSON.products.forEach((prod) => {
      prod.total = prod.quantity * prod.product.price;
      amount = amount + prod.quantity * prod.product.price;
    });
    res.render("inCart", { cartJSON, cartId, amount });
  } catch (error) {
    req.logger.ERROR(error.message);
    res.status(500).send(error.messages);
  }
}

export async function productsView(req, res) {
  console.log("Entra al products View");
  try {
    let user;
    let isAdmin = false;
    const userId = jwt.verify(req.signedCookies.jwt, config.privateKey).id;
    if (userId === 1) {
      user = config.userAdmin;
      isAdmin = true;
    } else {
      user = await userSchema.findById(userId);
    }
    let { limit, page, sort, filter } = req.query;
    const products = await productService.get(req.query);
    let isValid = products.page > 0 && products.page <= products.totalPages;
    products.prevLink = products.hasPrevPage
      ? `http://localhost:${port}/products?page=${products.prevPage}`
      : null;
    products.nextLink = products.hasNextPage
      ? `http://localhost:${port}/products?page=${products.nextPage}`
      : null;
    res.render("products", { products, limit, page, isValid, user, isAdmin, port });
  } catch (error) {
    req.logger.ERROR(error.message);
    res.status(500).send(error.messages);
  }
}

export async function failloginView(req, res) {
  let msg = req.query.msg;
  res.render("login", { msg });
}

export async function loginView(req, res) {
  if (req.signedCookies.jwt) {
    res.redirect("/products");
  } else {
    res.render("login");
  }
}

export async function profileView(req, res) {
  let user, isAdmin;
  const userId = jwt.verify(req.signedCookies.jwt, config.privateKey).id;
  if (userId === 1) {
    user = config.userAdmin;
    isAdmin = true;
  } else {
    user = await userSchema.findById(userId);
    isAdmin = false;
  }
  res.render("profile", { user, isAdmin });
}

export async function passwordRestoreView(req, res) {
  res.render("passwordRestore");
}
export async function restoreLinkView(req, res) {
  let email = req.query.email;
  const token = req.cookies.emailToken;
  const isValidToken = verifyEmailToken(token);
  if (!isValidToken) {
    let msg = "El enlace ha expirado";
    return res.render("login", { msg });
  }
  res.render("restoreLink", { email, token });
}

export async function registerView(req, res) {
  try {
    if (req.signedCookies.jwt) {
      res.redirect("/products");
    } else {
      res.render("register");
    }
  } catch (error) {
    req.logger.ERROR(error.message);
    res.status(500).send(error.messages);
  }
}
export async function failRegisterView(req, res) {
  let msg = req.query.msg;
  res.render("register", { msg });
}
