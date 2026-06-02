import { z } from 'zod'

export const PRODUCT_SORTS = ['NEWEST', 'PRICE_ASC', 'PRICE_DESC', 'RATING'] as const
export type ProductSort = (typeof PRODUCT_SORTS)[number]

export const PRODUCT_STATUSES = ['ACTIVE', 'PAUSE', 'DELETE'] as const
export type ProductStatus = (typeof PRODUCT_STATUSES)[number]

export const productImageSchema = z.object({
  url: z.string(),
  alt: z.string().optional(),
})
export type ProductImage = z.infer<typeof productImageSchema>

// Unknown backend keys (embedding, __v, etc.) are stripped by default.
export const productSchema = z.object({
  _id: z.string(),
  productName: z.string(),
  productDescription: z.string(),
  productCategory: z.string(),
  productTags: z.array(z.string()).default([]),
  productPrice: z.number(),
  productCurrency: z.string(),
  productStock: z.number(),
  productImages: z.array(productImageSchema).default([]),
  productAttributes: z.record(z.string(), z.unknown()).optional(),
  productStatus: z.enum(PRODUCT_STATUSES),
  productRatingAvg: z.number(),
  productRatingCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  // Present only when the request passes a `currency` param.
  currency: z.string().optional(),
  convertedPrice: z.number().optional(),
})
export type Product = z.infer<typeof productSchema>

export const productListSchema = z.array(productSchema)

// GET /api/products/:id nests the product under `product` (unlike the list
// endpoint, which returns the array directly).
export const productDetailSchema = z.object({ product: productSchema })
