import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2).max(120),
  price: z.number().positive().max(999999),
  description: z.string().optional(),
  category: z.string().min(1),
  stock: z.number().min(0).default(0),
  collectionId: z.string().length(24),
  images: z
    .array(z.object({ url: z.url(), public_id: z.string().min(1) }))
    .min(1),
  ratings: z.number().min(0).max(5).default(0),
  sold: z.number().min(0).default(0),
});

export type ProductInput = z.infer<typeof productSchema>;
