import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { categoriesApi } from '../../api/categories.api'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Modal } from '../../components/common/Modal'
import type { Category, CreateCategoryDto } from '../../types/category.types'

export const AdminCategoriesPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const [tenDanhMuc, setTenDanhMuc] = useState('')
  const [moTa, setMoTa] = useState('')
  const [formError, setFormError] = useState('')

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => categoriesApi.getAll(),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: { id?: string; data: CreateCategoryDto }) => {
      if (payload.id) {
        return categoriesApi.update(payload.id, payload.data)
      }
      return categoriesApi.create(payload.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      handleCloseModal()
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message
      setFormError(Array.isArray(msg) ? msg.join(', ') : msg || 'Không thể lưu danh mục.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  const handleOpenAdd = () => {
    setEditingCategory(null)
    setTenDanhMuc('')
    setMoTa('')
    setFormError('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c)
    setTenDanhMuc(c.tenDanhMuc)
    setMoTa(c.moTa || '')
    setFormError('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
    setFormError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenDanhMuc.trim()) {
      setFormError('Tên danh mục không được để trống.')
      return
    }

    saveMutation.mutate({
      id: editingCategory?.id,
      data: { tenDanhMuc: tenDanhMuc.trim(), moTa: moTa.trim() || undefined },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            Quản Lý Danh Mục
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Phân loại các dòng sản phẩm đèn bàn & thiết bị chiếu sáng
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="self-start sm:self-auto bg-neutral-950 hover:bg-[#c59b27] hover:text-black text-white font-semibold text-xs"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Thêm Danh Mục</span>
        </Button>
      </div>

      {/* Categories Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-500">Đang tải danh mục...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase text-[10px] tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="px-5 py-3">Mã DM</th>
                  <th className="px-5 py-3">Tên Danh Mục</th>
                  <th className="px-5 py-3">Mô Tả Chi Tiết</th>
                  <th className="px-5 py-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium text-neutral-800">
                {categories?.map((cat) => (
                  <tr key={cat.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-neutral-950">
                      {cat.id}
                    </td>
                    <td className="px-5 py-3 font-bold text-neutral-900">
                      {cat.tenDanhMuc}
                    </td>
                    <td className="px-5 py-3 text-neutral-600 max-w-sm">
                      {cat.moTa || '—'}
                    </td>
                    <td className="px-5 py-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa danh mục ${cat.tenDanhMuc}?`)) {
                            deleteMutation.mutate(cat.id)
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
        title={editingCategory ? `Sửa Danh Mục: ${editingCategory.id}` : 'Thêm Danh Mục Mới'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <Input
            label="Tên danh mục (*)"
            placeholder="vd: Đèn thông minh"
            value={tenDanhMuc}
            onChange={(e) => setTenDanhMuc(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-neutral-800">Mô tả danh mục</label>
            <textarea
              rows={3}
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              placeholder="Mô tả công dụng và các dòng đèn thuộc danh mục này..."
              className="p-3 bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-[#c59b27] text-xs"
            />
          </div>

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
              {editingCategory ? 'Lưu Thay Đổi' : 'Tạo Danh Mục'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
