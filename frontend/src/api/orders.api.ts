import { apiClient } from './client'
import type {
  CreateOrderDto,
  Order,
  OrderStatus,
  RevenueReportResult,
} from '../types/order.types'

export const ordersApi = {
  checkout: (data: CreateOrderDto): Promise<Order> => {
    return apiClient.post('/orders/checkout', data)
  },

  getAll: (trangThai?: string): Promise<Order[]> => {
    const params: Record<string, string> = {}
    if (trangThai && trangThai !== 'ALL') params.trangThai = trangThai
    return apiClient.get('/orders', { params })
  },

  getRevenue: (): Promise<RevenueReportResult> => {
    return apiClient.get('/orders/revenue')
  },

  getHistory: (maKH: string): Promise<Order[]> => {
    return apiClient.get(`/orders/history/${maKH}`)
  },

  getById: (id: string): Promise<Order> => {
    return apiClient.get(`/orders/${id}`)
  },

  updateStatus: (id: string, trangThai: OrderStatus): Promise<Order> => {
    return apiClient.patch(`/orders/${id}/status`, { trangThai })
  },
}
