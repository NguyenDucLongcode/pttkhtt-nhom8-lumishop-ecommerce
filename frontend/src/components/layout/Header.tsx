import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, User, LogOut, Shield, Search, Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export const Header: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { totalItems, setIsCartOpen } = useCart()
  const [searchTerm, setSearchTerm] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`)
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 transition-all">
      {/* Top micro announcement bar */}
      <div className="bg-[#121212] text-neutral-300 text-[11px] py-1.5 px-4 tracking-wide font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c59b27]"></span>
            <span>Bộ sưu tập đèn bàn bảo vệ mắt & decor tối giản 2026</span>
          </p>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Bảo hành chính hãng 12 tháng</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Hotline: 1900 8899</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 sm:gap-8">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded bg-[#121212] text-[#c59b27] flex items-center justify-center font-bold text-sm tracking-wider shadow-sm group-hover:bg-[#c59b27] group-hover:text-black transition-colors duration-200">
              L
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-neutral-900 leading-none">
                LUMI<span className="text-[#c59b27]">SHOP</span>
              </span>
              <span className="text-[9px] text-neutral-400 font-semibold tracking-widest uppercase mt-0.5">
                Lighting & Living
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md relative"
          >
            <input
              type="text"
              placeholder="Tìm kiếm đèn học chống cận, đèn LED decor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-4 text-xs bg-neutral-100/80 border border-transparent rounded-md focus:bg-white focus:border-[#c59b27] focus:ring-1 focus:ring-[#c59b27]/30 focus:outline-none transition-all placeholder:text-neutral-400"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          </form>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-semibold text-neutral-600">
            <Link to="/" className="hover:text-neutral-950 transition-colors">
              Trang chủ
            </Link>
            <Link to="/products" className="hover:text-neutral-950 transition-colors">
              Sản phẩm
            </Link>
            <Link to="/products?categoryId=DM001" className="hover:text-neutral-950 transition-colors flex items-center gap-1">
              <span>Đèn bàn học</span>
              <span className="text-[9px] font-bold bg-[#faf5e8] text-[#c59b27] px-1.5 py-0.2 rounded border border-[#e6d3a3]">Hot</span>
            </Link>
            {isAuthenticated && (
              <Link
                to="/orders/history"
                className="hover:text-neutral-950 transition-colors"
              >
                Đơn hàng
              </Link>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
              title="Xem giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#c59b27] text-black text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* User Account Menu */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-neutral-800 leading-tight">
                    {user?.hoTen || user?.tenDangNhap}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {isAdmin ? 'Quản trị viên' : 'Khách hàng'}
                  </span>
                </div>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="p-1.5 text-neutral-700 hover:text-[#c59b27] hover:bg-[#faf5e8] rounded-md transition-colors border border-transparent hover:border-[#e6d3a3]"
                    title="Trang quản trị Admin"
                  >
                    <Shield className="w-4 h-4 text-[#c59b27]" />
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-800 hover:text-black bg-neutral-100/90 hover:bg-neutral-200/80 rounded-md transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Đăng nhập</span>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-neutral-700 hover:bg-neutral-100 rounded-md"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 py-3 flex flex-col gap-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-4 text-xs bg-neutral-100 rounded-md border-0 focus:ring-1 focus:ring-[#c59b27]"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
            </form>
            <nav className="flex flex-col gap-1 text-xs font-semibold text-neutral-700">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-neutral-100"
              >
                Trang chủ
              </Link>
              <Link
                to="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-neutral-100"
              >
                Tất cả sản phẩm
              </Link>
              {isAuthenticated && (
                <Link
                  to="/orders/history"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md hover:bg-neutral-100"
                >
                  Lịch sử đơn hàng
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md bg-[#faf5e8] text-[#c59b27] font-bold"
                >
                  Vào trang Quản trị Admin
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
