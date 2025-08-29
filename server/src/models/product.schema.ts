import mongoose, { Schema } from "mongoose";
import { IProduct } from "../types/types";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product Name is required"],
      trim: true,
      maxLength: [120, "Product Name Should not be more than 120 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product Price is required"],
      maxLength: [6, "Product Price Should not be more than 5 characters"],
    },
    brand: {
      type: String,
      required: [true, "Product Brand is required"],
    },
    description: {
      type: String,
    },
    ratings: {
      type: Number,
      default: 0,
    },
    images: [
      {
        url: {
          type: String,
        },
      },
    ],
    category: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    collectionId: {
      type: mongoose.Schema.ObjectId,
      ref: "Collection",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);

productSchema.plugin(aggregatePaginate);

const Product = mongoose.model<
  IProduct,
  mongoose.AggregatePaginateModel<IProduct>
>("Product", productSchema);

export default Product;
