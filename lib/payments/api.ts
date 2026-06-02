import { z } from 'zod'

import { api } from '@/lib/api'

const withCredentials = { credentials: 'include' as const }

const paymentConfigSchema = z.object({
  enabled: z.boolean(),
  publishableKey: z.string().nullable(),
})
export type PaymentConfig = z.infer<typeof paymentConfigSchema>

const checkoutSessionSchema = z.object({
  url: z.string().nullable(),
  sessionId: z.string().optional(),
})

export async function getPaymentConfig(): Promise<PaymentConfig> {
  const { data } = await api.get('/api/payments/config', { schema: paymentConfigSchema })
  return data
}

export async function createCheckoutSession(orderId: string): Promise<{ url: string | null }> {
  const { data } = await api.post('/api/payments/checkout', { orderId }, {
    ...withCredentials,
    schema: checkoutSessionSchema,
  })
  return data
}
