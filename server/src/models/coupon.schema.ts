import mongoose, { Document, Schema, Model } from "mongoose";
import { ICoupon } from "../types/types";

const couponSchema: Schema<ICoupon> = new Schema(
  {
    code: {
      type: String,
      required: [true, "Code is required"],
      unique: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    expiry: {
      type: Date,
      required: [true, "Expiry is required"],
    },
  },
  { timestamps: true }
);

const Coupon: Model<ICoupon> = mongoose.model<ICoupon>("Coupon", couponSchema);
export default Coupon;
