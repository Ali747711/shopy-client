import { z } from 'zod'

import { orderSchema } from '@/lib/orders/schema'
import { PRODUCT_STATUSES } from '@/lib/products/schema'

// --- Dashboard stats (GET /api/admin/stats) ----------------------------
export const adminStatsSchema = z.object({
  totalOrders: z.number(),
  ordersByStatus: z.record(z.string(), z.number()),
  revenueByCurrency: z.record(z.string(), z.number()),
  totalProducts: z.number(),
  lowStockCount: z.number(),
  recentOrders: z.array(orderSchema),
})
export type AdminStats = z.infer<typeof adminStatsSchema>

export const adminStatsResponseSchema = z.object({ stats: adminStatsSchema })

// --- Product create / edit form ----------------------------------------
const imageInputSchema = z.object({
  url: z.string().url('Enter a valid image URL.'),
  alt: z.string().optional(),
})

export const productFormSchema = z.object({
  productName: z.string().trim().min(2, 'Name must be at least 2 characters.').max(200),
  productDescription: z.string().trim().min(1, 'Description is required.').max(5000),
  productCategory: z.string().trim().min(1, 'Category is required.'),
  productTags: z.array(z.string()).max(50).default([]),
  productPrice: z.number().nonnegative('Price cannot be negative.'),
  productStock: z.number().int().nonnegative('Stock cannot be negative.').default(0),
  productImages: z.array(imageInputSchema).max(10).default([]),
  productStatus: z.enum(PRODUCT_STATUSES).optional(),
})
export type ProductFormValues = z.infer<typeof productFormSchema>
