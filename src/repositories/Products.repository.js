import ProductDTO from "../dao/dto/products.dto.js";

export default class ProductRepository {
  constructor(dao) {
    this.dao = dao;
  }
  get = async (data) => {
    return await this.dao.getProducts(data);
  };
  getById = async (id) => {
    return await this.dao.getProductById(id);
  };

  add = async (product) => {
    const newProduct = new ProductDTO(product);
    return await this.dao.addProduct(newProduct);
  };
  update = async (id, data) => {
    const update = new ProductDTO(data);
    this.dao.updateProduct(id, update);
  };

  delete = async (id) => {
    this.dao.deleteProduct(id);
  };
}
