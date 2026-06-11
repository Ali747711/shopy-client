import { z } from 'zod'

export const searchIntentSchema = z.object({
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  tags: z.array(z.string()).optional(),
  attributes: z.array(z.string()).optional(),
  keywords: z.string().optional(),
})
export type SearchIntent = z.infer<typeof searchIntentSchema>

const scoredProductImageSchema = z.object({
  url: z.string(),
  alt: z.string().optional(),
})

// The AI search endpoint returns a slimmer product than the catalog list.
export const scoredProductSchema = z.object({
  _id: z.string(),
  productName: z.string(),
  productDescription: z.string(),
  productCategory: z.string(),
  productPrice: z.number(),
  productCurrency: z.string(),
  productTags: z.array(z.string()).default([]),
  productImages: z.array(scoredProductImageSchema).default([]),
  score: z.number(),
})
export type ScoredProduct = z.infer<typeof scoredProductSchema>

export const aiSearchMetaSchema = z.object({
  intent: searchIntentSchema,
  products: z.array(scoredProductSchema),
  degraded: z.boolean(),
  cached: z.boolean(),
})
export type AiSearchMeta = z.infer<typeof aiSearchMetaSchema>

export const aiSearchDoneSchema = z.object({
  explanation: z.string(),
  cached: z.boolean(),
})
export type AiSearchDone = z.infer<typeof aiSearchDoneSchema>
