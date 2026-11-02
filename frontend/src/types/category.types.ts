export interface Category {
  id: string
  tenDanhMuc: string
  moTa?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateCategoryDto {
  tenDanhMuc: string
  moTa?: string
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>
