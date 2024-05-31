import mongoose from "mongoose";
import { expect } from "chai";
import supertest from "supertest";
import { port } from "../commander.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { isValidPassword } from "../utils.js";
import UserManager from "../dao/manager_mongo/userManager.js";

const requester = supertest(`http://localhost:${port}`);

describe("Testing de integración", () => {
  let cookie;
  beforeEach(async () => {
    const res = await requester
      .post(`/api/sessions/login`)
      .send({ email: "last_first@mail.com", password: "456456" });
    cookie = res.headers["set-cookie"][0];
  });

  describe("Test del router de usuarios", () => {
    it("El endpoint POST /api/sessions/register debe registrar un usuario", async () => {
      const mockedUser = {
        first_name: "First Name",
        last_name: "Last Name",
        email: "mail@mail.com",
        age: 18,
        password: "mail@mail.com",
        confirm: "123123",
        password: "123123",
      };
      const { statusCode, ok } = await requester
        .post("/api/sessions/register")
        .send(mockedUser);
      expect(statusCode).to.be.equal(200);
      expect(ok).to.be.true;
    });

    it("El endpoint POST /api/sessions/login debe iniciar la sesión de un usuario", async () => {
      const { statusCode, ok } = await requester
        .post("/api/sessions/login")
        .send({ email: "mail@mail.com", password: "123123" });
      expect(statusCode).to.be.equal(200);
      expect(ok).to.be.true;
    });
    it("El endpoint GET /api/sessions/logout debe cerrar la sesión", async () => {
      await requester
        .post("/api/sessions/login")
        .send({ email: "mail@mail.com", password: "123123" });
      const { statusCode, ok } = await requester.get("/api/sessions/logout").send();
      expect(statusCode).to.be.equal(200);
      expect(ok).to.be.true;
    });
  });

  describe("Test del router de productos", () => {
    it("El endpoint POST /api/products debe agregar un producto", async () => {
      const mockedProduct = {
        title: "Title",
        description: "This is a description",
        price: 1000,
        code: "code456",
        stock: 1,
        category: "Category",
      };
      const { statusCode, ok } = await requester
        .post(`/api/products`)
        .set("Cookie", cookie)
        .send(mockedProduct);
      expect(statusCode).to.be.equal(201);
      expect(ok).to.be.true;
    });

    it("El endpoint GET /api/products debe traer todos los productos", async () => {
      const { statusCode, ok, _body } = await requester.get("/api/products").send({});
      expect(statusCode).to.be.equal(200);
      expect(ok).to.be.true;
      expect(_body).to.be.an("object");
      expect(_body.totalDocs).to.be.a("number");
      expect(_body.limit).to.be.a("number");
      expect(_body.totalPages).to.be.a("number");
      expect(_body.page).to.be.a("number");
      expect(_body.hasPrevPage).to.be.a("boolean");
      expect(_body.hasNextPage).to.be.a("boolean");
      expect(_body.payload).to.be.an("array");
    });

    it("El endpoint GET /api/products/:pid debe traer el producto con el id suministrado", async () => {
      const { _body } = await requester.get("/api/products").send({});
      const pid = _body.payload[0]._id;
      const result = await requester.get(`/api/products/${pid}`).send();
      expect(result.statusCode).to.be.equal(200);
      expect(result.ok).to.be.true;
      expect(result._body).to.be.an("object");
      expect(mongoose.isValidObjectId(result._body._id)).to.be.true;
    });
    it("El endpoint PUT /api/products/:pid debe actualizar un producto", async () => {
      const result = await requester.get("/api/products").send({});
      const pid = result._body.payload[0]._id;
      const updates = {
        title: "Title modified",
        description: "This is a description",
        price: 1000,
        stock: 10,
        category: "Category",
      };
      const { statusCode, ok } = await requester
        .put(`/api/products/${pid}`)
        .send(updates);

      expect(statusCode).to.be.equal(200);
      expect(ok).to.be.true;
    });
    it("El endpoint DELETE /api/products/:pid debe eliminar un producto", async () => {
      const { _body } = await requester.get("/api/products").send({});
      const pid = _body.payload[0]._id;
      const { statusCode, ok } = await requester
        .delete(`/api/products/${pid}`)
        .set("Cookie", cookie)
        .send();
      expect(statusCode).to.be.equal(200);
      expect(ok).to.be.true;
    });
  });

  describe("Test del router de carritos", () => {
    it("El endpoint POST /api/carts debe crear un carrito", async () => {
      const { statusCode, ok } = await requester.post("/api/carts").send({});
      const { _body } = await requester.get("/api/carts").send();
      expect(statusCode).to.be.equal(201);
      expect(ok).to.be.true;
      expect(_body[0]).to.be.an("object");
      expect(_body[0].products).to.be.an("array");
      expect(mongoose.isValidObjectId(_body[0]._id)).to.be.true;
    });
    it("El endpoint GET /api/carts debe traer todos los carritos", async () => {
      const { statusCode, ok, _body } = await requester.get("/api/carts").send();
      expect(statusCode).to.be.equal(200);
      expect(ok).to.be.true;
      expect(_body).to.be.an("array");
    });
    it("El endpoint GET /api/carts/:cid debe traer el carrito con el id suministrado", async () => {
      const result = await requester.get("/api/carts").send();
      const cid = result._body[0]._id;
      const { statusCode, ok, _body } = await requester.get(`/api/carts/${cid}`).send();
      expect(statusCode).to.be.equal(200);
      expect(ok).to.be.true;
      expect(_body).to.be.an("object");
      expect(mongoose.isValidObjectId(_body._id)).to.be.true;
    });
    it("El endpoint POST /api/carts/:cid/products/:pid debe agregar un producto al carrito", async () => {
      const cart = await requester.get("/api/carts").send();
      const cid = cart._body[0]._id;
      const mockedProduct = {
        title: "Title",
        description: "This is a description",
        price: 1000,
        code: "code123",
        stock: 1,
        category: "Category",
      };
      await requester.post(`/api/products`).set("Cookie", cookie).send(mockedProduct);
      const product = await requester.get("/api/products").send({});
      const pid = product._body.payload[0]._id;
      const { statusCode, ok } = await requester
        .post(`/api/carts/${cid}/products/${pid}`)
        .set("Cookie", cookie)
        .send();
      const result = await requester.get(`/api/carts/${cid}`).send();
      expect(statusCode).to.be.equal(200);
      expect(ok).to.be.true;
      expect(result._body.products).length(1);
      expect(result._body.products[0].product._id).to.be.equal(pid);
    });
    it("El endpoint DELETE /api/carts/:cid debe vaciar el carrito", async () => {
      const cart = await requester.get("/api/carts").send();
      const cid = cart._body[0]._id;
      await requester.delete(`/api/carts/${cid}`).send();
      const { statusCode, ok, _body } = await requester.get(`/api/carts/${cid}`).send();
      expect(statusCode).to.be.equal(200);
      expect(ok).to.be.true;
      expect(_body.products).length(0);
    });
    it("El endpoint DELETE /api/carts/:cid/products/:pid debe eliminar el producto correspondiente del carrito", async () => {
      const cart = await requester.get("/api/carts").send();
      const cid = cart._body[0]._id;
      const mockedProduct = {
        title: "Title",
        description: "This is a description",
        price: 1000,
        code: "code789",
        stock: 1,
        category: "Category",
      };
      await requester.post(`/api/products`).set("Cookie", cookie).send(mockedProduct);
      const product = await requester.get("/api/products").send({});
      const pid = product._body.payload[0]._id;
      await requester.delete(`/api/carts/${cid}/products/${pid}`).send();
      const { statusCode, ok, _body } = await requester.get(`/api/carts/${cid}`).send();
      expect(statusCode).to.be.equal(200);
      expect(ok).to.be.true;
      expect(_body.products).length(0);
    });
    it("El endpoint PUT /api/carts/:cid debe actualizar los productos de un carrito", async () => {
      const cart = await requester.get("/api/carts").send();
      const cid = cart._body[0]._id;
      const product = await requester.get("/api/products").send({});
      const pid = product._body.payload[0]._id;
      await requester.put(`/api/carts/${cid}`).send([{ product: pid, quantity: 10 }]);
      const { statusCode, ok, _body } = await requester.get(`/api/carts/${cid}`).send();
      expect(statusCode).to.be.equal(200);
      expect(ok).to.be.true;
      expect(_body.products).length(1);
      expect(_body.products[0].quantity).to.be.equal(10);
    });
    it("El endpoint PUT /api/carts/:cid/products/:pid debe actualizar la cantidad de un producto en un carrito", async () => {
      const cart = await requester.get("/api/carts").send();
      const cid = cart._body[0]._id;
      const product = await requester.get("/api/products").send({});
      const pid = product._body.payload[0]._id;
      await requester
        .put(`/api/carts/${cid}/products/${pid}`)
        .set("Cookie", cookie)
        .send({ quantity: 10000 });
      const { statusCode, ok, _body } = await requester.get(`/api/carts/${cid}`).send();
      expect(statusCode).to.be.equal(200);
      expect(ok).to.be.true;
      expect(_body.products[0].quantity).to.be.equal(10000);
    });
  });
});
