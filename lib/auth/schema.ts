import { z } from 'zod'

export const USER_ROLES = ['USER', 'ADMIN'] as const
export type UserRole = (typeof USER_ROLES)[number]

export const USER_STATUSES = ['ACTIVE', 'BLOCK', 'DELETE'] as const
export const PRICE_SENSITIVITIES = ['LOW', 'MEDIUM', 'HIGH'] as const

export const userPreferencesSchema = z.object({
  categories: z.array(z.string()).default([]),
  priceSensitivity: z.enum(PRICE_SENSITIVITIES).optional(),
})

// Sanitized user from the backend (no password / refresh tokens). Unknown keys
// are stripped by default.
export const authUserSchema = z.object({
  _id: z.string(),
  userName: z.string(),
  userEmail: z.string(),
  userRole: z.enum(USER_ROLES),
  userStatus: z.enum(USER_STATUSES).optional(),
  userPreferences: userPreferencesSchema.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})
export type AuthUser = z.infer<typeof authUserSchema>

// login / register return { user, accessToken, refreshToken }. Tokens are also
// set as httpOnly cookies, so we only consume `user`.
export const authResultSchema = z.object({
  user: authUserSchema,
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
})

export const meResponseSchema = z.object({ user: authUserSchema })

export const loginInputSchema = z.object({
  userEmail: z.email('Enter a valid email address.'),
  userPassword: z.string().min(1, 'Password is required.'),
})
export type LoginInput = z.infer<typeof loginInputSchema>

export const registerInputSchema = z.object({
  userName: z.string().trim().min(2, 'Name must be at least 2 characters.').max(60),
  userEmail: z.email('Enter a valid email address.'),
  userPassword: z.string().min(8, 'Password must be at least 8 characters.').max(100),
})
export type RegisterInput = z.infer<typeof registerInputSchema>
