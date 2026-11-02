import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Tag, ArrowUpRight } from 'lucide-react'
import { productsApi } from '../../api/products.api'
import { categoriesApi } from '../../api/categories.api'
import { vouchersApi } from '../../api/vouchers.api'
import { ProductCard } from '../../components/products/ProductCard'
import { ProductGridSkeleton } from '../../components/products/ProductGridSkeleton'
import { formatCurrency } from '../../utils/format'

export const HomePage: React.FC = () => {
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['home-products'],
    queryFn: () => productsApi.getAll({ limit: 8, page: 1 }),
  })

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  })

  const { data: vouchersData } = useQuery({
    queryKey: ['home-vouchers'],
    queryFn: () => vouchersApi.getAll({ isActive: true, limit: 3 }),
  })

  return (
    <div className="space-y-16 pb-16">
      {/* Editorial Hero Section */}
      <section className="relative bg-white border-b border-neutral-200/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#faf5e8] border border-[#e6d3a3] text-[#c59b27] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Công nghệ chiếu sáng tự nhiên RG0 không nguy hại</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight leading-[1.15]">
                Ánh Sáng Dịu Mắt Cho Góc Làm Việc & Học Tập
              </h1>

              <p className="text-neutral-600 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Đèn bàn LED LumiShop đạt chỉ số hoàn màu CRI &gt; 90, lọc tối đa tia ánh sáng xanh gây mỏi mắt. Thiết kế tối giản, tinh tế cho không gian hiện đại.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/products"
                  className="px-6 py-3 rounded-md bg-neutral-950 hover:bg-[#c59b27] text-white hover:text-black font-semibold text-xs sm:text-sm transition-all duration-200 shadow-sm flex items-center gap-2"
                >
                  <span>Khám phá sản phẩm</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/products?categoryId=DM001"
                  className="px-6 py-3 rounded-md bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 font-semibold text-xs sm:text-sm transition-all duration-200"
                >
                  Đèn học chống cận
                </Link>
              </div>

              {/* 3 Metrics */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-neutral-200/70 max-w-md mx-auto lg:mx-0 text-left">
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-neutral-950">98%</p>
                  <p className="text-[11px] text-neutral-500 font-medium mt-0.5">Hài lòng thị giác</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-neutral-950">CRI &gt; 90</p>
                  <p className="text-[11px] text-neutral-500 font-medium mt-0.5">Màu sắc chân thực</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-neutral-950">12T</p>
                  <p className="text-[11px] text-neutral-500 font-medium mt-0.5">Bảo hành 1 đổi 1</p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-xl">
                <img
                  src="https://picsum.photos/seed/SP001/800/800"
                  alt="Đèn bàn Lumi Pro Desk"
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-neutral-200/80 shadow-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#c59b27] uppercase tracking-wider block">
                      Được bình chọn tốt nhất
                    </span>
                    <h4 className="text-xs font-bold text-neutral-900 mt-0.5">
                      Lumi Desk Pro Chống Cận Thị
                    </h4>
                    <p className="text-xs text-neutral-900 font-extrabold mt-1">
                      550.000₫
                    </p>
                  </div>
                  <Link
                    to="/products/SP001"
                    className="px-3.5 py-1.5 rounded-md bg-neutral-900 hover:bg-[#c59b27] text-white hover:text-black font-semibold text-xs transition-colors"
                  >
                    Xem ngay
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vouchers Row */}
      {vouchersData && vouchersData.data && vouchersData.data.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#c59b27]" />
              <h2 className="text-base font-bold text-neutral-900">
                Mã Ưu Đãi Đang Kích Hoạt
              </h2>
            </div>
            <span className="text-[11px] text-neutral-500">Nhập mã tại trang thanh toán</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {vouchersData.data.map((vc) => (
              <div
                key={vc.id}
                className="bg-white border border-neutral-200/90 rounded-lg p-4 flex items-center justify-between shadow-xs hover:border-[#c59b27]/80 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-neutral-100 text-neutral-900 px-2 py-0.5 rounded border border-neutral-200">
                      {vc.code}
                    </span>
                    <span className="text-[11px] font-bold text-[#c59b27]">
                      {vc.discountType === 'PERCENT'
                        ? `Giảm ${vc.discountValue}%`
                        : `-${formatCurrency(vc.discountValue)}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 line-clamp-1">
                    {vc.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              Danh Mục Sản Phẩm
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Phân loại thiết bị chiếu sáng theo từng nhu cầu sử dụng
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-semibold text-neutral-700 hover:text-black flex items-center gap-1 group"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {isLoadingCategories ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-neutral-200/60 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {categories?.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="group bg-white rounded-lg border border-neutral-200/80 p-4 hover:border-[#c59b27] hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 block mb-1">
                    {cat.id}
                  </span>
                  <h3 className="text-xs font-bold text-neutral-900 group-hover:text-[#c59b27] transition-colors leading-tight">
                    {cat.tenDanhMuc}
                  </h3>
                  <p className="text-[11px] text-neutral-500 line-clamp-1 mt-1">
                    {cat.moTa || 'Sản phẩm chính hãng'}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-end text-neutral-400 group-hover:text-[#c59b27] transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              Sản Phẩm Đang Kinh Doanh
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Các mẫu đèn bàn LED học sinh, đèn đọc sách và phụ kiện chính hãng
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-semibold text-neutral-700 hover:text-black flex items-center gap-1 group"
          >
            <span>Tất cả sản phẩm</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {isLoadingProducts ? (
          <ProductGridSkeleton count={8} />
        ) : productsData && productsData.data && productsData.data.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {productsData.data.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center text-neutral-500 text-xs">
            Hiện chưa có sản phẩm nào đang mở bán.
          </div>
        )}
      </section>
    </div>
  )
}
