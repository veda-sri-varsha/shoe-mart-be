import mongoose, { Schema, Model } from "mongoose";
import { Coupon } from "../types/index";

const couponSchema: Schema<Coupon> = new Schema(
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

const Coupon: Model<Coupon> = mongoose.model<Coupon>("Coupon", couponSchema);
export default Coupon;
