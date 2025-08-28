import { Request, Response } from "express";
import Coupon from "../models/coupon.schema";
import { AuthRequest } from "../middlewares/UserAuth";
import handler from "../services/handler";

export const createCoupon = handler(async (req: Request, res: Response) => {
  const { code, discount, expiry } = req.body;

  if (!code || !discount || !expiry) {
    return res
      .status(400)
      .json({ success: false, message: "Please fill all fields" });
  }

  const coupon = await Coupon.create({ code, discount, expiry });

  res.status(201).json({
    success: true,
    message: "Coupon created successfully",
    coupon,
  });
});

export const getCoupons = handler(async (_req: Request, res: Response) => {
  const coupons = await Coupon.find();
  if (!coupons.length) {
    return res
      .status(404)
      .json({ success: false, message: "No coupons found" });
  }

  res.status(200).json({ success: true, coupons });
});

export const updateCoupon = handler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { code, discount, expiry } = req.body;

  if (!code || !discount || !expiry) {
    return res
      .status(400)
      .json({ success: false, message: "Please fill all fields" });
  }

  const coupon = await Coupon.findByIdAndUpdate(
    id,
    { code, discount, expiry },
    { new: true }
  );

  if (!coupon) {
    return res
      .status(404)
      .json({ success: false, message: "Coupon not found" });
  }

  res.status(200).json({
    success: true,
    message: "Coupon updated successfully",
    coupon,
  });
});

export const deleteCoupon = handler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const coupon = await Coupon.findByIdAndDelete(id);

  if (!coupon) {
    return res
      .status(404)
      .json({ success: false, message: "Coupon not found" });
  }

  res.status(200).json({
    success: true,
    message: "Coupon deleted successfully",
  });
});

export const activeCoupon = handler(async (req: AuthRequest, res: Response) => {
  const { code } = req.body;

  if (!code) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide code" });
  }

  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "Please login to apply coupon" });
  }

  const coupon = await Coupon.findOne({ code });

  if (!coupon) {
    return res
      .status(404)
      .json({ success: false, message: "Coupon not found" });
  }

  const currentDate = new Date();
  const expiryDate = new Date(coupon.expiry);

  const isActive = currentDate <= expiryDate;

  res.status(200).json({
    success: true,
    message: isActive ? "Coupon is active" : "Coupon has expired",
    active: isActive,
  });
});
