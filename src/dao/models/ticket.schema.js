import mongoose from "mongoose";
import uuid4 from "uuid4";

const TicketSchema = new mongoose.Schema({
  code: {
    type: String,
    default: function () {
      return uuid4();
    },
  },
  purchase_datetime: {
    type: String,
    required: true,
  },
  amount: Number,
  purchaser: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Tickets", TicketSchema);
