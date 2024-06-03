import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    default: "user",
  },
  cart: {
    type: mongoose.Schema.ObjectId,
    ref: "Cart",
  },
  documents: {
    type: Array, //estructura: {name:string, reference: string(link al doc)}
  },
  last_connection: {
    type: String,
  },
});

export default mongoose.model("Users", UserSchema);
