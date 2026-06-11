import { api, type ApiResult } from '@/lib/api'
import {
  orderListSchema,
  orderResponseSchema,
  type Order,
  type OrderStatus,
} from '@/lib/orders/schema'
import {
  productListSchema,
  productDetailSchema,
  type Product,
  type ProductStatus,
} from '@/lib/products/schema'

import { adminStatsResponseSchema, type AdminStats, type ProductFormValues } from './schema'

const withCredentials = { credentials: 'include' as const }

// --- Dashboard ----------------------------------------------------------
export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await api.get('/api/admin/stats', {
    ...withCredentials,
    schema: adminStatsResponseSchema,
  })
  return data.stats
}

// --- Orders -------------------------------------------------------------
export interface AdminOrderFilters {
  page?: number
  limit?: number
  status?: OrderStatus
}

export async function getAllOrders(
  filters: AdminOrderFilters = {},
): Promise<ApiResult<Order[]>> {
  return api.get<Order[]>('/api/orders/admin', {
    ...withCredentials,
    query: { ...filters },
    schema: orderListSchema,
  })
}

export async function updateOrderStatus(
  id: string,
  orderStatus: OrderStatus,
): Promise<Order> {
  const { data } = await api.patch(
    `/api/orders/${encodeURIComponent(id)}/status`,
    { orderStatus },
    { ...withCredentials, schema: orderResponseSchema },
  )
  return data.order
}

// --- Products -----------------------------------------------------------
export interface AdminProductFilters {
  page?: number
  limit?: number
  search?: string
  category?: string
  status?: ProductStatus
}

export async function getAllProducts(
  filters: AdminProductFilters = {},
): Promise<ApiResult<Product[]>> {
  return api.get<Product[]>('/api/products/admin', {
    ...withCredentials,
    query: { ...filters },
    schema: productListSchema,
  })
}

export async function createProduct(input: ProductFormValues): Promise<Product> {
  const { data } = await api.post('/api/products', input, {
    ...withCredentials,
    schema: productDetailSchema,
  })
  return data.product
}

export async function updateProduct(
  id: string,
  input: Partial<ProductFormValues>,
): Promise<Product> {
  const { data } = await api.patch(
    `/api/products/${encodeURIComponent(id)}`,
    input,
    { ...withCredentials, schema: productDetailSchema },
  )
  return data.product
}

export async function deleteProduct(id: string): Promise<void> {
  await api.del(`/api/products/${encodeURIComponent(id)}`, withCredentials)
}
