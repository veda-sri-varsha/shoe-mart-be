import mongoose, { Schema, Model } from "mongoose";
import { Order, OrderProduct } from "../types/index";

const orderProductSchema = new Schema<OrderProduct>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    count: {
      type: Number,
      required: true,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const orderSchema: Schema<Order> = new Schema(
  {
    products: {
      type: [orderProductSchema],
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    phone: {
      type: Number,
      required: [true, "Phone Number is required"],
      unique: true,
      maxLength: [10, "Phone should not be more than 10 digits"],
    },
    amount: {
      type: Number,
      required: true,
    },
    coupon: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["ordered", "shipped", "completed", "cancelled"],
      default: "ordered",
    },
  },
  { timestamps: true }
);

const Order: Model<Order> = mongoose.model<Order>("Order", orderSchema);

export default Order;
