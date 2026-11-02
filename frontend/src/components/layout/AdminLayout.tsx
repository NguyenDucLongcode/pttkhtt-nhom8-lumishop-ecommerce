import React, { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Ticket,
  Users,
  LogOut,
  Menu,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, exact: true },
  { to: '/admin/products', label: 'Sản phẩm', icon: <Package className="w-4 h-4" /> },
  { to: '/admin/categories', label: 'Danh mục', icon: <Layers className="w-4 h-4" /> },
  { to: '/admin/orders', label: 'Đơn hàng', icon: <ShoppingBag className="w-4 h-4" /> },
  { to: '/admin/vouchers', label: 'Mã giảm giá', icon: <Ticket className="w-4 h-4" /> },
  { to: '/admin/customers', label: 'Khách hàng', icon: <Users className="w-4 h-4" /> },
]

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const isActive = (item: typeof NAV_ITEMS[0]) => {
    if (item.exact) return location.pathname === item.to
    return location.pathname.startsWith(item.to)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#121212] text-neutral-300 text-xs">
      {/* Brand Header */}
      <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#c59b27] text-black font-extrabold flex items-center justify-center text-xs">
            L
          </div>
          <div>
            <span className="text-sm font-extrabold tracking-tight text-white block leading-none">
              LUMI<span className="text-[#c59b27]">SHOP</span>
            </span>
            <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider block mt-0.5">
              Admin Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Admin User Mini Info */}
      <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 text-[#c59b27] flex items-center justify-center font-bold text-xs uppercase">
            {(user?.hoTen || 'A').charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-neutral-200 truncate">{user?.hoTen || user?.tenDangNhap}</p>
            <p className="text-[10px] text-[#c59b27] font-semibold">Quản trị viên cấp cao</p>
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setIsMobileSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-semibold transition-all ${
              isActive(item)
                ? 'bg-neutral-800 text-[#c59b27] shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-neutral-800 space-y-1">
        <Link
          to="/"
          className="flex items-center justify-between px-3 py-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
        >
          <span>Về cửa hàng</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-neutral-100/70 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside className="fixed left-0 top-0 h-full w-64 z-50 flex flex-col shadow-2xl">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Mobile */}
        <header className="lg:hidden bg-white border-b border-neutral-200 px-4 h-14 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 text-neutral-700 hover:bg-neutral-100 rounded-md"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              LumiShop Admin
            </span>
          </div>
          <Link to="/" className="text-xs text-[#c59b27] font-semibold hover:underline">
            Cửa hàng
          </Link>
        </header>

        {/* Dynamic Outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
