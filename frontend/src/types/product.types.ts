export interface Product {
  id: string
  tenSP: string
  moTa: string
  giaBan: number
  soLuongTon: number
  hinhAnh: string
  categoryId?: string
  trangThai: 'DangBan' | 'NgungBan'
  createdAt?: string
  updatedAt?: string
}

export interface PaginatedProductsResult {
  data: Product[]
  total: number
  page: number
  limit: number
}

export interface QueryProductParams {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
}

export interface CreateProductDto {
  tenSP: string
  moTa: string
  giaBan: number
  soLuongTon: number
  hinhAnh?: string
  categoryId?: string
  trangThai?: 'DangBan' | 'NgungBan'
}

export type UpdateProductDto = Partial<CreateProductDto>
