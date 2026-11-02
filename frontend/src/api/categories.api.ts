import { apiClient } from './client'
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../types/category.types'

export const categoriesApi = {
  getAll: (search?: string): Promise<Category[]> => {
    const params: Record<string, string> = {}
    if (search && search.trim()) params.search = search.trim()
    return apiClient.get('/categories', { params })
  },

  getById: (id: string): Promise<Category> => {
    return apiClient.get(`/categories/${id}`)
  },

  create: (data: CreateCategoryDto): Promise<Category> => {
    return apiClient.post('/categories', data)
  },

  update: (id: string, data: UpdateCategoryDto): Promise<Category> => {
    return apiClient.patch(`/categories/${id}`, data)
  },

  delete: (
    id: string
  ): Promise<{ success: boolean; message: string; deleted: Category }> => {
    return apiClient.delete(`/categories/${id}`)
  },
}
