import { Request, Response } from "express";
import handler from "../services/handler";
import Order from "../models/order.schema";
import Razorpay from "razorpay";
import { AuthRequest } from "../middlewares/UserAuth";
import config from "../config";
import crypto from "crypto"; // for signature verification

const razorpay = new Razorpay({
  key_id: config.RAZORPAY_KEY,
  key_secret: config.RAZORPAY_SECRET,
});

// Generate Razorpay order ID
export const generateRazorPayOrderId = handler(
  async (req: AuthRequest, res: Response) => {
    const { amount, currency } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // amount in paise
      currency: currency || "INR",
    });

    res.status(200).json({ success: true, orderId: order.id, amount: order.amount });
  }
);

// Verify Razorpay payment
export const verifyPayment = handler(
  async (req: AuthRequest, res: Response) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, products, totalAmount, shippingAddress } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment details missing" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", config.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // Payment verified, create order
    const order = await Order.create({
      user: req.user?._id,
      products,
      totalAmount,
      shippingAddress,
      paymentStatus: "paid",
      paymentId: razorpay_payment_id,
    });

    res.status(201).json({ success: true, message: "Order created successfully", order });
  }
);

// Regular order creation (for COD or manual orders)
export const generateOrder = handler(
  async (req: AuthRequest, res: Response) => {
    const { products, totalAmount, shippingAddress, paymentStatus, paymentId } = req.body;

    if (!products || !products.length || !totalAmount) {
      return res.status(400).json({ success: false, message: "All fields are required" });
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
  const orders = await Order.find({ user: req.user?._id }).populate("products.product");
  res.status(200).json({ success: true, orders });
});

export const getOrderAdmin = handler(async (_req: Request, res: Response) => {
  const orders = await Order.find().populate("user").populate("products.product");
  res.status(200).json({ success: true, orders });
});

export const updateOrderStatus = handler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
  if (!order)
    return res.status(404).json({ success: false, message: "Order not found" });

  res.status(200).json({ success: true, message: "Order status updated", order });
});

export const deleteOrder = handler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await Order.findByIdAndDelete(id);

  if (!order)
    return res.status(404).json({ success: false, message: "Order not found" });

  res.status(200).json({ success: true, message: "Order deleted successfully" });
});
