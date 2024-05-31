import ProductManager from "../dao/manager_mongo/productManager.js";
import mongoose from "mongoose";
import { expect } from "chai";

mongoose.connect(
  "mongodb+srv://carlaapata:Facundo1990@cluster0.ppztezy.mongodb.net/test?retryWrites=true&w=majority"
);

describe("Set de test de productos", () => {
  before(async function () {
    mongoose.connection.collections.products.drop();
    this.pm = new ProductManager();
    this.mockedProduct = {
      title: "Title",
      description: "This is a description",
      price: 1000,
      code: "asdasd",
      stock: 1,
      category: "Category",
      status: true,
    };
    this.newProduct = await this.pm.addProduct(this.mockedProduct);
  });
  beforeEach(function () {
    this.timeout(5000);
  });

  it("El DAO debe obtener todos los productos", async function () {
    const result = await this.pm.getProducts({});
    expect(result).to.have.property("totalDocs").to.be.a("number");
    expect(result).to.have.property("limit").to.be.a("number");
    expect(result).to.have.property("totalPages").to.be.a("number");
    expect(result).to.have.property("page").to.be.a("number");
    expect(result).to.have.property("hasPrevPage").to.be.a("boolean");
    expect(result).to.have.property("hasNextPage").to.be.a("boolean");
    expect(result).to.have.property("prevPage");
    expect(result).to.have.property("nextPage");
    expect(result).to.have.property("prevLink");
    expect(result).to.have.property("nextLink");
    expect(result).to.have.property("status");
    expect(result).to.have.property("payload").to.be.an("array");
  });
  it("El DAO debe agregar un producto", async function () {
    const mockedProduct2 = {
      title: "Title 2",
      description: "This is a second description",
      price: 5000,
      code: "code345",
      stock: 5,
      category: "Category",
      status: true,
    };
    const newProduct = await this.pm.addProduct(mockedProduct2);
    expect(mongoose.isValidObjectId(newProduct._id)).to.be.true;
  });
  it("El DAO debe obtener un producto por id", async function () {
    const result = await this.pm.getProductById(this.newProduct._id);
    expect(mongoose.isValidObjectId(result._id)).to.be.true;
    expect(result).to.not.be.empty;
  });

  it("El DAO debe actualizar los datos de un producto por id", async function () {
    const updates = {
      title: "Title changed",
      description: "This is another description",
      price: 1000000,
      stock: 1,
      category: "Category",
    };
    await this.pm.updateProduct(this.newProduct._id, updates);
    const result = await this.pm.getProductById(this.newProduct._id);
    expect(result).to.deep.include(updates);
  });

  it("El DAO debe eliminar un producto", async function () {
    const result = await this.pm.deleteProduct(this.newProduct._id);
    expect(result.deletedCount).to.be.equal(1);
  });
});
