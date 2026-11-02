import { apiClient } from './client'
import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  SafeUser,
} from '../types/customer.types'

export const authApi = {
  login: (data: LoginDto): Promise<AuthResponse> => {
    return apiClient.post('/auth/login', data)
  },

  register: (data: RegisterDto): Promise<SafeUser> => {
    return apiClient.post('/auth/register', data)
  },

  refresh: (refreshToken: string): Promise<AuthResponse> => {
    return apiClient.post('/auth/refresh', { refreshToken })
  },

  logout: (refreshToken: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.post('/auth/logout', { refreshToken })
  },
}
