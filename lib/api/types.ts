// Shapes mirror the backend response envelope exactly
// (../backend/src/libs/utils/apiResponse.ts). Note: `error.code` is a numeric
// HTTP-style code, not a string — aligned to the shipped backend, not the
// design doc's illustrative string codes.

export interface ApiMeta {
  total: number
  page: number
  limit: number
}

export interface ApiErrorBody {
  code: number
  message: string
}

export type ApiEnvelope<T> =
  | { success: true; data: T; error: null; meta?: ApiMeta }
  | { success: false; data: null; error: ApiErrorBody; meta?: undefined }

export interface ApiResult<T> {
  data: T
  meta?: ApiMeta
}
