import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Shield, User as UserIcon } from 'lucide-react'
import { customersApi } from '../../api/customers.api'

export const AdminCustomersPage: React.FC = () => {
  const [search, setSearch] = useState('')

  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: () => customersApi.getAll(),
  })

  const filtered = useMemo(() => {
    const list = Array.isArray(customers) ? customers : []
    return list.filter((c: any) =>
      !search ||
      c.hoTen?.toLowerCase().includes(search.toLowerCase()) ||
      c.tenDangNhap?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    )
  }, [customers, search])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
          Quản Lý Khách Hàng
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Danh sách người dùng và tài khoản quản trị viên trong cơ sở dữ liệu
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, username hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:border-[#c59b27]"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-500">Đang tải danh sách người dùng...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase text-[10px] tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="px-5 py-3">Mã KH</th>
                  <th className="px-5 py-3">Họ và Tên</th>
                  <th className="px-5 py-3">Tài Khoản</th>
                  <th className="px-5 py-3">Email Liên Hệ</th>
                  <th className="px-5 py-3">Số Điện Thoại</th>
                  <th className="px-5 py-3">Địa Chỉ Giao Hàng</th>
                  <th className="px-5 py-3 text-right">Vai Trò</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium text-neutral-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-neutral-400">
                      Không tìm thấy khách hàng nào phù hợp
                    </td>
                  </tr>
                ) : (
                  filtered.map((c: any) => (
                    <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-neutral-950">
                        {c.id}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-neutral-900 text-[#c59b27] flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                            {(c.hoTen || 'U').charAt(0)}
                          </div>
                          <span className="font-bold text-neutral-900">{c.hoTen}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-[11px] text-neutral-600">
                        {c.tenDangNhap}
                      </td>
                      <td className="px-5 py-3 text-neutral-600">{c.email || '—'}</td>
                      <td className="px-5 py-3 text-neutral-600 font-mono text-[11px]">{c.sdt || '—'}</td>
                      <td className="px-5 py-3 text-neutral-600 max-w-xs truncate" title={c.diaChi}>
                        {c.diaChi || '—'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                            c.role === 'admin'
                              ? 'bg-[#faf5e8] text-[#c59b27] border-[#e6d3a3]'
                              : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                          }`}
                        >
                          {c.role === 'admin' ? (
                            <>
                              <Shield className="w-3 h-3 text-[#c59b27]" />
                              <span>Admin</span>
                            </>
                          ) : (
                            <>
                              <UserIcon className="w-3 h-3 text-neutral-400" />
                              <span>Khách Hàng</span>
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
