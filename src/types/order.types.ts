import { Document, Types } from "mongoose";
import { OrderProduct } from "./product.types";

export type Order = Document & {
  products: OrderProduct[];
  user: Types.ObjectId;
  address: string;
  phone: number;
  amount: number;
  coupon?: string;
  transactionId?: string;
  status: "ordered" | "shipped" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
  total: number;
  ordered: number;
  shipped: number;
  completed: number;
  cancelled: number;
  productId: string;
  quantity: number;
};
