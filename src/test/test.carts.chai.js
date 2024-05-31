import mongoose from "mongoose";
import { expect } from "chai";
import CartsManager from "../dao/manager_mongo/cartsManager.js";
import ProductManager from "../dao/manager_mongo/productManager.js";

mongoose.connect(
  "mongodb+srv://carlaapata:Facundo1990@cluster0.ppztezy.mongodb.net/test?retryWrites=true&w=majority"
);

describe("Set de test de carritos", () => {
  before(async function () {
    mongoose.connection.collections.carts.drop();
    mongoose.connection.collections.products.drop();
    mongoose.connection.collections.users.drop();
    this.cm = new CartsManager();
    this.pm = new ProductManager();
    this.newCart = await this.cm.addCart();
    this.newProduct = await this.pm.addProduct({
      title: "Title",
      description: "This is a description",
      price: 1000,
      code: "code123",
      stock: 1,
      category: "Category",
      status: true,
    });
  });
  beforeEach(async function () {
    this.timeout(5000);
  });
  it("El DAO debe obtener todos los carritos", async function () {
    const result = await this.cm.getCarts();
    expect(result).to.be.an("array");
  });
  it("El DAO debe agregar un carrito", async function () {
    const result = await this.cm.addCart();
    expect(mongoose.isValidObjectId(result._id)).to.be.true;
    expect(result.products).to.be.an("array");
  });
  it("El DAO debe obtener un producto por id", async function () {
    const result = await this.cm.getCartById(this.newCart._id);
    await this.cm.updateCart(this.newCart._id, this.newProduct._id);
    expect(mongoose.isValidObjectId(result._id)).to.be.true;
    expect(result).to.not.be.empty;
    expect(result).to.be.an("object");
    expect(result.products).to.be.an("array");
  });

  it("El DAO debe agregar un producto al carrito y cuantificarlo", async function () {
    await this.cm.updateCart(this.newCart._id, this.newProduct._id);
    const result = await this.cm.getCartById(this.newCart._id);
    expect(result.products).length(1);
  });

  it("El DAO debe actualizar la cantidad de un producto en el carrito", async function () {
    await this.cm.updateProductsQuantityInCart(this.newCart._id, this.newProduct._id, {
      quantity: 10,
    });
    const result = await this.cm.getCartById(this.newCart._id);
    expect(result.products[0].quantity).to.be.deep.equal(10);
  });

  it("El DAO debe actualizar todos los productos de un carrito", async function () {
    await this.cm.updateProductsInCart(this.newCart._id, {
      product: this.newProduct._id,
      quantity: 6,
    });
    const result = await this.cm.getCartById(this.newCart._id);
    expect(result.products[0].quantity).to.be.deep.equal(6);
    expect(result.products[0].product).to.be.an("object");
    expect(result.products[0].product._id).to.be.deep.equal(this.newProduct._id);
  });

  it("El DAO debe eliminar un producto del carrito", async function () {
    await this.cm.updateCart(this.newCart._id, this.newProduct._id);
    const result = await this.cm.getCartById(this.newCart._id);
    await this.cm.deleteProduct(result._id, this.newProduct._id);
    const result2 = await this.cm.getCartById(this.newCart._id);
    expect(result2.products).to.be.empty;
  });
});
