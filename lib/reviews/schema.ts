import { z } from 'zod'

export const REVIEW_SORTS = ['recency', 'rating_high', 'rating_low'] as const
export type ReviewSort = (typeof REVIEW_SORTS)[number]

export const reviewSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  productId: z.string(),
  userName: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
})
export type Review = z.infer<typeof reviewSchema>

export const reviewListResponseSchema = z.object({
  reviews: z.array(reviewSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})
export type ReviewListResponse = z.infer<typeof reviewListResponseSchema>

export const createdReviewSchema = z.object({
  review: reviewSchema,
})

export const createReviewInputSchema = z.object({
  rating: z.number().int().min(1, 'Select a rating.').max(5),
  comment: z.string().trim().min(3, 'Review must be at least 3 characters.').max(1000),
})
export type CreateReviewInput = z.infer<typeof createReviewInputSchema>
