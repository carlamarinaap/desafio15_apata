import UsersDTO from "../dao/dto/users.dto.js";
export default class UserRepository {
  constructor(dao) {
    this.dao = dao;
  }

  getById = async (id) => {
    return await this.dao.getUserById(id);
  };

  getByEmail = async (email) => {
    return await this.dao.getUserByEmail(email);
  };

  getByCreds = async (email, password) => {
    return await this.dao.getUserByCreds(email, password);
  };

  add = async (user) => {
    const newUser = new UsersDTO(user);
    return await this.dao.addUser(newUser);
  };

  updatePassword = async (email, password) => {
    this.dao.updatePassword(email, password);
  };
  updateRole = async (email) => {
    this.dao.updateRole(email);
  };
}
