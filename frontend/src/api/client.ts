import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiResponseWrapper } from '../types/api.types'
import type { AuthResponse } from '../types/customer.types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Request Interceptor: Tự gắn Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('lumishop_access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Bóc tách `data` và tự động refresh token
apiClient.interceptors.response.use(
  (response) => {
    // Nếu backend bọc trong TransformInterceptor ({ code, message, data, ... })
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      'code' in response.data
    ) {
      const wrapped = response.data as ApiResponseWrapper<any>
      return wrapped.data
    }
    return response.data
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Tránh lặp vô hạn khi endpoint là refresh hoặc login
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
            }
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const currentRefreshToken = localStorage.getItem('lumishop_refresh_token')
      if (!currentRefreshToken) {
        localStorage.removeItem('lumishop_access_token')
        localStorage.removeItem('lumishop_user')
        isRefreshing = false
        return Promise.reject(error)
      }

      try {
        // Gọi refresh token trực tiếp qua axios gốc
        const res = await axios.post<ApiResponseWrapper<AuthResponse>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken: currentRefreshToken }
        )

        const authData = res.data.data
        localStorage.setItem('lumishop_access_token', authData.access_token)
        localStorage.setItem('lumishop_refresh_token', authData.refresh_token)
        localStorage.setItem('lumishop_user', JSON.stringify(authData.user))

        processQueue(null, authData.access_token)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${authData.access_token}`
        }
        return apiClient(originalRequest)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        localStorage.removeItem('lumishop_access_token')
        localStorage.removeItem('lumishop_refresh_token')
        localStorage.removeItem('lumishop_user')
        window.dispatchEvent(new Event('lumishop_auth_expired'))
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
