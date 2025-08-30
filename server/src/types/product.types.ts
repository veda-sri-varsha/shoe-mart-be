import { Document, Types } from "mongoose";

export type Product = Document & {
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

export type OrderProduct = {
  productId: Types.ObjectId;
  count: number;
  price: number;
  quantity: number;
};
