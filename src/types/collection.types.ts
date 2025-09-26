import { Document, Types } from "mongoose";

export type Collection = Document & {
  name: string;
  images: { url: string }[];
  isActive: boolean;
  productCount: number;
  products: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
};
