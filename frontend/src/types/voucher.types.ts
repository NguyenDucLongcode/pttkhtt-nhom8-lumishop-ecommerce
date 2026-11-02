export type DiscountType = 'PERCENT' | 'FIXED'

export interface Voucher {
  id: string
  code: string
  description: string
  discountType: DiscountType
  discountValue: number
  minOrderValue?: number
  maxDiscountAmount?: number
  startDate: string
  endDate: string
  usageLimit?: number
  usedCount: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface PaginatedVouchersResult {
  data: Voucher[]
  total: number
  page: number
  limit: number
}

export interface QueryVoucherParams {
  page?: number
  limit?: number
  isActive?: boolean
  code?: string
}

export interface CheckVoucherResult {
  isValid: boolean
  message: string
  voucher: Voucher
}

export interface CreateVoucherDto {
  code: string
  description: string
  discountType: DiscountType
  discountValue: number
  minOrderValue?: number
  maxDiscountAmount?: number
  startDate: string
  endDate: string
  usageLimit?: number
  isActive?: boolean
}

export type UpdateVoucherDto = Partial<CreateVoucherDto>
