import dotenv from "dotenv";
import { mode } from "../commander.js";

dotenv.config({
  path: `./.env.${mode}`,
});

export default {
  mongoUrl: process.env.MONGO_URL,
  mongoUrlTest: process.env.MONGO_URL_TEST,
  privateKey: process.env.PRIVATE_KEY,
  logger: process.env.LOGGER,
  userAdmin: {
    _id: 1,
    first_name: process.env.ADMIN_FIRST_NAME,
    last_name: process.env.ADMIN_LAST_NAME,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    age: 0,
    role: "admin",
  },
};
