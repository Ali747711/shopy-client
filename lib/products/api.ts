import { api, type ApiResult } from '@/lib/api'

import {
  productDetailSchema,
  productListSchema,
  type Product,
  type ProductSort,
} from './schema'

export interface ProductFilters {
  page?: number
  limit?: number
  category?: string
  tags?: string[]
  minPrice?: number
  maxPrice?: number
  search?: string
  sort?: ProductSort
  currency?: string
}

export async function getProducts(
  filters: ProductFilters = {},
): Promise<ApiResult<Product[]>> {
  const { tags, ...rest } = filters
  return api.get<Product[]>('/api/products', {
    query: {
      ...rest,
      // Backend splits `tags` on ",", so it must be a comma-joined string.
      tags: tags && tags.length > 0 ? tags.join(',') : undefined,
    },
    schema: productListSchema,
  })
}

export async function getProduct(id: string, currency?: string): Promise<Product> {
  const { data } = await api.get<{ product: Product }>(
    `/api/products/${encodeURIComponent(id)}`,
    { query: { currency }, schema: productDetailSchema },
  )
  return data.product
}

// No dedicated categories/facets endpoint exists yet, so derive the option list
// from the catalog. Fine at the current catalog size; revisit if it grows.
export async function getCategories(): Promise<string[]> {
  const { data } = await getProducts({ limit: 100 })
  return Array.from(new Set(data.map((product) => product.productCategory))).sort()
}
