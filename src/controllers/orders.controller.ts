import { Request, Response } from "express";
import handler from "../services/handler";
import Order from "../models/order.schema";
import Razorpay from "razorpay";
import { AuthRequest } from "../middlewares/UserAuth";
import config from "../config";

const razorpay = new Razorpay({
  key_id: config.RAZORPAY_KEY,
  key_secret: config.RAZORPAY_SECRET,
});

export const generateRazorPayOrderId = handler(
  async (req: AuthRequest, res: Response) => {
    const { amount, currency } = req.body;
    if (!amount)
      return res
        .status(400)
        .json({ success: false, message: "Amount is required" });

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: currency || "INR",
    });

    res
      .status(200)
      .json({ success: true, orderId: order.id, amount: order.amount });
  }
);

export const generateOrder = handler(
  async (req: AuthRequest, res: Response) => {
    const { products, totalAmount, shippingAddress, paymentStatus, paymentId } =
      req.body;

    if (!products || !products.length || !totalAmount) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const order = await Order.create({
      user: req.user?._id,
      products,
      totalAmount,
      shippingAddress,
      paymentStatus: paymentStatus || "pending",
      paymentId,
    });

    res.status(201).json({ success: true, message: "Order created", order });
  }
);

export const getOrders = handler(async (req: AuthRequest, res: Response) => {
  const orders = await Order.find({ user: req.user?._id }).populate(
    "products.product"
  );
  res.status(200).json({ success: true, orders });
});

export const getOrderAdmin = handler(async (_req: Request, res: Response) => {
  const orders = await Order.find()
    .populate("user")
    .populate("products.product");
  res.status(200).json({ success: true, orders });
});

export const updateOrderStatus = handler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    res
      .status(200)
      .json({ success: true, message: "Order status updated", order });
  }
);

export const deleteOrder = handler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await Order.findByIdAndDelete(id);

  if (!order)
    return res.status(404).json({ success: false, message: "Order not found" });

  res
    .status(200)
    .json({ success: true, message: "Order deleted successfully" });
});
