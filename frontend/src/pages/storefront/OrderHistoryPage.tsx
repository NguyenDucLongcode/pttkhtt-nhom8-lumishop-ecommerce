import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Package, Clock, CheckCircle2, Truck, XCircle, RotateCcw } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ordersApi } from '../../api/orders.api'
import { formatCurrency, formatDate } from '../../utils/format'

const STATUS_CONFIG: Record<string, { label: string; colorClass: string; icon: React.ReactNode }> = {
  ChoXacNhan: { label: 'Chờ xác nhận', colorClass: 'bg-neutral-100 text-neutral-800 border-neutral-200', icon: <Clock className="w-3.5 h-3.5" /> },
  DangChuanBi: { label: 'Đang chuẩn bị hàng', colorClass: 'bg-[#faf5e8] text-[#c59b27] border-[#e6d3a3]', icon: <RotateCcw className="w-3.5 h-3.5" /> },
  DangGiao: { label: 'Đang vận chuyển', colorClass: 'bg-blue-50 text-blue-700 border-blue-200', icon: <Truck className="w-3.5 h-3.5" /> },
  DaGiao: { label: 'Giao hàng thành công', colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  DaHuy: { label: 'Đã hủy đơn', colorClass: 'bg-red-50 text-red-700 border-red-200', icon: <XCircle className="w-3.5 h-3.5" /> },
}

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  COD: 'Thanh toán tiền mặt khi nhận hàng (COD)',
  ChuyenKhoan: 'Chuyển khoản VietQR',
  ViDienTu: 'Ví điện tử',
}

export const OrderHistoryPage: React.FC = () => {
  const { user } = useAuth()

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['orders-history', user?.id],
    queryFn: () => ordersApi.getHistory(user!.id),
    enabled: !!user?.id,
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
          Lịch Sử Đơn Hàng
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Theo dõi trạng thái tiến độ xử lý và thông tin các đơn hàng đã mua
        </p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-xl border border-neutral-200 animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="border border-red-200 bg-red-50 p-8 text-center rounded-xl text-xs text-red-600 font-medium">
          Không thể tải lịch sử đơn hàng từ máy chủ. Vui lòng thử lại sau.
        </div>
      )}

      {!isLoading && !isError && (!orders || orders.length === 0) && (
        <div className="border border-neutral-200 bg-white p-16 text-center rounded-xl space-y-4 shadow-xs">
          <Package className="w-12 h-12 text-neutral-300 mx-auto" />
          <div>
            <p className="text-sm font-semibold text-neutral-800">
              Bạn chưa có đơn hàng nào
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Hãy khám phá các thiết bị thông minh, đồ gia dụng và phụ kiện tiện ích của LumiShop.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-950 text-white hover:bg-[#c59b27] hover:text-black text-xs font-semibold rounded-md transition-colors"
          >
            Mua sắm ngay
          </Link>
        </div>
      )}

      {!isLoading && !isError && orders && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_CONFIG[order.trangThai] || {
              label: order.trangThai,
              colorClass: 'bg-neutral-100 text-neutral-700 border-neutral-200',
              icon: null,
            }

            return (
              <div
                key={order.id}
                className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-xs hover:border-[#c59b27]/70 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs text-neutral-950">
                      #{order.id}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded border ${status.colorClass}`}
                    >
                      {status.icon}
                      {status.label}
                    </span>
                  </div>

                  <span className="text-[11px] text-neutral-400">
                    Ngày đặt: {formatDate(order.ngayTao || order.createdAt)}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-neutral-600">
                  <p>
                    <span className="text-neutral-400">Địa chỉ giao hàng:</span>{' '}
                    <strong className="text-neutral-800 font-medium">{order.diaChiGiao}</strong>
                  </p>
                  <p>
                    <span className="text-neutral-400">Hình thức thanh toán:</span>{' '}
                    <strong className="text-neutral-800 font-medium">{PAYMENT_METHOD_LABEL[order.phuongThucTT] || order.phuongThucTT}</strong>
                  </p>
                </div>

                {/* Items summary */}
                {order.items && order.items.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {order.items.map((it: any, idx: number) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-neutral-100 text-neutral-800 px-2 py-1 rounded"
                      >
                        {it.tenSP || it.maSP} × {it.soLuong}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Tổng thanh toán:</span>
                  <span className="text-base font-extrabold text-neutral-950">
                    {formatCurrency(order.tongTien)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
