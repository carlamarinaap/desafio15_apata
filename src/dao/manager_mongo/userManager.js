import { createHash, isValidPassword } from "../../utils.js";
import UserSchema from "../models/user.schema.js";

class UserManager {
  addUser = async (user) => {
    try {
      user.password = createHash(user.password);
      return await new UserSchema(user).save();
    } catch (error) {
      throw new Error(`Error al agregar el usuario: ${error.message}`);
    }
  };

  getUserByEmail = async (email) => {
    try {
      const user = await UserSchema.findOne({ email });
      if (user) {
        delete user.password;
        return user;
      } else {
        return null;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };

  getUserById = async (userId) => {
    try {
      return await UserSchema.findById(userId);
    } catch (error) {
      throw new Error(error.message);
    }
  };
  getUserByCreds = async (email, password) => {
    try {
      const user = await UserSchema.findOne({ email });
      if (user) {
        if (isValidPassword(password, user.password)) {
          delete user.password;
          return user;
        } else {
          return null;
        }
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };

  updatePassword = async (email, password) => {
    try {
      await UserSchema.findOneAndUpdate(
        { email: email },
        { $set: { password: createHash(password) } },
        { new: true }
      );
    } catch (error) {
      throw new Error(error.message);
    }
  };

  updateRole = async (email) => {
    try {
      let role;
      const user = await UserSchema.findOne({ email });
      user?.role === "user" ? (role = "premium") : (role = "user");
      await UserSchema.findOneAndUpdate(
        { email: email },
        { $set: { role: role } },
        { new: true }
      );
    } catch (error) {
      throw new Error(error.message);
    }
  };
}

export default UserManager;
