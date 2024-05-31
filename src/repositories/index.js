import ProductRepository from "./Products.repository.js  ";
import UserRepository from "./Users.repository.js";
import ProductManager from "../dao/manager_mongo/productManager.js";
import UserManager from "../dao/manager_mongo/userManager.js";

export const productService = new ProductRepository(new ProductManager());
export const userService = new UserRepository(new UserManager());
