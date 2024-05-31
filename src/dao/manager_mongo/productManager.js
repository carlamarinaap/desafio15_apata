import { port } from "../../commander.js";
import { DuplicateCode, IncompleteFields, NotFound } from "../../test/customError.js";
import productSchema from "../models/product.schema.js";

class ProductManager {
  getProducts = async (data) => {
    try {
      let { limit, page, sort, category, stock } = data;
      limit ? limit : (limit = 10);
      page ? page : (page = 1);
      let query = {};
      if (category && stock) {
        query = { $and: [{ category: category }, { stock: { $gt: 0 } }] };
      } else if (category) {
        query = { category: category };
      } else if (stock) {
        query = { stock: { $gt: 0 } };
      }

      let sortQuery = {};
      if (sort === "asc" || sort === "desc") {
        sortQuery = { price: sort === "asc" ? 1 : -1 };
      }

      const result = await productSchema.paginate(query, {
        limit: limit,
        page: page,
        lean: true,
        sort: sortQuery,
      });

      result.prevLink = result.hasPrevPage
        ? `http://localhost:${port}/api/products?page=${result.prevPage}`
        : null;
      result.nextLink = result.hasNextPage
        ? `http://localhost:${port}/api/products?page=${result.nextPage}`
        : null;
      result.status = "success";
      result.payload = result.docs;
      delete result.docs;
      delete result.pagingCounter;
      return result;
    } catch (error) {
      throw new Error(`Hubo un error obteniendo los productos: ${error.message}`);
    }
  };

  getProductById = async (productId) => {
    const product = await productSchema.findById(productId);
    if (product) {
      return product;
    } else {
      throw new NotFound();
    }
  };

  addProduct = async (product) => {
    const { title, description, price, code, stock, category } = product;
    if (!title || !description || !price || !code || !stock || !category) {
      throw new IncompleteFields(
        `- ${title ? "" : "title - "} ${description ? "" : "description - "}${
          price ? "" : "price - "
        }${code ? "" : "code - "}${stock ? "" : "stock - "}${
          category ? "" : "category - "
        }`
      );
    }
    let exists = await productSchema.findOne({ code: product.code });
    if (exists) {
      throw new DuplicateCode();
    }
    const newProduct = await new productSchema(product).save();
    if (!newProduct) {
      throw new Error(`No se pudo guardar el nuevo producto: ${error.message}`);
    }
    return newProduct;
  };

  updateProduct = async (productId, updates) => {
    const { title, description, price, stock, category } = updates;
    if (!title || !description || !price || !stock || !category) {
      throw new IncompleteFields(
        `- ${title ? "" : "title - "} ${description ? "" : "description - "}${
          price ? "" : "price - "
        }${stock ? "" : "stock - "}${category ? "" : "category - "}`
      );
    }
    const product = await productSchema.findById(productId);
    if (!product) {
      throw new NotFound();
    }
    return await productSchema.updateOne({ _id: productId }, updates);
  };

  deleteProduct = async (productId) => {
    const product = await productSchema.findById(productId);
    if (product) {
      return await productSchema.deleteOne({ _id: productId });
    } else {
      throw new NotFound();
    }
  };
}

export default ProductManager;
