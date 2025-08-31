import mongoose, { Schema, Model } from "mongoose";
import { Collection } from "../types/index";

const collectionSchema: Schema<Collection> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Collection Name is required"],
      trim: true,
      maxlength: [120, "Name should not be more than 120 characters"],
    },
    images: [
      {
        url: { type: String, required: true },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    productCount: {
      type: Number,
      default: 0,
    },

    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

collectionSchema.pre("save", function (next) {
  if (this.products) {
    this.productCount = this.products.length;
  }
  next();
});

const Collection: Model<Collection> = mongoose.model<Collection>(
  "Collection",
  collectionSchema
);

export default Collection;
