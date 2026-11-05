import { z } from "zod";

/** Pakistani mobile numbers: 03XXXXXXXXX, +923XXXXXXXXX, 923XXXXXXXXX. */
export const pkPhoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine((v) => /^(\+92|92|0)3\d{9}$/.test(v), "Enter a valid Pakistani mobile number (e.g. 0300 1234567)")
  .transform((v) => {
    // Normalise to 03XXXXXXXXX
    if (v.startsWith("+92")) return "0" + v.slice(3);
    if (v.startsWith("92")) return "0" + v.slice(2);
    return v;
  });

export const checkoutItemSchema = z.object({
  variantId: z.string().min(1).max(64),
  quantity: z.number().int().min(1).max(50),
});

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: pkPhoneSchema,
  addressLine: z.string().trim().min(10, "Please enter your complete delivery address").max(300),
  city: z.string().trim().min(2, "Please enter your city").max(80),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  items: z.array(checkoutItemSchema).min(1, "Your cart is empty").max(50),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email().max(120),
  password: z.string().min(8).max(200),
});

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers and hyphens");

export const variantInputSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(1).max(30),
  weightGrams: z.number().int().min(1).max(100000),
  priceRupees: z.number().min(1).max(1_000_000),
  stock: z.number().int().min(0).max(100000),
  sku: z.string().trim().max(60).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const imageInputSchema = z.object({
  id: z.string().optional(),
  url: z.string().trim().min(1).max(500),
  alt: z.string().trim().max(200).default(""),
  sortOrder: z.number().int().default(0),
});

export const productInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: slugSchema,
  shortDescription: z.string().trim().min(5).max(200),
  description: z.string().trim().min(10).max(5000),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  variants: z.array(variantInputSchema).min(1, "Add at least one weight option"),
  images: z.array(imageInputSchema).default([]),
});
export type ProductInput = z.infer<typeof productInputSchema>;

export const orderStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

export const orderStatusUpdateSchema = z.object({
  status: orderStatusSchema,
  note: z.string().trim().max(300).optional().or(z.literal("")),
});

export const reviewInputSchema = z.object({
  customerName: z.string().trim().min(2).max(80),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(10).max(1000),
  productId: z.string().optional().nullable(),
  isApproved: z.boolean().default(false),
});

export const orderListQuerySchema = z.object({
  status: orderStatusSchema.optional(),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
