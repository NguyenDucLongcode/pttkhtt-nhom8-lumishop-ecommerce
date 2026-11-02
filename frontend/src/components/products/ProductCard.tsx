import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Eye } from 'lucide-react'
import { formatCurrency } from '../../utils/format'
import { useCart } from '../../context/CartContext'
import { FallbackImage } from '../common/FallbackImage'
import type { Product } from '../../types/product.types'

interface ProductCardProps {
  product: Product
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart()
  const isOutOfStock = product.soLuongTon <= 0 || product.trangThai === 'NgungBan'

  return (
    <div className="group bg-white rounded-lg border border-neutral-200/90 hover:border-[#c59b27]/80 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      {/* Product Image Box */}
      <Link
        to={`/products/${product.id}`}
        className="block relative aspect-square bg-neutral-100/70 overflow-hidden"
      >
        <FallbackImage
          src={product.hinhAnh}
          alt={product.tenSP}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {isOutOfStock ? (
            <span className="bg-neutral-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
              Hết hàng
            </span>
          ) : product.soLuongTon < 10 ? (
            <span className="bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
              Sắp hết
            </span>
          ) : (
            <span className="bg-[#121212]/80 backdrop-blur-xs text-[#c59b27] text-[10px] font-bold px-2 py-0.5 rounded shadow-xs border border-[#c59b27]/30">
              Chính hãng
            </span>
          )}
        </div>

        {/* Quick action overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/95 text-neutral-900 text-xs font-semibold px-3 py-1.5 rounded shadow flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> Chi tiết
          </span>
        </div>
      </Link>

      {/* Info Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          <span className="text-[10px] font-mono text-neutral-400 block mb-0.5">
            {product.id}
          </span>
          <Link
            to={`/products/${product.id}`}
            className="text-[13px] font-semibold text-neutral-900 line-clamp-2 hover:text-[#c59b27] transition-colors leading-snug"
            title={product.tenSP}
          >
            {product.tenSP}
          </Link>
        </div>

        {/* Price & Cart button */}
        <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
          <div>
            <span className="text-sm sm:text-[15px] font-extrabold text-neutral-950">
              {formatCurrency(product.giaBan)}
            </span>
          </div>

          <button
            onClick={() => !isOutOfStock && addToCart(product, 1)}
            disabled={isOutOfStock}
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
              isOutOfStock
                ? 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
                : 'bg-neutral-900 hover:bg-[#c59b27] text-white hover:text-black cursor-pointer shadow-xs active:scale-95'
            }`}
            title={isOutOfStock ? 'Sản phẩm tạm hết hàng' : 'Thêm vào giỏ hàng'}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
