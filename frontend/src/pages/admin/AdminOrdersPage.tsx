import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, RefreshCw, Eye } from 'lucide-react'
import { ordersApi } from '../../api/orders.api'
import { formatCurrency, formatDate } from '../../utils/format'
import { Modal } from '../../components/common/Modal'
import type { OrderStatus, Order } from '../../types/order.types'

const STATUS_OPTIONS: OrderStatus[] = ['ChoXacNhan', 'DangChuanBi', 'DangGiao', 'DaGiao', 'DaHuy']

const STATUS_LABELS: Record<OrderStatus, { label: string; badgeClass: string }> = {
  ChoXacNhan: { label: 'Chờ xác nhận', badgeClass: 'bg-neutral-100 text-neutral-800 border-neutral-200' },
  DangChuanBi: { label: 'Đang chuẩn bị', badgeClass: 'bg-[#faf5e8] text-[#c59b27] border-[#e6d3a3]' },
  DangGiao: { label: 'Đang giao hàng', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  DaGiao: { label: 'Đã giao thành công', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  DaHuy: { label: 'Đã hủy đơn', badgeClass: 'bg-red-50 text-red-700 border-red-200' },
}

export const AdminOrdersPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => ordersApi.getAll(),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, trangThai }: { id: string; trangThai: OrderStatus }) =>
      ordersApi.updateStatus(id, trangThai),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-revenue'] })
      setUpdatingId(null)
    },
    onError: () => {
      setUpdatingId(null)
    },
  })

  const filteredOrders = useMemo(() => {
    const list = Array.isArray(orders) ? orders : (orders as any)?.data || []
    return list.filter((o: any) => {
      const matchSearch =
        !search ||
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.maKH.toLowerCase().includes(search.toLowerCase())
      const matchStatus = !statusFilter || o.trangThai === statusFilter
      return matchSearch && matchStatus
    })
  }, [orders, search, statusFilter])

  const handleStatusChange = (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingId(orderId)
    updateStatusMutation.mutate({ id: orderId, trangThai: nextStatus })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
          Quản Lý Đơn Hàng
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Theo dõi và xử lý tiến trình giao hàng cho khách
        </p>
      </div>

      {/* Filter Row */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn hoặc mã KH..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:border-[#c59b27]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto h-9 px-3 text-xs bg-white border border-neutral-200 rounded-md focus:border-[#c59b27]"
        >
          <option value="">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map((st) => (
            <option key={st} value={st}>
              {STATUS_LABELS[st].label}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-500">Đang tải danh sách đơn hàng...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase text-[10px] tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="px-5 py-3">Mã đơn</th>
                  <th className="px-5 py-3">Khách hàng</th>
                  <th className="px-5 py-3">Địa chỉ giao</th>
                  <th className="px-5 py-3">Hình thức</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3">Tổng tiền</th>
                  <th className="px-5 py-3 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium text-neutral-800">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-neutral-400">
                      Không tìm thấy đơn hàng nào phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o: any) => {
                    const statusConfig = STATUS_LABELS[o.trangThai as OrderStatus] || {
                      label: o.trangThai,
                      badgeClass: 'bg-neutral-100 text-neutral-700',
                    }

                    return (
                      <tr key={o.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-5 py-3 font-mono font-bold text-neutral-950">
                          #{o.id}
                        </td>
                        <td className="px-5 py-3 font-mono text-[11px] text-neutral-600">
                          {o.maKH}
                        </td>
                        <td className="px-5 py-3 text-neutral-600 max-w-xs truncate" title={o.diaChiGiao}>
                          {o.diaChiGiao}
                        </td>
                        <td className="px-5 py-3 text-neutral-600">
                          {o.phuongThucTT}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <select
                              value={o.trangThai}
                              disabled={updatingId === o.id}
                              onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                              className={`h-7 px-2 text-[11px] font-bold rounded border cursor-pointer ${statusConfig.badgeClass}`}
                            >
                              {STATUS_OPTIONS.map((st) => (
                                <option key={st} value={st}>
                                  {STATUS_LABELS[st].label}
                                </option>
                              ))}
                            </select>
                            {updatingId === o.id && (
                              <RefreshCw className="w-3 h-3 animate-spin text-[#c59b27]" />
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3 font-extrabold text-neutral-950">
                          {formatCurrency(o.tongTien)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded transition-colors cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Chi Tiết Đơn Hàng: #${selectedOrder.id}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-neutral-50 p-3.5 rounded-lg border border-neutral-200/80 space-y-1.5">
              <p><span className="text-neutral-500">Mã Khách Hàng:</span> <strong>{selectedOrder.maKH}</strong></p>
              <p><span className="text-neutral-500">Địa chỉ giao:</span> <strong>{selectedOrder.diaChiGiao}</strong></p>
              <p><span className="text-neutral-500">Phương thức TT:</span> <strong>{selectedOrder.phuongThucTT}</strong></p>
              <p><span className="text-neutral-500">Ngày tạo:</span> <strong>{formatDate(selectedOrder.ngayTao || selectedOrder.createdAt)}</strong></p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-neutral-700 text-[10px]">
                Danh Sách Sản Phẩm Trong Đơn
              </h4>
              <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-100 overflow-hidden">
                {selectedOrder.items?.map((it: any, i: number) => (
                  <div key={i} className="p-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-neutral-400 block">{it.maSP}</span>
                      <span className="font-semibold text-neutral-900">{it.tenSP || it.maSP}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-500">x{it.soLuong}</span>
                      {it.gia && <p className="font-bold text-neutral-900">{formatCurrency(it.gia * it.soLuong)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-sm font-extrabold text-neutral-950">
              <span>Tổng Tiền Thanh Toán:</span>
              <span>{formatCurrency(selectedOrder.tongTien)}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
