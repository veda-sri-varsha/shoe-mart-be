import { Document, Types } from "mongoose";
import AuthRoles from "../constants/authRoles";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: (typeof AuthRoles)[keyof typeof AuthRoles];
  refreshToken?: string;
  forgotPasswordToken?: string;
  forgotPasswordExpire?: Date;
  verifyToken?: string | undefined;
  verifyTokenExpire?: Date | undefined;
  isVerified: {
    type: Boolean;
    default: false;
  };

  generateAccessToken(): string;
  generateRefreshToken(): string;
  generateForgotPasswordToken(): string;
}

export interface IOrderProduct {
  productId: Types.ObjectId;
  count: number;
  price: number;
  quantity: number;
}

export interface IProduct extends Document {
  name: string;
  price: number;
  description?: string;
  ratings: number;
  images: { url: string }[];
  category: string;
  stock: number;
  sold: number;
  collectionId: Types.ObjectId;
  isDeleted: {
    type: Boolean;
    default: false;
  };
}

export interface ICollection extends Document {
  name: string;
  images: { url: string }[];
  isActive: boolean;
  productCount: number;
  products: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrder extends Document {
  products: IOrderProduct[];
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
}

export interface ICoupon extends Document {
  code: string;
  discount: number;
  active: boolean;
  expiry: Date;
  createdAt: Date;
  updatedAt: Date;
}
