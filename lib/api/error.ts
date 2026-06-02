// Single error type thrown by the API client. `code` is the backend envelope
// error code; `status` is the HTTP response status. Both are 0 for
// network/transport failures where no response was received.
export class ApiError extends Error {
  readonly code: number
  readonly status: number

  constructor(message: string, code: number, status: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }

  get isNetworkError(): boolean {
    return this.status === 0
  }

  get isRateLimited(): boolean {
    return this.status === 429
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }
}

export const isApiError = (error: unknown): error is ApiError =>
  error instanceof ApiError
