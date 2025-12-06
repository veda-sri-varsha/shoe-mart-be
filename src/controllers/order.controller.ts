import { Request, Response } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../models/order.schema";
import handler from "../services/handler";
import { AuthRequest } from "../middlewares/UserAuth";
import config from "../config";

const razorpay = new Razorpay({
  key_id: config.RAZORPAY_KEY, 
  key_secret: config.RAZORPAY_SECRET,
});

export const generateRazorPayOrderId = handler(
  async (req: AuthRequest, res: Response) => {
    const { amount, currency } = req.body;

    if (!amount) {
      return res
        .status(400)
        .json({ success: false, message: "Amount is required" });
    }

    const options = {
      amount: amount * 100, // in paise
      currency: currency || "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  }
);


export const verifyPayment = handler(
  async (req: AuthRequest, res: Response) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay payment details",
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", config.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    await Order.findOneAndUpdate(
      { transactionId: razorpay_order_id },
      {
        status: "completed",
        transactionId: razorpay_payment_id,
      }
    );

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  }
);

export const generateOrder = handler(
  async (req: AuthRequest, res: Response) => {
    const { products, totalAmount, shippingAddress } = req.body;

    if (!products || !products.length || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Products and amount are required",
      });
    }

    const order = await Order.create({
      user: req.user?._id,
      products,
      totalAmount,
      shippingAddress,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Order created",
      order,
    });
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
    .populate("products.productId");
  res.status(200).json({ success: true, orders });
});

export const updateOrderStatus = handler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Order status updated", order });
  }
);

// ===================== Delete Order =====================
export const deleteOrder = handler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await Order.findByIdAndDelete(id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res
    .status(200)
    .json({ success: true, message: "Order deleted successfully" });
});
