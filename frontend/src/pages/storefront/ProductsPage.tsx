import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Filter, Search, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { productsApi } from '../../api/products.api'
import { categoriesApi } from '../../api/categories.api'
import { ProductCard } from '../../components/products/ProductCard'
import { ProductGridSkeleton } from '../../components/products/ProductGridSkeleton'
import { Button } from '../../components/common/Button'
import { cn } from '../../utils/cn'

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sortOption, setSortOption] = useState<'default' | 'price-asc' | 'price-desc' | 'name-asc'>('default')

  const page = Number(searchParams.get('page')) || 1
  const categoryId = searchParams.get('categoryId') || ''
  const search = searchParams.get('search') || ''

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  })

  // Fetch all products to count per category
  const { data: allProductsData } = useQuery({
    queryKey: ['products-all-count'],
    queryFn: () => productsApi.getAll({ limit: 100 }),
    staleTime: 1000 * 60 * 5,
  })

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    if (allProductsData?.data) {
      for (const p of allProductsData.data) {
        if (p.categoryId) {
          counts[p.categoryId] = (counts[p.categoryId] || 0) + 1
        }
      }
    }
    return counts
  }, [allProductsData])

  // Fetch products
  const {
    data: productsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['products', page, categoryId, search],
    queryFn: () =>
      productsApi.getAll({
        page,
        limit: 12,
        categoryId: categoryId || undefined,
        search: search || undefined,
      }),
  })

  // Client-side sorting on received page items
  const sortedProducts = useMemo(() => {
    if (!productsData?.data) return []
    const list = [...productsData.data]
    if (sortOption === 'price-asc') {
      list.sort((a, b) => a.giaBan - b.giaBan)
    } else if (sortOption === 'price-desc') {
      list.sort((a, b) => b.giaBan - a.giaBan)
    } else if (sortOption === 'name-asc') {
      list.sort((a, b) => a.tenSP.localeCompare(b.tenSP, 'vi'))
    }
    return list
  }, [productsData, sortOption])

  const handleCategorySelect = (id: string) => {
    const next = new URLSearchParams(searchParams)
    if (id === categoryId) {
      next.delete('categoryId')
    } else {
      next.set('categoryId', id)
    }
    next.set('page', '1')
    setSearchParams(next)
  }

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const val = (form.elements.namedItem('search') as HTMLInputElement).value.trim()
    const next = new URLSearchParams(searchParams)
    if (val) {
      next.set('search', val)
    } else {
      next.delete('search')
    }
    next.set('page', '1')
    setSearchParams(next)
  }

  const handleResetFilters = () => {
    setSearchParams({})
    setSortOption('default')
  }

  const totalPages = productsData ? Math.ceil(productsData.total / productsData.limit) : 1

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header Section */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">Tất Cả Sản Phẩm</h1>
          <p className="text-xs text-neutral-500 mt-1">
            {productsData?.total !== undefined
              ? `Hiển thị ${productsData.total} sản phẩm và thiết bị chính hãng đa dạng ngành hàng`
              : 'Đang tải dữ liệu từ máy chủ...'}
          </p>
        </div>

        {/* Sort select */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-neutral-500">Sắp xếp:</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="bg-white border border-neutral-200 text-xs rounded-md px-2.5 py-1.5 font-medium text-neutral-800 focus:outline-none focus:border-[#c59b27] cursor-pointer"
          >
            <option value="default">Mặc định (Mới nhất)</option>
            <option value="price-asc">Giá: Thấp đến cao</option>
            <option value="price-desc">Giá: Cao đến thấp</option>
            <option value="name-asc">Tên: A - Z</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filters */}
        <div className="lg:col-span-1 space-y-5">
          {/* Search Input Box */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Tìm theo tên sản phẩm..."
              className="w-full text-xs h-9.5 pl-9 pr-4 bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-[#c59b27] focus:ring-1 focus:ring-[#c59b27]/20 placeholder:text-neutral-400"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          </form>

          {/* Categories Filter Card */}
          <div className="bg-white rounded-lg border border-neutral-200 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#c59b27]" />
                Danh mục
              </span>
              {(categoryId || search) && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] text-[#c59b27] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Xóa lọc
                </button>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleCategorySelect('')}
                className={cn(
                  'text-left text-xs px-3 py-2 rounded font-medium transition-colors cursor-pointer flex items-center justify-between',
                  !categoryId
                    ? 'bg-neutral-900 text-white font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-100'
                )}
              >
                <span>Tất cả danh mục</span>
                <span
                  className={cn(
                    'text-[11px] font-semibold px-2 py-0.5 rounded-full',
                    !categoryId
                      ? 'bg-neutral-800 text-neutral-200'
                      : 'bg-neutral-100 text-neutral-500'
                  )}
                >
                  ({allProductsData?.total ?? 0})
                </span>
              </button>

              {categories?.map((cat) => {
                const count = categoryCounts[cat.id] ?? 0
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={cn(
                      'text-left text-xs px-3 py-2 rounded font-medium transition-colors cursor-pointer flex items-center justify-between',
                      categoryId === cat.id
                        ? 'bg-neutral-900 text-white font-semibold'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    )}
                  >
                    <span>{cat.tenDanhMuc}</span>
                    <span
                      className={cn(
                        'text-[11px] font-semibold px-2 py-0.5 rounded-full',
                        categoryId === cat.id
                          ? 'bg-neutral-800 text-neutral-200'
                          : 'bg-neutral-100 text-neutral-500'
                      )}
                    >
                      ({count})
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Product Grid & Pagination */}
        <div className="lg:col-span-3 space-y-6">
          {search && (
            <div className="bg-[#faf5e8] border border-[#e6d3a3] rounded-md px-3.5 py-2 text-xs text-neutral-800 flex items-center justify-between">
              <span>Đang lọc theo từ khóa: <strong>"{search}"</strong></span>
              <button
                onClick={() => {
                  const next = new URLSearchParams(searchParams)
                  next.delete('search')
                  setSearchParams(next)
                }}
                className="text-[#c59b27] font-bold hover:underline"
              >
                Xóa tìm kiếm
              </button>
            </div>
          )}

          {/* Product Grid */}
          {isLoading ? (
            <ProductGridSkeleton count={9} />
          ) : isError ? (
            <div className="bg-white rounded-lg border border-red-200 p-12 text-center space-y-3">
              <p className="text-xs font-semibold text-red-600">
                Không thể tải danh sách sản phẩm từ máy chủ.
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Thử tải lại
              </Button>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="bg-white rounded-lg border border-neutral-200 p-16 text-center space-y-3">
              <Search className="w-10 h-10 text-neutral-300 mx-auto" />
              <p className="text-sm font-semibold text-neutral-800">
                Không tìm thấy sản phẩm phù hợp
              </p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Hãy thử tìm kiếm bằng từ khóa khác hoặc xóa bộ lọc danh mục hiện tại.
              </p>
              <Button size="sm" onClick={handleResetFilters}>
                Xem tất cả sản phẩm
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
              {sortedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-neutral-200">
              <button
                disabled={page <= 1}
                onClick={() => {
                  const next = new URLSearchParams(searchParams)
                  next.set('page', String(page - 1))
                  setSearchParams(next)
                }}
                className="p-2 border border-neutral-200 rounded-md hover:bg-neutral-50 disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-neutral-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-semibold text-neutral-800 px-3">
                Trang {page} / {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => {
                  const next = new URLSearchParams(searchParams)
                  next.set('page', String(page + 1))
                  setSearchParams(next)
                }}
                className="p-2 border border-neutral-200 rounded-md hover:bg-neutral-50 disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-neutral-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
