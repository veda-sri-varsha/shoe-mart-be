import { Document, Types } from "mongoose";
import AuthRoles from "../constants/authRoles";

export type IUser = Document & {
  name: string;
  email: string;
  password: string;
  role: (typeof AuthRoles)[keyof typeof AuthRoles];
  isVerified: boolean;
  verifyOtp?: string;
  verifyOtpExpireAt?: Date;
  resetOtp?: string;
  resetOtpExpireAt?: Date;
  refreshToken?: string;
  forgotPasswordToken?: string;
  forgotPasswordExpire?: Date;

  generateAccessToken(): string;
  generateRefreshToken(): string;
  generateForgotPasswordToken(): string;
  generateEmailVerification(): string;
};

export type IOrderProduct = {
  productId: Types.ObjectId;
  count: number;
  price: number;
  quantity: number;
};

export type IProduct = Document & {
  name: string;
  price: number;
  brand: string;
  description?: string;
  ratings: number;
  images: { url: string }[];
  category: string;
  stock: number;
  sold: number;
  collectionId: Types.ObjectId;
  isDeleted: {
    type: boolean;
    default: false;
  };
};

export type ICollection = Document & {
  name: string;
  images: { url: string }[];
  isActive: boolean;
  productCount: number;
  products: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
};

export type IOrder = Document & {
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
};

export type ICoupon = Document & {
  code: string;
  discount: number;
  active: boolean;
  expiry: Date;
  createdAt: Date;
  updatedAt: Date;
};
