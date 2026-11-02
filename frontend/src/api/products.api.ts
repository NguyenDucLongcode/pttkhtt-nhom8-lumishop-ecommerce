import { apiClient } from './client'
import type {
  CreateProductDto,
  PaginatedProductsResult,
  Product,
  QueryProductParams,
  UpdateProductDto,
} from '../types/product.types'

export const productsApi = {
  getAll: (params?: QueryProductParams): Promise<PaginatedProductsResult> => {
    // Chỉ gửi các param backend cho phép trong QueryProductDto để tránh 400 Bad Request
    const cleanParams: Record<string, any> = {}
    if (params?.page) cleanParams.page = params.page
    if (params?.limit) cleanParams.limit = params.limit
    if (params?.search && params.search.trim()) cleanParams.search = params.search.trim()
    if (params?.categoryId && params.categoryId.trim()) cleanParams.categoryId = params.categoryId.trim()

    return apiClient.get('/products', { params: cleanParams })
  },

  getById: (id: string): Promise<Product> => {
    return apiClient.get(`/products/${id}`)
  },

  getRecommendations: (id: string): Promise<Product[]> => {
    return apiClient.get(`/products/${id}/recommendations`)
  },

  create: (data: CreateProductDto): Promise<Product> => {
    return apiClient.post('/products', data)
  },

  update: (id: string, data: UpdateProductDto): Promise<Product> => {
    return apiClient.patch(`/products/${id}`, data)
  },

  delete: (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/products/${id}`)
  },
}
