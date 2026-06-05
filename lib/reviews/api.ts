import { z } from 'zod'

import { api } from '@/lib/api'

import {
  createdReviewSchema,
  reviewSchema,
  type CreateReviewInput,
  type Review,
  type ReviewListResponse,
  type ReviewSort,
} from './schema'

const withCredentials = { credentials: 'include' as const }

export async function getReviews(
  productId: string,
  options: { page?: number; limit?: number; sort?: ReviewSort } = {},
): Promise<ReviewListResponse> {
  // Backend returns data: Review[] with pagination in meta (same envelope pattern as orders).
  const result = await api.get<Review[]>(
    `/api/products/${encodeURIComponent(productId)}/reviews`,
    {
      query: {
        page: options.page,
        limit: options.limit,
        sort: options.sort,
      },
      schema: z.array(reviewSchema),
    },
  )
  return {
    reviews: result.data,
    total: result.meta?.total ?? 0,
    page: result.meta?.page ?? 1,
    limit: result.meta?.limit ?? options.limit ?? 20,
  }
}

export async function createReview(
  productId: string,
  input: CreateReviewInput,
): Promise<Review> {
  const { data } = await api.post<{ review: Review }>(
    `/api/products/${encodeURIComponent(productId)}/reviews`,
    input,
    { ...withCredentials, schema: createdReviewSchema },
  )
  return data.review
}

// The backend deletes the authenticated user's review for the product
// (one review per user — no reviewId needed in the URL).
export async function deleteReview(productId: string): Promise<void> {
  await api.del(
    `/api/products/${encodeURIComponent(productId)}/reviews`,
    withCredentials,
  )
}
