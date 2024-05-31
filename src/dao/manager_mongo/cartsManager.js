import { Error } from "mongoose";
import CartSchema from "../models/cart.schema.js";
import express from "express";
import cartSchema from "../models/cart.schema.js";
import ticketSchema from "../models/ticket.schema.js";
import { productService } from "../../repositories/index.js";
import moment from "moment";
import userSchema from "../models/user.schema.js";
import { NotFound } from "../../test/customError.js";
import productSchema from "../models/product.schema.js";

const router = express.Router();

class CartsManager {
  getCarts = async () => {
    return await CartSchema.find();
  };

  getCartById = async (cartId) => {
    const cart = await CartSchema.findById(cartId).populate({
      path: "products.product",
      model: "Products",
    });
    if (cart) {
      return cart;
    } else {
      throw new NotFound();
    }
  };

  addCart = async () => {
    return await new CartSchema().save();
  };

  updateCart = async (cartId, productId) => {
    const cart = await CartSchema.findById(cartId);
    if (!cart) {
      throw new NotFound(`No se encontró el carrito`);
    }
    const product = await productSchema.findById(productId);
    if (!product) {
      throw new NotFound(`No se encontró el producto`);
    }
    const update = await CartSchema.findOneAndUpdate(
      { _id: cartId, "products.product": productId },
      { $inc: { "products.$.quantity": 1 } },
      { new: true } // Devuelve el documento actualizado
    );
    if (!update) {
      // Si el producto no está en el carrito, lo agrega
      await CartSchema.findByIdAndUpdate(cartId, {
        $push: { products: { product: productId, quantity: 1 } },
      });
    }
  };

  updateProductsQuantityInCart = async (cartId, productId, amount) => {
    const cart = await CartSchema.findById(cartId);
    if (!cart) {
      throw new NotFound(`No se encontró el carrito`);
    }
    const product = await productSchema.findById(productId);
    if (!product) {
      throw new NotFound(`No se encontró el producto`);
    }
    const { quantity } = amount;
    if (!quantity) {
      throw new NotFound(`No se encontró cantidad a actualizar`);
    }
    await CartSchema.findOneAndUpdate(
      { _id: cartId, "products.product": productId },
      { $set: { "products.$.quantity": amount.quantity } },
      { new: true }
    );
  };

  updateProductsInCart = async (cartId, allProducts) => {
    const cart = await CartSchema.findById(cartId);
    if (!cart) {
      throw new NotFound(`No se encontró el carrito`);
    }
    await CartSchema.findByIdAndUpdate(cartId, {
      $set: { products: allProducts },
    });
  };

  deleteProduct = async (cartId, prodId) => {
    const cart = await CartSchema.findById(cartId);
    const productId = prodId.toString();
    if (!cart) {
      throw new NotFound(`No se encontró el carrito`);
    }
    const product = await productSchema.findById(productId);
    if (!product) {
      throw new NotFound(`No se encontró el producto`);
    }
    const exists = cart.products.find(
      (product) => product.product.toString() === productId
    );
    if (!exists) {
      throw new NotFound(`No se encontró el producto dentro del carrito`);
    }
    cart.products = cart.products.filter(
      (product) => product.product.toString() !== productId
    );
    await cart.save();
  };

  cleanCartById = async (cartId) => {
    const cart = await CartSchema.findById(cartId);
    if (!cart) {
      throw new NotFound(`No se encontró el carrito`);
    }
    await CartSchema.updateOne({ _id: cartId }, { $set: { products: [] } });
  };

  purchase = async (cartId) => {
    const cart = await cartSchema.findById(cartId);
    if (!cart) {
      throw new NotFound(`No se encontró el carrito`);
    }
    const user = await userSchema.findOne({ cart: cartId });
    if (!user) {
      throw new NotFound(`Ningún usuario posee este carrito`);
    }
    const cartJSON = JSON.parse(JSON.stringify(cart));
    const avaiableCart = cartJSON.products.filter(async (prod) => {
      const product = await productService.getById(prod.product);
      prod.quantity <= product.stock;
    });
    let amount = 0;
    await Promise.all(
      avaiableCart.map(async (prod) => {
        const product = await productService.getById(prod.product);
        amount = amount + prod.quantity * product.price;
      })
    );
    let data = {
      purchase_datetime: moment().format("YYYYMMDDHHmmss"),
      purchaser: user.email,
      amount: amount,
    };
    avaiableCart.forEach(async (prod) => {
      const product = await productService.getById(prod.product);
      delete product.code;
      product.stock = product.stock - prod.quantity;
      productService.update(prod.product, product);
      this.deleteProduct(cartId, prod.product);
    });
    // Generar el ticket:
    const ticket = new ticketSchema(data).save();
    return ticket;
  };
}

export default CartsManager;
