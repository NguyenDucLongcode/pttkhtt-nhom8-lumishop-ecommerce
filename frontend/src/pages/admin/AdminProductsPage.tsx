import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { productsApi } from '../../api/products.api'
import { categoriesApi } from '../../api/categories.api'
import { formatCurrency } from '../../utils/format'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Modal } from '../../components/common/Modal'
import { FallbackImage } from '../../components/common/FallbackImage'
import type { Product, CreateProductDto } from '../../types/product.types'

export const AdminProductsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Form State
  const [tenSP, setTenSP] = useState('')
  const [moTa, setMoTa] = useState('')
  const [giaBan, setGiaBan] = useState<number>(0)
  const [soLuongTon, setSoLuongTon] = useState<number>(0)
  const [hinhAnh, setHinhAnh] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [trangThai, setTrangThai] = useState<'DangBan' | 'NgungBan'>('DangBan')
  const [formError, setFormError] = useState('')

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => productsApi.getAll({ page, limit: 10, search: search || undefined }),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  })

  // Create or Update mutation
  const saveMutation = useMutation({
    mutationFn: (payload: { id?: string; data: CreateProductDto }) => {
      if (payload.id) {
        return productsApi.update(payload.id, payload.data)
      }
      return productsApi.create(payload.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      handleCloseModal()
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message
      setFormError(Array.isArray(msg) ? msg.join(', ') : msg || 'Không thể lưu sản phẩm.')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    },
  })

  const handleOpenAdd = () => {
    setEditingProduct(null)
    setTenSP('')
    setMoTa('')
    setGiaBan(100000)
    setSoLuongTon(10)
    setHinhAnh('')
    setCategoryId(categories?.[0]?.id || 'DM001')
    setTrangThai('DangBan')
    setFormError('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p)
    setTenSP(p.tenSP)
    setMoTa(p.moTa || '')
    setGiaBan(p.giaBan)
    setSoLuongTon(p.soLuongTon)
    setHinhAnh(p.hinhAnh || '')
    setCategoryId(p.categoryId || '')
    setTrangThai(p.trangThai)
    setFormError('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    setFormError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenSP.trim()) {
      setFormError('Tên sản phẩm không được để trống.')
      return
    }

    const payload: CreateProductDto = {
      tenSP: tenSP.trim(),
      moTa: moTa.trim(),
      giaBan: Number(giaBan),
      soLuongTon: Number(soLuongTon),
      hinhAnh: hinhAnh.trim() || undefined,
      categoryId: categoryId || undefined,
      trangThai,
    }

    saveMutation.mutate({ id: editingProduct?.id, data: payload })
  }

  const totalPages = productsData ? Math.ceil(productsData.total / productsData.limit) : 1

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            Quản Lý Sản Phẩm
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Tổng cộng {productsData?.total ?? 0} mã hàng đang lưu trữ trong hệ thống
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="self-start sm:self-auto bg-neutral-950 hover:bg-[#c59b27] hover:text-black text-white font-semibold text-xs"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Thêm Sản Phẩm Mới</span>
        </Button>
      </div>

      {/* Top Search Filter */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm hoặc mã SP..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full h-9 pl-9 pr-3 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:border-[#c59b27]"
          />
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-500">Đang tải danh sách sản phẩm...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase text-[10px] tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="px-5 py-3">Sản phẩm</th>
                  <th className="px-5 py-3">Danh mục</th>
                  <th className="px-5 py-3">Giá bán</th>
                  <th className="px-5 py-3">Tồn kho</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium text-neutral-800">
                {productsData?.data.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded border border-neutral-200 bg-neutral-100 overflow-hidden shrink-0">
                          <FallbackImage src={p.hinhAnh} alt={p.tenSP} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-mono text-[10px] text-neutral-400 block">{p.id}</span>
                          <span className="font-semibold text-neutral-900 line-clamp-1">{p.tenSP}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-neutral-600 font-mono text-[11px]">{p.categoryId || '—'}</td>
                    <td className="px-5 py-3 font-bold text-neutral-950">{formatCurrency(p.giaBan)}</td>
                    <td className="px-5 py-3">
                      <span className={`font-semibold ${p.soLuongTon <= 5 ? 'text-red-600' : 'text-neutral-800'}`}>
                        {p.soLuongTon}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.trangThai === 'DangBan'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                      }`}>
                        {p.trangThai === 'DangBan' ? 'Đang Bán' : 'Ngừng Bán'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn chắc chắn muốn xóa sản phẩm ${p.id}?`)) {
                            deleteMutation.mutate(p.id)
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-600">
            <span>Trang {page} / {totalPages}</span>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-2.5 py-1 border border-neutral-200 rounded disabled:opacity-40"
              >
                Trước
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-2.5 py-1 border border-neutral-200 rounded disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? `Sửa Sản Phẩm: ${editingProduct.id}` : 'Thêm Sản Phẩm Mới'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <Input
            label="Tên sản phẩm (*)"
            value={tenSP}
            onChange={(e) => setTenSP(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Giá bán (VNĐ) (*)"
              type="number"
              min="0"
              step="1000"
              value={giaBan}
              onChange={(e) => setGiaBan(Number(e.target.value))}
              required
            />
            <Input
              label="Số lượng tồn kho (*)"
              type="number"
              min="0"
              value={soLuongTon}
              onChange={(e) => setSoLuongTon(Number(e.target.value))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-neutral-800">Danh mục sản phẩm</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-9 px-3 bg-white border border-neutral-200 rounded-md focus:border-[#c59b27] text-xs"
              >
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>{c.tenDanhMuc} ({c.id})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-neutral-800">Trạng thái kinh doanh</label>
              <select
                value={trangThai}
                onChange={(e) => setTrangThai(e.target.value as any)}
                className="h-9 px-3 bg-white border border-neutral-200 rounded-md focus:border-[#c59b27] text-xs"
              >
                <option value="DangBan">Đang bán</option>
                <option value="NgungBan">Ngừng bán</option>
              </select>
            </div>
          </div>

          <Input
            label="Đường dẫn hình ảnh (URL)"
            placeholder="https://picsum.photos/seed/SP001/400/400"
            value={hinhAnh}
            onChange={(e) => setHinhAnh(e.target.value)}
          />

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-neutral-800">Mô tả chi tiết</label>
            <textarea
              rows={4}
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              placeholder="Thông số kỹ thuật, công suất bóng LED, nhiệt độ màu..."
              className="p-3 bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-[#c59b27] text-xs"
            />
          </div>

          {formError && (
            <p className="text-red-600 font-semibold">{formError}</p>
          )}

          <div className="pt-2 flex justify-end gap-2 border-t border-neutral-100">
            <Button type="button" variant="outline" size="sm" onClick={handleCloseModal}>
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={saveMutation.isPending}
              className="bg-neutral-950 hover:bg-[#c59b27] hover:text-black text-white"
            >
              {editingProduct ? 'Cập Nhật' : 'Tạo Mới'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
