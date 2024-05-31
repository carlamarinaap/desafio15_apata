import { fileURLToPath } from "url";
import { dirname } from "path";
import { faker } from "@faker-js/faker";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

// Bcrypt

import bcrypt from "bcryptjs";
export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (password, passwordHash) =>
  bcrypt.compareSync(password, passwordHash);

// Mocks
export const generateProducts = () => {
  return {
    id: faker.database.mongodbObjectId(),
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: faker.commerce.price(),
    thumbnails: [],
    code: faker.string.alphanumeric({ length: { min: 4, max: 12 } }),
    stock: faker.number.int(99),
    category: faker.commerce.productMaterial(),
    status: faker.datatype.boolean(),
  };
};
