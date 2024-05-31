import UserManager from "../dao/manager_mongo/userManager.js";
import CartManager from "../dao/manager_mongo/cartsManager.js";
import mongoose from "mongoose";
import { expect } from "chai";
import { isValidPassword } from "../utils.js";

mongoose.connect(
  "mongodb+srv://carlaapata:Facundo1990@cluster0.ppztezy.mongodb.net/test?retryWrites=true&w=majority"
);

describe("Set de test de sesiones", () => {
  before(async function () {
    this.um = new UserManager();
    this.cm = new CartManager();
    mongoose.connection.collections.users.drop();
    mongoose.connection.collections.carts.drop();
    mongoose.connection.collections.products.drop();
    this.newCart = await this.cm.addCart();
    this.mockedUser = {
      first_name: "First Name",
      last_name: "Last Name",
      email: "first_last@mail.com",
      age: 18,
      password: "123123",
      role: "premium",
      cart: this.newCart._id,
    };
    this.newUser = await this.um.addUser({
      first_name: "Other First Name",
      last_name: " Other Last Name",
      email: "last_first@mail.com",
      age: 18,
      password: "123123",
      role: "user",
      cart: this.newCart._id,
    });
  });
  beforeEach(function () {
    this.timeout(5000);
  });
  it("El DAO debe agregar un usuario y hashear la password", async function () {
    const result = await this.um.addUser(this.mockedUser);
    expect(result).to.be.an("object");
    expect(mongoose.isValidObjectId(result._id)).to.be.true;
    expect(mongoose.isValidObjectId(result.cart)).to.be.true;
    expect(isValidPassword("123123", result.password)).to.be.true;
  });
  it("El DAO debe obtener un usuario por su email", async function () {
    const result = await this.um.getUserByEmail(this.newUser.email);
    expect(result).to.not.be.empty;
    expect(result).to.be.an("object");
    expect(mongoose.isValidObjectId(result._id)).to.be.true;
  });
  it("El DAO debe obtener un usuario por su id", async function () {
    const result = await this.um.getUserById(this.newUser._id);
    expect(result).to.not.be.empty;
    expect(result).to.be.an("object");
    expect(isValidPassword("123123", result.password)).to.be.true;
  });

  it("El DAO debe obtener un usuario por su credenciales", async function () {
    const result = await this.um.getUserByCreds(this.newUser.email, "123123");
    expect(result).to.not.be.empty;
    expect(result).to.be.an("object");
  });

  it("El DAO debe actualizar la password a un usuario", async function () {
    await this.um.updatePassword(this.newUser.email, "456456");
    const result = await this.um.getUserById(this.newUser._id);
    expect(isValidPassword("456456", result.password)).to.be.true;
  });

  it("El DAO debe actualizar el rol a un usuario", async function () {
    await this.um.updateRole(this.newUser.email);
    const result = await this.um.getUserById(this.newUser._id);
    expect(result.role).to.be.equal("premium");
  });
});
