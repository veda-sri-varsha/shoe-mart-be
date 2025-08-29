import { z } from "zod";

const orderProductSchema = z.object({
  productId: z.string().length(24, "Invalid productId"),
  count: z.number().min(1, "Count must be at least 1"),
  price: z.number().positive("Price must be positive"),
});


export const orderSchema = z.object({
  products: z.array(orderProductSchema).min(1, "At least one product is required"),
  address: z.string().min(5, "Address is required"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone must be 10 digits"), 
  amount: z.number().positive("Amount must be positive"),
  couponCode: z.string().optional(),
  status: z.enum(["ordered", "shipped", "completed", "cancelled"]).optional(),
});


export type OrderProductInput = z.infer<typeof orderProductSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
