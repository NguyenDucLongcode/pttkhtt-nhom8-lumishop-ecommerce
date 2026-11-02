import { apiClient } from './client'
import type {
  CheckVoucherResult,
  CreateVoucherDto,
  PaginatedVouchersResult,
  QueryVoucherParams,
  UpdateVoucherDto,
  Voucher,
} from '../types/voucher.types'

export const vouchersApi = {
  getAll: (params?: QueryVoucherParams): Promise<PaginatedVouchersResult> => {
    const cleanParams: Record<string, any> = {}
    if (params?.page) cleanParams.page = params.page
    if (params?.limit) cleanParams.limit = params.limit
    if (params?.isActive !== undefined) cleanParams.isActive = params.isActive
    if (params?.code && params.code.trim()) cleanParams.code = params.code.trim()

    return apiClient.get('/vouchers', { params: cleanParams })
  },

  checkCode: (code: string): Promise<CheckVoucherResult> => {
    return apiClient.get(`/vouchers/check/${encodeURIComponent(code.trim().toUpperCase())}`)
  },

  getById: (id: string): Promise<Voucher> => {
    return apiClient.get(`/vouchers/${id}`)
  },

  create: (data: CreateVoucherDto): Promise<Voucher> => {
    return apiClient.post('/vouchers', data)
  },

  update: (id: string, data: UpdateVoucherDto): Promise<Voucher> => {
    return apiClient.patch(`/vouchers/${id}`, data)
  },

  delete: (
    id: string
  ): Promise<{ success: boolean; message: string; deleted: Voucher }> => {
    return apiClient.delete(`/vouchers/${id}`)
  },
}
