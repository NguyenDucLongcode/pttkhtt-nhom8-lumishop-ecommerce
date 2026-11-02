import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Product } from '../types/product.types'

export interface CartItem {
  product: Product
  soLuong: number
}

interface CartContextType {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addToCart: (product: Product, quantity?: number) => boolean
  updateQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'lumishop_cart'

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      console.warn('Lỗi lưu cart:', e)
    }
  }, [items])

  const addToCart = (product: Product, quantity = 1): boolean => {
    if (product.soLuongTon <= 0 || product.trangThai === 'NgungBan') {
      return false
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        const newQty = Math.min(
          existing.soLuong + quantity,
          product.soLuongTon
        )
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, soLuong: newQty } : item
        )
      }
      const initialQty = Math.min(quantity, product.soLuongTon)
      return [...prev, { product, soLuong: initialQty }]
    })
    return true
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const validQty = Math.min(quantity, item.product.soLuongTon)
          return { ...item, soLuong: validQty }
        }
        return item
      })
    )
  }

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.soLuong, 0)
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.giaBan * item.soLuong,
    0
  )

  const value = {
    items,
    totalItems,
    totalPrice,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isCartOpen,
    setIsCartOpen,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
