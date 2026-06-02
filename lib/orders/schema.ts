import { z } from 'zod'

export const ORDER_STATUSES = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const PAYMENT_METHODS = ['COD', 'STRIPE'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_STATUSES = ['UNPAID', 'PAID', 'FAILED', 'REFUNDED'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const CURRENCIES = ['USD', 'KWD', 'UZS', 'EUR', 'GBP'] as const

export const orderItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  qty: z.number(),
  priceAtPurchase: z.number(),
})

export const orderSchema = z.object({
  _id: z.string(),
  userId: z.string().optional(),
  orderItems: z.array(orderItemSchema),
  orderTotal: z.number(),
  orderCurrency: z.string(),
  orderStatus: z.enum(ORDER_STATUSES),
  paymentMethod: z.enum(PAYMENT_METHODS),
  paymentStatus: z.enum(PAYMENT_STATUSES),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})
export type Order = z.infer<typeof orderSchema>

export const orderResponseSchema = z.object({ order: orderSchema })
export const orderListSchema = z.array(orderSchema)
