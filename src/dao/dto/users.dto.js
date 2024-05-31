export default class UsersDTO {
  constructor(user) {
    (this.first_name = user.first_name),
      (this.last_name = user.last_name ? user.last_name : ""),
      (this.email = user.email),
      (this.age = user.age ? user.age : 0),
      (this.password = user.password ? user.password : ""),
      (this.role = user.role ? user.role : "user"),
      (this.cart = user.cart);
  }
}
