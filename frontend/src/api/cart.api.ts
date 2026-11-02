import { apiClient } from './client'
import type { CartItem } from '../context/CartContext'

export interface AddToCartDto {
  maSP: string
  soLuong: number
}

export interface UpdateCartQuantityDto {
  maSP: string
  soLuong: number
}

export const cartApi = {
  getCart: (): Promise<CartItem[]> => {
    return apiClient.get('/carts')
  },

  addToCart: (dto: AddToCartDto): Promise<CartItem[]> => {
    return apiClient.post('/carts/add', dto)
  },

  updateQuantity: (dto: UpdateCartQuantityDto): Promise<CartItem[]> => {
    return apiClient.patch('/carts/update', dto)
  },

  removeFromCart: (maSP: string): Promise<CartItem[]> => {
    return apiClient.delete(`/carts/remove/${maSP}`)
  },

  clearCart: (): Promise<CartItem[]> => {
    return apiClient.delete('/carts/clear')
  },
}
