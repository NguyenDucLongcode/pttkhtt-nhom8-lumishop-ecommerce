export interface ApiResponseWrapper<T> {
  code: number
  message: string
  data: T
  timestamp: string
  path: string
}

export interface ApiErrorResponse {
  statusCode: number
  message: string | string[]
  error?: string
}
