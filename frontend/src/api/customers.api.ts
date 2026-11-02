import { apiClient } from './client'
import type {
  CreateCustomerDto,
  SafeCustomer,
  UpdateCustomerDto,
} from '../types/customer.types'

export const customersApi = {
  getAll: (search?: string): Promise<SafeCustomer[]> => {
    const params: Record<string, string> = {}
    if (search && search.trim()) params.search = search.trim()
    return apiClient.get('/customers', { params })
  },

  getById: (id: string): Promise<SafeCustomer> => {
    return apiClient.get(`/customers/${id}`)
  },

  create: (data: CreateCustomerDto): Promise<SafeCustomer> => {
    return apiClient.post('/customers', data)
  },

  update: (id: string, data: UpdateCustomerDto): Promise<SafeCustomer> => {
    return apiClient.patch(`/customers/${id}`, data)
  },

  delete: (
    id: string
  ): Promise<{ success: boolean; message: string; deleted: SafeCustomer }> => {
    return apiClient.delete(`/customers/${id}`)
  },
}
