import React, { createContext, useContext, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { cartApi } from '../api/cart.api'
import { useAuth } from './AuthContext'
import type { Product } from '../types/product.types'

export interface CartItem {
  maSP?: string
  product: Product
  soLuong: number
}

interface ToastInfo {
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

interface CartContextType {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  isLoading: boolean
  addToCart: (product: Product, quantity?: number) => Promise<boolean>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  clearCart: () => Promise<void>
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, token } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [toast, setToast] = useState<ToastInfo | null>(null)

  const showToast = (
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) => {
    setToast({ message, type })
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev))
    }, 2800)
  }

  // Tự động gọi API GET /carts khi đăng nhập thành công và xóa sạch khi đăng xuất
  useEffect(() => {
    let active = true
    if (isAuthenticated && token) {
      cartApi
        .getCart()
        .then((data) => {
          if (active) {
            setItems(Array.isArray(data) ? data : [])
          }
        })
        .catch((err) => {
          console.warn('Lỗi lấy giỏ hàng từ máy chủ:', err)
          if (active) {
            setItems([])
          }
        })
        .finally(() => {
          if (active) {
            setIsLoading(false)
          }
        })
    } else {
      setItems([])
      setIsLoading(false)
    }
    return () => {
      active = false
    }
  }, [isAuthenticated, token])

  const addToCart = async (product: Product, quantity = 1): Promise<boolean> => {
    // Xử lý chưa đăng nhập
    if (!isAuthenticated || !token) {
      showToast('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', 'warning')
      setTimeout(() => {
        const currentPath = window.location.pathname + window.location.search
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
      }, 1200)
      return false
    }

    if (product.soLuongTon <= 0 || product.trangThai === 'NgungBan') {
      showToast('Sản phẩm tạm thời hết hàng hoặc ngừng kinh doanh', 'warning')
      return false
    }

    try {
      const updatedItems = await cartApi.addToCart({
        maSP: product.id,
        soLuong: quantity,
      })
      setItems(Array.isArray(updatedItems) ? updatedItems : [])
      showToast(`Đã thêm "${product.tenSP}" vào giỏ hàng`, 'success')
      return true
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng'
      showToast(Array.isArray(msg) ? msg.join(', ') : msg, 'error')
      return false
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!isAuthenticated || !token) return

    if (quantity <= 0) {
      await removeFromCart(productId)
      return
    }

    try {
      const updatedItems = await cartApi.updateQuantity({
        maSP: productId,
        soLuong: quantity,
      })
      setItems(Array.isArray(updatedItems) ? updatedItems : [])
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể cập nhật số lượng'
      showToast(Array.isArray(msg) ? msg.join(', ') : msg, 'error')
    }
  }

  const removeFromCart = async (productId: string) => {
    if (!isAuthenticated || !token) return

    try {
      const updatedItems = await cartApi.removeFromCart(productId)
      setItems(Array.isArray(updatedItems) ? updatedItems : [])
      showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info')
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Không thể xóa sản phẩm khỏi giỏ'
      showToast(Array.isArray(msg) ? msg.join(', ') : msg, 'error')
    }
  }

  const clearCart = async () => {
    if (!isAuthenticated || !token) {
      setItems([])
      return
    }

    try {
      await cartApi.clearCart()
    } catch (err) {
      console.warn('Lỗi dọn giỏ hàng từ máy chủ:', err)
    } finally {
      setItems([])
    }
  }

  const totalItems = items.reduce((sum, item) => sum + item.soLuong, 0)
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.product?.giaBan || 0) * item.soLuong,
    0
  )

  const value = {
    items,
    totalItems,
    totalPrice,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    showToast,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* Toast thông báo toàn cục */}
      {toast && (
        <div
          role="alert"
          className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border text-sm font-medium transition-all duration-300 max-w-sm pointer-events-none animate-in fade-in slide-in-from-top-4 ${
            toast.type === 'warning'
              ? 'bg-neutral-900 border-amber-500/60 text-amber-200'
              : toast.type === 'success'
              ? 'bg-neutral-900 border-emerald-500/60 text-emerald-200'
              : toast.type === 'error'
              ? 'bg-neutral-900 border-red-500/60 text-red-200'
              : 'bg-neutral-900 border-neutral-700 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle
              className={`w-5 h-5 shrink-0 ${
                toast.type === 'error' ? 'text-red-400' : 'text-amber-400'
              }`}
            />
          )}
          <span className="flex-1 leading-snug">{toast.message}</span>
        </div>
      )}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
