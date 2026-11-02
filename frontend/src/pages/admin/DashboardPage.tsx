import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, ShoppingBag, Package, Users, DollarSign, Calendar } from 'lucide-react'
import { ordersApi } from '../../api/orders.api'
import { productsApi } from '../../api/products.api'
import { customersApi } from '../../api/customers.api'
import { formatCurrency, formatDate } from '../../utils/format'

export const DashboardPage: React.FC = () => {
  const { data: revenue, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: () => ordersApi.getRevenue(),
  })

  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => ordersApi.getAll(),
  })

  const { data: products } = useQuery({
    queryKey: ['admin-products-count'],
    queryFn: () => productsApi.getAll({ page: 1, limit: 1 }),
  })

  const { data: customers } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: () => customersApi.getAll(),
  })

  const stats = [
    {
      label: 'Tổng Doanh Thu Đã Thu',
      value: isLoadingRevenue ? '...' : formatCurrency(revenue?.totalRevenue ?? 0),
      icon: <DollarSign className="w-5 h-5 text-[#c59b27]" />,
      desc: `${revenue?.totalOrders ?? 0} đơn hàng thành công`,
      highlight: true,
    },
    {
      label: 'Tổng Số Đơn Hàng',
      value: orders ? String(Array.isArray(orders) ? orders.length : (orders as any).total ?? (orders as any).data?.length ?? 0) : '...',
      icon: <ShoppingBag className="w-5 h-5 text-neutral-700" />,
      desc: 'Bao gồm tất cả trạng thái',
      highlight: false,
    },
    {
      label: 'Tổng Sản Phẩm Kho',
      value: products ? String(products.total) : '...',
      icon: <Package className="w-5 h-5 text-neutral-700" />,
      desc: 'Số lượng SKU đang quản lý',
      highlight: false,
    },
    {
      label: 'Khách Hàng Đăng Ký',
      value: customers ? String(Array.isArray(customers) ? customers.length : (customers as any).total ?? (customers as any).data?.length ?? 0) : '...',
      icon: <Users className="w-5 h-5 text-neutral-700" />,
      desc: 'Tài khoản người dùng',
      highlight: false,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
          Báo Cáo Tổng Quan (Dashboard)
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Dữ liệu theo dõi thời gian thực từ hệ thống máy chủ LumiShop
        </p>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`p-5 rounded-xl border transition-all ${
              s.highlight
                ? 'bg-neutral-950 text-white border-neutral-900 shadow-md'
                : 'bg-white text-neutral-900 border-neutral-200/90 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${s.highlight ? 'text-[#c59b27]' : 'text-neutral-500'}`}>
                {s.label}
              </span>
              <div className={`p-2 rounded-lg ${s.highlight ? 'bg-neutral-900' : 'bg-neutral-100'}`}>
                {s.icon}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-2xl font-extrabold tracking-tight">
                {s.value}
              </p>
              <p className={`text-[11px] mt-1 font-medium ${s.highlight ? 'text-neutral-400' : 'text-neutral-500'}`}>
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Revenue Distribution Chart / Bars */}
      {revenue?.dailyRevenue && revenue.dailyRevenue.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#c59b27]" />
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
              Doanh Thu Theo Từng Ngày (Đơn Đã Giao)
            </h2>
          </div>

          <div className="space-y-3.5">
            {revenue.dailyRevenue.map((day: any) => {
              const maxVal = Math.max(...revenue.dailyRevenue.map((d: any) => d.revenue))
              const percentage = maxVal > 0 ? (day.revenue / maxVal) * 100 : 0

              return (
                <div key={day.date} className="flex items-center gap-4 text-xs">
                  <div className="w-24 text-neutral-500 font-mono shrink-0 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{formatDate(day.date)}</span>
                  </div>

                  <div className="flex-1 bg-neutral-100 rounded-md h-8 overflow-hidden relative">
                    <div
                      className="h-full bg-neutral-900 flex items-center px-3 text-white font-bold transition-all duration-300"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    >
                      {percentage > 25 && (
                        <span className="text-[11px] text-[#c59b27] whitespace-nowrap">
                          {formatCurrency(day.revenue)}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="w-28 text-right font-extrabold text-neutral-900 shrink-0">
                    {formatCurrency(day.revenue)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Orders Overview */}
      {orders && (Array.isArray(orders) ? orders : (orders as any).data || []).length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-neutral-100">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
              Đơn Hàng Gần Đây
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase text-[10px] tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="px-5 py-3">Mã Đơn</th>
                  <th className="px-5 py-3">Mã Khách Hàng</th>
                  <th className="px-5 py-3">Phương Thức</th>
                  <th className="px-5 py-3">Trạng Thái</th>
                  <th className="px-5 py-3 text-right">Tổng Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium text-neutral-800">
                {(Array.isArray(orders) ? orders : (orders as any).data || []).slice(0, 5).map((o: any) => (
                  <tr key={o.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-neutral-950">#{o.id}</td>
                    <td className="px-5 py-3">{o.maKH}</td>
                    <td className="px-5 py-3 text-neutral-600">{o.phuongThucTT}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-neutral-100 text-neutral-800">
                        {o.trangThai}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-extrabold text-neutral-950">
                      {formatCurrency(o.tongTien)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
