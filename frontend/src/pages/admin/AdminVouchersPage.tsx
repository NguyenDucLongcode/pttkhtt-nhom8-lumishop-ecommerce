import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { vouchersApi } from '../../api/vouchers.api'
import { formatCurrency, formatDate } from '../../utils/format'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Modal } from '../../components/common/Modal'
import type { Voucher, CreateVoucherDto, DiscountType } from '../../types/voucher.types'

export const AdminVouchersPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)

  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [discountType, setDiscountType] = useState<DiscountType>('PERCENT')
  const [discountValue, setDiscountValue] = useState<number>(10)
  const [minOrderValue, setMinOrderValue] = useState<number>(0)
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number>(0)
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState(new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10))
  const [usageLimit, setUsageLimit] = useState<number>(100)
  const [isActive, setIsActive] = useState(true)
  const [formError, setFormError] = useState('')

  const { data: vouchersData, isLoading } = useQuery({
    queryKey: ['admin-vouchers'],
    queryFn: () => vouchersApi.getAll(),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: { id?: string; data: CreateVoucherDto }) => {
      if (payload.id) {
        return vouchersApi.update(payload.id, payload.data)
      }
      return vouchersApi.create(payload.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] })
      queryClient.invalidateQueries({ queryKey: ['home-vouchers'] })
      handleCloseModal()
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message
      setFormError(Array.isArray(msg) ? msg.join(', ') : msg || 'Không thể lưu voucher.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => vouchersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] })
    },
  })

  const handleOpenAdd = () => {
    setEditingVoucher(null)
    setCode('')
    setDescription('')
    setDiscountType('PERCENT')
    setDiscountValue(10)
    setMinOrderValue(200000)
    setMaxDiscountAmount(50000)
    setStartDate(new Date().toISOString().slice(0, 10))
    setEndDate(new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10))
    setUsageLimit(100)
    setIsActive(true)
    setFormError('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (v: Voucher) => {
    setEditingVoucher(v)
    setCode(v.code)
    setDescription(v.description)
    setDiscountType(v.discountType)
    setDiscountValue(v.discountValue)
    setMinOrderValue(v.minOrderValue || 0)
    setMaxDiscountAmount(v.maxDiscountAmount || 0)
    setStartDate(v.startDate?.slice(0, 10) || new Date().toISOString().slice(0, 10))
    setEndDate(v.endDate?.slice(0, 10) || new Date().toISOString().slice(0, 10))
    setUsageLimit(v.usageLimit || 100)
    setIsActive(v.isActive)
    setFormError('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingVoucher(null)
    setFormError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      setFormError('Mã voucher không được để trống.')
      return
    }

    const payload: CreateVoucherDto = {
      code: code.trim().toUpperCase(),
      description: description.trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue) || undefined,
      maxDiscountAmount: discountType === 'PERCENT' && Number(maxDiscountAmount) > 0 ? Number(maxDiscountAmount) : undefined,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      usageLimit: Number(usageLimit) || undefined,
      isActive,
    }

    saveMutation.mutate({ id: editingVoucher?.id, data: payload })
  }

  const vouchersList = vouchersData?.data || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            Quản Lý Mã Giảm Giá (Vouchers)
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Thiết lập các chương trình khuyến mãi theo % hoặc số tiền cố định
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="self-start sm:self-auto bg-neutral-950 hover:bg-[#c59b27] hover:text-black text-white font-semibold text-xs"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Tạo Mã Mới</span>
        </Button>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-500">Đang tải danh sách voucher...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase text-[10px] tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="px-5 py-3">Mã Code</th>
                  <th className="px-5 py-3">Mô Tả & Ưu Đãi</th>
                  <th className="px-5 py-3">Điều Kiện Đơn</th>
                  <th className="px-5 py-3">Hạn Dùng</th>
                  <th className="px-5 py-3">Đã Dùng / Giới Hạn</th>
                  <th className="px-5 py-3">Trạng Thái</th>
                  <th className="px-5 py-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium text-neutral-800">
                {vouchersList.map((v) => (
                  <tr key={v.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="font-mono font-bold text-xs bg-neutral-100 text-neutral-900 px-2 py-0.5 rounded border border-neutral-200">
                        {v.code}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-bold text-neutral-900">
                        {v.discountType === 'PERCENT' ? `Giảm ${v.discountValue}%` : `Giảm ${formatCurrency(v.discountValue)}`}
                      </p>
                      <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">{v.description}</p>
                    </td>
                    <td className="px-5 py-3 text-neutral-600">
                      Từ {formatCurrency(v.minOrderValue || 0)}
                    </td>
                    <td className="px-5 py-3 text-neutral-500 font-mono text-[11px]">
                      {formatDate(v.endDate)}
                    </td>
                    <td className="px-5 py-3 text-neutral-700">
                      {v.usedCount ?? 0} / {v.usageLimit ?? '∞'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        v.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                      }`}>
                        {v.isActive ? 'Hoạt Động' : 'Đã Khóa'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(v)}
                        className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn muốn xóa voucher ${v.code}?`)) {
                            deleteMutation.mutate(v.id)
                          }
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingVoucher ? `Sửa Voucher: ${editingVoucher.code}` : 'Tạo Voucher Mới'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mã Code Voucher (*)"
              placeholder="vd: LUMI20"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            />
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-neutral-800">Loại giảm giá</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                className="h-9 px-3 bg-white border border-neutral-200 rounded-md focus:border-[#c59b27] text-xs"
              >
                <option value="PERCENT">Theo phần trăm (%)</option>
                <option value="FIXED">Số tiền cố định (VNĐ)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={discountType === 'PERCENT' ? 'Phần trăm giảm (%) (*)' : 'Số tiền giảm (VNĐ) (*)'}
              type="number"
              min="1"
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              required
            />
            <Input
              label="Đơn hàng tối thiểu (VNĐ)"
              type="number"
              min="0"
              step="10000"
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(Number(e.target.value))}
            />
          </div>

          {discountType === 'PERCENT' && (
            <Input
              label="Số tiền giảm tối đa (VNĐ) — Tùy chọn"
              type="number"
              min="0"
              step="10000"
              value={maxDiscountAmount}
              onChange={(e) => setMaxDiscountAmount(Number(e.target.value))}
              hint="Để 0 nếu không giới hạn mức giảm tối đa"
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ngày bắt đầu"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="Ngày kết thúc"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <Input
              label="Tổng lượt sử dụng"
              type="number"
              min="1"
              value={usageLimit}
              onChange={(e) => setUsageLimit(Number(e.target.value))}
            />
            <label className="flex items-center gap-2 pt-4 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
              <span className="font-semibold text-neutral-800">Đang kích hoạt voucher</span>
            </label>
          </div>

          <Input
            label="Mô tả ưu đãi"
            placeholder="vd: Giảm 20% cho đơn hàng đầu tiên từ 300.000đ"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          {formError && (
            <p className="text-red-600 font-semibold">{formError}</p>
          )}

          <div className="pt-2 flex justify-end gap-2 border-t border-neutral-100">
            <Button type="button" variant="outline" size="sm" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={saveMutation.isPending}
              className="bg-neutral-950 hover:bg-[#c59b27] hover:text-black text-white"
            >
              {editingVoucher ? 'Cập Nhật' : 'Tạo Voucher'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
