import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Truck, RotateCcw, Headphones, ArrowUpRight } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#121212] text-neutral-400 border-t border-neutral-800 text-xs">
      {/* 4 Feature Columns */}
      <div className="border-b border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#c59b27] shrink-0">
              <Truck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p className="font-bold text-neutral-200 text-sm">Giao Hàng Toàn Quốc</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Phí ship ưu đãi chỉ 30k</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#c59b27] shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p className="font-bold text-neutral-200 text-sm">Bảo Hành 12 Tháng</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Cam kết 1 đổi 1 nếu lỗi</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#c59b27] shrink-0">
              <RotateCcw className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p className="font-bold text-neutral-200 text-sm">Đổi Trả Dễ Dàng</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Hỗ trợ trong vòng 7 ngày</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#c59b27] shrink-0">
              <Headphones className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p className="font-bold text-neutral-200 text-sm">Tư Vấn AI 24/7</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Trợ lý tư vấn sản phẩm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#c59b27] text-black font-bold flex items-center justify-center text-xs">
                L
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">
                LUMI<span className="text-[#c59b27]">SHOP</span>
              </span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
              Hệ thống bán lẻ thiết bị gia dụng thông minh, đồ dùng học tập, thiết bị công nghệ và đồ trang trí hiện đại, cam kết chính hãng 100% với chất lượng và mức giá tốt nhất.
            </p>
            <div className="pt-2 text-[11px] text-neutral-400 space-y-1">
              <p>📍 Địa chỉ: Nguyễn Ái Quốc, TP. Biên Hòa, Đồng Nai</p>
              <p>📞 Hotline bán hàng: 1900 8899 (8h00 - 21h30)</p>
              <p>✉️ Email: contact@lumishop.vn</p>
            </div>
          </div>

          {/* Col 2 */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-neutral-200 font-bold tracking-wider uppercase text-[11px]">Danh Mục</h4>
            <ul className="space-y-2">
              <li><Link to="/products?categoryId=DM001" className="hover:text-white transition-colors">Thiết bị gia dụng</Link></li>
              <li><Link to="/products?categoryId=DM002" className="hover:text-white transition-colors">Đồ dùng học tập</Link></li>
              <li><Link to="/products?categoryId=DM003" className="hover:text-white transition-colors">Thiết bị công nghệ</Link></li>
              <li><Link to="/products?categoryId=DM004" className="hover:text-white transition-colors">Đồ trang trí</Link></li>
              <li><Link to="/products?categoryId=DM005" className="hover:text-white transition-colors">Phụ kiện tiện ích</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-neutral-200 font-bold tracking-wider uppercase text-[11px]">Hỗ Trợ</h4>
            <ul className="space-y-2">
              <li><Link to="/orders/history" className="hover:text-white transition-colors">Kiểm tra đơn hàng</Link></li>
              <li><span className="text-neutral-400 cursor-default">Chính sách vận chuyển</span></li>
              <li><span className="text-neutral-400 cursor-default">Quy định bảo hành</span></li>
              <li><span className="text-neutral-400 cursor-default">Bảo mật thông tin</span></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-neutral-200 font-bold tracking-wider uppercase text-[11px]">Đồ Án Cuối Kỳ</h4>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Phân tích & Thiết kế Hệ thống Thông tin — Nhóm 8. Tích hợp RAG AI Chatbot tư vấn thông minh (Ollama qwen3:4b).
            </p>
            <div className="pt-2">
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-all font-medium text-[11px]"
              >
                <span>Khu vực Quản trị viên</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#c59b27]" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-neutral-900 py-6 text-center text-neutral-400 text-[11px]">
        <p>© 2026 LumiShop E-Commerce System. All rights reserved.</p>
      </div>
    </footer>
  )
}
