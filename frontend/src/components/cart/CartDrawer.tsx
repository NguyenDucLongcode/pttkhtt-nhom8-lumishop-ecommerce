import React from 'react'
import { X, Trash2, ArrowRight, ShoppingBag, Plus, Minus } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { formatCurrency } from '../../utils/format'
import { FallbackImage } from '../common/FallbackImage'
import { Button } from '../common/Button'
import { useNavigate } from 'react-router-dom'

export const CartDrawer: React.FC = () => {
  const {
    items,
    totalItems,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
  } = useCart()
  const navigate = useNavigate()

  if (!isCartOpen) return null

  const handleCheckout = () => {
    setIsCartOpen(false)
    navigate('/checkout')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-semibold text-slate-900">
                Giỏ hàng của bạn ({totalItems})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-700">
                  Giỏ hàng chưa có sản phẩm nào
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Hãy khám phá các mẫu đèn bàn chống cận và thiết bị chiếu sáng của LumiShop.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCartOpen(false)
                    navigate('/products')
                  }}
                  className="mt-4"
                >
                  Mua sắm ngay
                </Button>
              </div>
            ) : (
              items.map(({ product, soLuong }) => (
                <div
                  key={product.id}
                  className="flex gap-3 py-3 border-b border-slate-100 last:border-b-0"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                    <FallbackImage src={product.hinhAnh} alt={product.tenSP} />
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 truncate">
                        {product.tenSP}
                      </h4>
                      <p className="text-xs font-bold text-amber-600 mt-0.5">
                        {formatCurrency(product.giaBan)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-200 rounded-md">
                        <button
                          onClick={() => updateQuantity(product.id, soLuong - 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-medium">
                          {soLuong}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, soLuong + 1)}
                          disabled={soLuong >= product.soLuongTon}
                          className="p-1 hover:bg-slate-100 text-slate-600 disabled:opacity-30 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                        title="Xóa khỏi giỏ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer checkout */}
          {items.length > 0 && (
            <div className="border-t border-slate-200 p-6 bg-slate-50 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Tạm tính tiền hàng:</span>
                <span className="text-base font-bold text-slate-900">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                * Phí giao hàng và mã giảm giá voucher sẽ được áp dụng tại bước thanh toán.
              </p>
              <Button onClick={handleCheckout} className="w-full justify-between">
                <span>Tiến hành đặt hàng</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
