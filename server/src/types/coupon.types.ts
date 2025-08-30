import { Document } from "mongoose";

export type Coupon = Document & {
  code: string;
  discount: number;
  active: boolean;
  expiry: Date;
  createdAt: Date;
  updatedAt: Date;
};
