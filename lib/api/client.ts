import type { ZodType } from 'zod'

import { ApiError } from './error'
import type { ApiEnvelope, ApiResult } from './types'

// Server-side (RSC, build) → call the backend directly via BACKEND_URL.
// Client-side (browser) → use relative URLs, proxied by Next.js rewrites.
const getBaseUrl = (): string =>
  typeof window === 'undefined'
    ? process.env.BACKEND_URL || 'http://localhost:4000'
    : ''

type QueryValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | ReadonlyArray<string | number>

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

export interface RequestOptions<T> {
  method?: HttpMethod
  /** JSON-serializable request body. */
  body?: unknown
  /** Query params; arrays expand to repeated keys, nullish values are dropped. */
  query?: Record<string, QueryValue>
  /** JWT access token → `Authorization: Bearer`. */
  token?: string
  /** Optional Zod schema to validate/parse the unwrapped `data`. */
  schema?: ZodType<T>
  signal?: AbortSignal
  /** Set `'include'` to send the httpOnly refresh cookie on auth calls. */
  credentials?: RequestCredentials
  /** Next.js fetch cache mode (defaults to uncached, per Next 16). */
  cache?: RequestCache
  /** Next.js revalidation / tagging options. */
  next?: NextFetchRequestConfig
  headers?: Record<string, string>
}

const buildQuery = (query?: Record<string, QueryValue>): string => {
  if (!query) return ''
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, String(item))
    } else {
      params.set(key, String(value))
    }
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

/**
 * Calls the Shopy backend, unwraps the `{ success, data, error, meta }`
 * envelope, and throws {@link ApiError} on any failure. Paths are relative
 * (e.g. `/api/products`) — Next.js rewrites proxy them to the backend.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions<T> = {},
): Promise<ApiResult<T>> {
  const {
    method = 'GET',
    body,
    query,
    token,
    schema,
    signal,
    credentials,
    cache,
    next,
    headers: extraHeaders,
  } = options

  const url = `${getBaseUrl()}${path}${buildQuery(query)}`

  const hasBody = body !== undefined && body !== null
  const headers: Record<string, string> = { Accept: 'application/json', ...extraHeaders }
  if (hasBody) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers,
      body: hasBody ? JSON.stringify(body) : undefined,
      signal,
      ...(credentials ? { credentials } : {}),
      ...(cache ? { cache } : {}),
      ...(next ? { next } : {}),
    })
  } catch (cause) {
    const aborted = cause instanceof DOMException && cause.name === 'AbortError'
    throw new ApiError(
      aborted
        ? 'Request was cancelled.'
        : 'Unable to reach the server. Check your connection and try again.',
      0,
      0,
    )
  }

  const text = await response.text()
  let payload: ApiEnvelope<T> | null = null
  if (text) {
    try {
      payload = JSON.parse(text) as ApiEnvelope<T>
    } catch {
      payload = null
    }
  }

  // Guard against non-enveloped responses (proxy errors, rate-limit HTML, 5xx).
  if (!payload || typeof payload.success !== 'boolean') {
    throw new ApiError(
      `Unexpected response from server (HTTP ${response.status}).`,
      response.status,
      response.status,
    )
  }

  if (!payload.success) {
    throw new ApiError(payload.error.message, payload.error.code, response.status)
  }

  const data = schema ? schema.parse(payload.data) : payload.data
  return { data, meta: payload.meta }
}

type BodylessOptions<T> = Omit<RequestOptions<T>, 'method' | 'body'>

export const api = {
  get: <T>(path: string, options?: BodylessOptions<T>) =>
    apiFetch<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: BodylessOptions<T>) =>
    apiFetch<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: BodylessOptions<T>) =>
    apiFetch<T>(path, { ...options, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, options?: BodylessOptions<T>) =>
    apiFetch<T>(path, { ...options, method: 'PUT', body }),
  del: <T>(path: string, options?: BodylessOptions<T>) =>
    apiFetch<T>(path, { ...options, method: 'DELETE' }),
} as const
