import { api } from '@/lib/api'

import {
  orderListSchema,
  orderResponseSchema,
  type Order,
  type PaymentMethod,
} from './schema'

const withCredentials = { credentials: 'include' as const }

export interface CreateOrderInput {
  items: { productId: string; qty: number }[]
  currency?: string
  paymentMethod?: PaymentMethod
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const { data } = await api.post('/api/orders', input, {
    ...withCredentials,
    schema: orderResponseSchema,
  })
  return data.order
}

export async function getOrder(id: string): Promise<Order> {
  const { data } = await api.get(`/api/orders/${encodeURIComponent(id)}`, {
    ...withCredentials,
    schema: orderResponseSchema,
  })
  return data.order
}

export async function getMyOrders(): Promise<Order[]> {
  const { data } = await api.get('/api/orders', {
    ...withCredentials,
    schema: orderListSchema,
  })
  return data
}
