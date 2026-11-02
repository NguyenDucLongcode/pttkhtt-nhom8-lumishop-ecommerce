import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ShoppingCart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react'
import { productsApi } from '../../api/products.api'
import { formatCurrency } from '../../utils/format'
import { FallbackImage } from '../../components/common/FallbackImage'
import { Button } from '../../components/common/Button'
import { ProductCard } from '../../components/products/ProductCard'
import { useCart } from '../../context/CartContext'

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [quantity, setQuantity] = useState(1)
  const [addedToast, setAddedToast] = useState(false)
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id!),
    enabled: !!id,
  })

  const { data: recommendations } = useQuery({
    queryKey: ['product-recommendations', id],
    queryFn: () => productsApi.getRecommendations(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="w-full aspect-square bg-neutral-200 animate-pulse rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-neutral-200 animate-pulse rounded w-3/4" />
            <div className="h-6 bg-neutral-200 animate-pulse rounded w-1/3" />
            <div className="h-24 bg-neutral-200 animate-pulse rounded w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-xl border border-neutral-200 text-center space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-neutral-900">
          Sản phẩm không tồn tại
        </h2>
        <p className="text-xs text-neutral-500">
          Mã sản phẩm "{id}" không tồn tại hoặc đã bị gỡ khỏi hệ thống.
        </p>
        <Link to="/products">
          <Button size="sm">Xem danh mục sản phẩm</Button>
        </Link>
      </div>
    )
  }

  const isOutOfStock = product.soLuongTon <= 0 || product.trangThai === 'NgungBan'

  const handleAddToCart = async () => {
    if (!isOutOfStock) {
      const ok = await addToCart(product, quantity)
      if (ok) {
        setAddedToast(true)
        setTimeout(() => setAddedToast(false), 2500)
      }
    }
  }

  const handleBuyNow = async () => {
    if (!isOutOfStock) {
      const ok = await addToCart(product, quantity)
      if (ok) {
        navigate('/checkout')
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Back button link */}
      <div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách sản phẩm</span>
        </Link>
      </div>

      {/* Main Product Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-xl border border-neutral-200 p-6 sm:p-8 shadow-xs">
        {/* Left: Product Image */}
        <div className="aspect-square w-full rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100">
          <FallbackImage
            src={product.hinhAnh}
            alt={product.tenSP}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right: Details & Order CTA */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                Mã SP: {product.id}
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                  isOutOfStock
                    ? 'bg-neutral-100 text-neutral-600'
                    : 'bg-[#faf5e8] text-[#c59b27] border border-[#e6d3a3]'
                }`}
              >
                {isOutOfStock ? 'Hết hàng' : 'Đang mở bán'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 leading-snug">
              {product.tenSP}
            </h1>

            {/* Price Box */}
            <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200/80">
              <span className="text-[11px] text-neutral-500 block mb-1">
                Giá niêm yết chính hãng:
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950">
                {formatCurrency(product.giaBan)}
              </div>
            </div>

            {/* Stock status */}
            <div className="text-xs text-neutral-600 flex items-center gap-2">
              <span>Tình trạng kho hàng:</span>
              <strong className="text-neutral-900">
                {product.soLuongTon > 0
                  ? `Còn ${product.soLuongTon} sản phẩm tại kho`
                  : 'Tạm hết hàng'}
              </strong>
            </div>

            {/* Description */}
            <div className="pt-2 border-t border-neutral-100 space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Mô tả sản phẩm
              </h3>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                {product.moTa || 'Chưa có thông tin mô tả chi tiết cho sản phẩm này.'}
              </p>
            </div>
          </div>

          {/* Action form */}
          <div className="space-y-4 pt-4 border-t border-neutral-100">
            {/* Quantity selector */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-neutral-700">
                  Số lượng:
                </span>
                <div className="flex items-center border border-neutral-300 rounded-md">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-l-md cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-xs font-bold text-neutral-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.soLuongTon, q + 1))
                    }
                    className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-r-md cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                size="lg"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1"
              >
                <ShoppingCart className="w-4 h-4 mr-1.5" />
                <span>Thêm vào giỏ</span>
              </Button>

              <Button
                size="lg"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="flex-1 bg-neutral-950 hover:bg-[#c59b27] hover:text-black text-white"
              >
                <span>Mua ngay</span>
              </Button>
            </div>

            {addedToast && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Đã thêm sản phẩm vào giỏ hàng thành công!</span>
              </div>
            )}

            {/* Commitments banner */}
            <div className="grid grid-cols-3 gap-2 pt-4 text-center border-t border-neutral-100 text-[11px] text-neutral-600">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#c59b27]" />
                <span className="font-medium">Bảo hành 12T</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-[#c59b27]" />
                <span className="font-medium">Phí ship 30.000₫</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-[#c59b27]" />
                <span className="font-medium">Đổi mới 7 ngày</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      {recommendations && recommendations.length > 0 && (
        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              Sản Phẩm Cùng Danh Mục Gợi Ý
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Các sản phẩm tương tự cùng danh mục bạn có thể quan tâm
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {recommendations.map((rec) => (
              <ProductCard key={rec.id} product={rec} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
