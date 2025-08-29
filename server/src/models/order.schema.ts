import mongoose, { Schema, Types, Model } from "mongoose";
import { IOrder, IOrderProduct } from "../types/types";

const orderProductSchema = new Schema<IOrderProduct>(
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

const orderSchema: Schema<IOrder> = new Schema(
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

const Order: Model<IOrder> = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
