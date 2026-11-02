import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Truck,
  Wallet,
  Tag,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  QrCode,
  ShieldCheck,
  Copy,
  Check,
  Lock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { vouchersApi } from '../../api/vouchers.api'
import { ordersApi } from '../../api/orders.api'
import { formatCurrency } from '../../utils/format'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { FallbackImage } from '../../components/common/FallbackImage'
import type { PaymentMethod, Order } from '../../types/order.types'
import type { Voucher } from '../../types/voucher.types'

export const CheckoutPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const { items, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()

  // Form Fields
  const [hoTen, setHoTen] = useState(user?.hoTen || '')
  const [sdt, setSdt] = useState(user?.sdt || '')
  const [tinhThanh, setTinhThanh] = useState('Đồng Nai')
  const [quanHuyen, setQuanHuyen] = useState('TP. Biên Hòa')
  const [soNhaTenDuong, setSoNhaTenDuong] = useState(user?.diaChi || '')
  const [ghiChu, setGhiChu] = useState('')
  const [phuongThucTT, setPhuongThucTT] = useState<PaymentMethod>('COD')
  
  // Voucher
  const [voucherCodeInput, setVoucherCodeInput] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null)
  const [voucherError, setVoucherError] = useState('')
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false)

  // Order Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null)
  const [copiedAccount, setCopiedAccount] = useState(false)
  const [copiedContent, setCopiedContent] = useState(false)

  const phiShip = 30000

  // Calculate discount amount
  let discountAmount = 0
  if (appliedVoucher) {
    if (appliedVoucher.discountType === 'PERCENT') {
      let d = (totalPrice * appliedVoucher.discountValue) / 100
      if (appliedVoucher.maxDiscountAmount && d > appliedVoucher.maxDiscountAmount) {
        d = appliedVoucher.maxDiscountAmount
      }
      discountAmount = d
    } else {
      discountAmount = appliedVoucher.discountValue
    }
    if (discountAmount > totalPrice) discountAmount = totalPrice
  }

  const finalTotal = Math.max(0, totalPrice - discountAmount + phiShip)

  const handleApplyVoucher = async () => {
    const code = voucherCodeInput.trim().toUpperCase()
    if (!code) return

    setVoucherError('')
    setIsCheckingVoucher(true)

    try {
      const result = await vouchersApi.checkCode(code)
      if (!result.isValid) {
        setVoucherError(result.message || 'Mã giảm giá không hợp lệ')
        setAppliedVoucher(null)
      } else if (
        result.voucher.minOrderValue &&
        totalPrice < result.voucher.minOrderValue
      ) {
        setVoucherError(
          `Đơn hàng chưa đạt giá trị tối thiểu ${formatCurrency(
            result.voucher.minOrderValue
          )} để áp dụng mã này`
        )
        setAppliedVoucher(null)
      } else {
        setAppliedVoucher(result.voucher)
      }
    } catch (err: any) {
      setVoucherError(
        err.response?.data?.message || 'Mã voucher không tồn tại hoặc đã hết hạn'
      )
      setAppliedVoucher(null)
    } finally {
      setIsCheckingVoucher(false)
    }
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated || !user) {
      navigate('/login?redirect=/checkout')
      return
    }

    if (!soNhaTenDuong.trim()) {
      setOrderError('Vui lòng nhập số nhà, tên đường để bưu tá giao hàng tận nơi.')
      return
    }

    if (items.length === 0) {
      setOrderError('Giỏ hàng trống. Vui lòng chọn sản phẩm.')
      return
    }

    setOrderError('')
    setIsSubmitting(true)

    const diaChiDayDu = `${soNhaTenDuong.trim()}, ${quanHuyen}, ${tinhThanh}${ghiChu ? ` (Ghi chú: ${ghiChu.trim()})` : ''}`

    try {
      const orderPayload = {
        maKH: user.id,
        diaChiGiao: diaChiDayDu,
        phuongThucTT,
        items: items.map((it) => ({
          maSP: it.product.id,
          soLuong: it.soLuong,
        })),
        voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
        phiShip,
      }

      const resOrder = await ordersApi.checkout(orderPayload)
      setCreatedOrder(resOrder)
      clearCart()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      const msg = err.response?.data?.message
      setOrderError(
        Array.isArray(msg)
          ? msg.join(', ')
          : msg || 'Không thể tạo đơn hàng. Vui lòng kiểm tra lại số lượng tồn kho.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- TRƯỜNG HỢP: ĐẶT HÀNG THÀNH CÔNG -> HIỂN THỊ MÀN HÌNH XÁC NHẬN CHUYÊN NGHIỆP ---
  if (createdOrder) {
    const vietQrUrl = `https://img.vietqr.io/image/MB-0901111001-compact2.png?amount=${createdOrder.tongTien}&addInfo=${createdOrder.id}&accountName=LUMISHOP%20VIETNAM`

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-page-enter">
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xl overflow-hidden">
          {/* Header chúc mừng */}
          <div className="bg-neutral-950 text-white p-6 sm:p-8 text-center relative">
            <div className="w-14 h-14 rounded-full bg-[#c59b27] text-black flex items-center justify-center mx-auto mb-3 shadow-lg">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#c59b27]">
              Đặt Hàng Thành Công
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              Cảm Ơn Quý Khách Đã Mua Sắm Tại LumiShop!
            </h1>
            <p className="text-xs text-neutral-400 mt-2 max-w-md mx-auto">
              Đơn hàng <strong className="text-white font-mono">#{createdOrder.id}</strong> đã được ghi nhận vào hệ thống và đang chuyển tới bộ phận đóng gói.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6 text-xs text-neutral-700">
            {/* TH1: Nếu chọn chuyển khoản -> Hiển thị mã QR VietQR thực tế */}
            {createdOrder.phuongThucTT === 'ChuyenKhoan' ? (
              <div className="bg-[#faf5e8] border border-[#e6d3a3] rounded-xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 text-neutral-950 font-bold text-sm pb-2 border-b border-[#e6d3a3]">
                  <QrCode className="w-5 h-5 text-[#c59b27]" />
                  <span>Quét Mã VietQR Chuyển Khoản Tức Thì (24/7)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-5 flex flex-col items-center text-center">
                    <div className="p-2 bg-white rounded-xl shadow-md border border-neutral-200">
                      <img
                        src={vietQrUrl}
                        alt="Mã QR thanh toán VietQR"
                        className="w-44 h-44 object-contain rounded"
                      />
                    </div>
                    <span className="text-[10px] text-neutral-500 mt-2">
                      Mở app ngân hàng bất kỳ để quét QR
                    </span>
                  </div>

                  <div className="md:col-span-7 space-y-2.5">
                    <div className="bg-white p-3 rounded-lg border border-[#e6d3a3] space-y-1">
                      <span className="text-[10px] text-neutral-400 uppercase font-bold block">Ngân Hàng Thụ Hưởng</span>
                      <p className="font-extrabold text-neutral-900 text-sm">MBBank (Ngân hàng Quân Đội)</p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-[#e6d3a3] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase font-bold block">Số Tài Khoản</span>
                        <p className="font-mono font-bold text-neutral-900 text-sm">0901111001</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('0901111001')
                          setCopiedAccount(true)
                          setTimeout(() => setCopiedAccount(false), 2000)
                        }}
                        className="p-1.5 rounded hover:bg-neutral-100 text-neutral-600 flex items-center gap-1 font-semibold text-[11px]"
                      >
                        {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedAccount ? 'Đã chép' : 'Sao chép'}</span>
                      </button>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-[#e6d3a3] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase font-bold block">Nội Dung Chuyển Khoản</span>
                        <p className="font-mono font-bold text-[#c59b27] text-sm">{createdOrder.id}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(createdOrder.id)
                          setCopiedContent(true)
                          setTimeout(() => setCopiedContent(false), 2000)
                        }}
                        className="p-1.5 rounded hover:bg-neutral-100 text-neutral-600 flex items-center gap-1 font-semibold text-[11px]"
                      >
                        {copiedContent ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedContent ? 'Đã chép' : 'Sao chép'}</span>
                      </button>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-[#e6d3a3]">
                      <span className="text-[10px] text-neutral-400 uppercase font-bold block">Số Tiền Cần Chuyển</span>
                      <p className="font-extrabold text-neutral-950 text-base">{formatCurrency(createdOrder.tongTien)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* TH2: COD -> Thông báo kiểm tra hàng chuẩn thương mại điện tử */
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 flex items-start gap-3">
                <Truck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm">
                    Giao Hàng & Thu Tiền Tận Nơi (COD)
                  </h4>
                  <p className="text-emerald-800 text-xs mt-1 leading-relaxed">
                    Bạn chỉ cần chuẩn bị số tiền mặt <strong className="font-extrabold">{formatCurrency(createdOrder.tongTien)}</strong> khi nhân viên bưu tá giao hàng. Bạn được kiểm tra đèn trước khi nhận!
                  </p>
                </div>
              </div>
            )}

            {/* Thông tin người nhận */}
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/80 space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-neutral-900 text-[11px]">
                Chi Tiết Giao Nhận Hàng
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-600">
                <p>• Người nhận: <strong className="text-neutral-900">{user?.hoTen}</strong></p>
                <p>• Số điện thoại: <strong className="text-neutral-900">{user?.sdt}</strong></p>
                <p className="sm:col-span-2">• Địa chỉ: <strong className="text-neutral-900">{createdOrder.diaChiGiao}</strong></p>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/orders/history"
                className="flex-1 py-3 text-center rounded-lg bg-neutral-950 hover:bg-[#c59b27] hover:text-black text-white font-bold transition-all shadow-sm"
              >
                Theo Dõi Tiến Độ Đơn Hàng
              </Link>
              <Link
                to="/products"
                className="flex-1 py-3 text-center rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-800 font-semibold transition-all"
              >
                Tiếp Tục Mua Sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Nếu giỏ trống
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-neutral-200 text-center space-y-4 shadow-sm animate-page-enter">
        <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto" />
        <h2 className="text-sm font-bold text-neutral-900">Giỏ hàng của bạn đang trống</h2>
        <p className="text-xs text-neutral-500">Hãy thêm sản phẩm đèn bàn yêu thích vào giỏ trước khi thanh toán.</p>
        <Link to="/products">
          <Button size="sm">Xem danh mục đèn</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-page-enter">
      {/* Breadcrumb quay lại */}
      <div className="mb-6">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại cửa hàng</span>
        </Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            Thanh Toán & Đặt Hàng
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Thanh toán bảo mật SSL</span>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmitOrder}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG & PHƯƠNG THỨC TT */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Địa chỉ */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Thông Tin Nhận Hàng</span>
              </h2>
              <span className="text-[11px] text-neutral-400">Giao hàng tận nơi toàn quốc</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Họ và tên người nhận (*)"
                placeholder="Nguyễn Văn A"
                value={hoTen}
                onChange={(e) => setHoTen(e.target.value)}
                required
              />
              <Input
                label="Số điện thoại liên hệ (*)"
                placeholder="0987654321"
                value={sdt}
                onChange={(e) => setSdt(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-700">Tỉnh / Thành Phố</label>
                <select
                  value={tinhThanh}
                  onChange={(e) => setTinhThanh(e.target.value)}
                  className="h-9 px-3 text-xs bg-white border border-neutral-200 rounded-md focus:border-[#c59b27] cursor-pointer"
                >
                  <option value="Đồng Nai">Đồng Nai</option>
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Bình Dương">Bình Dương</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                  <option value="Tỉnh khác">Tỉnh / Thành khác</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-700">Quận / Huyện</label>
                <input
                  type="text"
                  value={quanHuyen}
                  onChange={(e) => setQuanHuyen(e.target.value)}
                  className="h-9 px-3 text-xs bg-white border border-neutral-200 rounded-md focus:border-[#c59b27]"
                  placeholder="TP. Biên Hòa, Quận 1..."
                  required
                />
              </div>
            </div>

            <Input
              label="Địa chỉ chi tiết (Số nhà, tên đường, phường/xã) (*)"
              placeholder="vd: 45 Lê Lợi, Phường Tân Biên"
              value={soNhaTenDuong}
              onChange={(e) => setSoNhaTenDuong(e.target.value)}
              required
            />

            <Input
              label="Ghi chú giao hàng (Tùy chọn)"
              placeholder="vd: Giao giờ hành chính, gọi trước khi đến 15 phút"
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
            />
          </div>

          {/* Card 2: Phương thức thanh toán chân thực */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Phương Thức Thanh Toán</span>
              </h2>
              <span className="text-[11px] text-neutral-400">Chọn 1 phương thức</span>
            </div>

            <div className="space-y-3">
              {/* Option 1: COD */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  phuongThucTT === 'COD'
                    ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                    : 'border-neutral-200 hover:bg-neutral-50/70'
                }`}
              >
                <input
                  type="radio"
                  name="phuongThucTT"
                  checked={phuongThucTT === 'COD'}
                  onChange={() => setPhuongThucTT('COD')}
                  className="mt-0.5 text-neutral-950 focus:ring-neutral-900"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#c59b27]" />
                    <span className="font-bold text-xs text-neutral-900">
                      Thanh toán khi nhận hàng (COD)
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-800">
                      Phổ biến
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                    Nhận hàng tại nhà, kiểm tra tình trạng bóng đèn và đóng gói nguyên vẹn trước khi thanh toán tiền mặt cho bưu tá.
                  </p>
                </div>
              </label>

              {/* Option 2: Chuyển khoản VietQR */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  phuongThucTT === 'ChuyenKhoan'
                    ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                    : 'border-neutral-200 hover:bg-neutral-50/70'
                }`}
              >
                <input
                  type="radio"
                  name="phuongThucTT"
                  checked={phuongThucTT === 'ChuyenKhoan'}
                  onChange={() => setPhuongThucTT('ChuyenKhoan')}
                  className="mt-0.5 text-neutral-950 focus:ring-neutral-900"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#c59b27]" />
                    <span className="font-bold text-xs text-neutral-900">
                      Chuyển khoản Ngân Hàng (VietQR 24/7)
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#faf5e8] text-[#c59b27] border border-[#e6d3a3]">
                      Nhanh chóng
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                    Hệ thống sẽ hiển thị mã VietQR kèm số tiền và nội dung chuyển khoản tự động ngay sau khi bấm hoàn tất.
                  </p>
                </div>
              </label>

              {/* Option 3: Ví điện tử */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  phuongThucTT === 'ViDienTu'
                    ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                    : 'border-neutral-200 hover:bg-neutral-50/70'
                }`}
              >
                <input
                  type="radio"
                  name="phuongThucTT"
                  checked={phuongThucTT === 'ViDienTu'}
                  onChange={() => setPhuongThucTT('ViDienTu')}
                  className="mt-0.5 text-neutral-950 focus:ring-neutral-900"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#c59b27]" />
                    <span className="font-bold text-xs text-neutral-900">
                      Ví Điện Tử (MoMo / ZaloPay)
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                    Chuyển khoản qua số điện thoại cửa hàng 0901111001.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: TỔNG QUAN ĐƠN HÀNG & MÃ VOUCHER */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Đơn Hàng Của Bạn ({items.length} món)
              </h2>
              <Link to="/products" className="text-[11px] text-[#c59b27] hover:underline">
                Thêm món khác
              </Link>
            </div>

            {/* Danh sách món */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {items.map(({ product, soLuong }) => (
                <div key={product.id} className="flex gap-3 text-xs items-center">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-neutral-200 bg-neutral-100">
                    <FallbackImage src={product.hinhAnh} alt={product.tenSP} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900 truncate">
                      {product.tenSP}
                    </p>
                    <p className="text-neutral-500 mt-0.5">
                      Số lượng: <strong>{soLuong}</strong> × {formatCurrency(product.giaBan)}
                    </p>
                  </div>
                  <span className="font-extrabold text-neutral-950 shrink-0">
                    {formatCurrency(product.giaBan * soLuong)}
                  </span>
                </div>
              ))}
            </div>

            {/* Nhập mã giảm giá */}
            <div className="pt-4 border-t border-neutral-100 space-y-2">
              <label className="text-xs font-semibold text-neutral-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>Mã Khuyến Mãi (Voucher)</span>
                </span>
                <span className="text-[10px] text-neutral-400 font-normal">Gợi ý: LUMI10</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã LUMI10, LUMIFIX50..."
                  value={voucherCodeInput}
                  onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                  className="flex-1 h-9 text-xs px-3 bg-neutral-50 border border-neutral-200 rounded-md uppercase font-mono focus:outline-none focus:border-[#c59b27]"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleApplyVoucher}
                  isLoading={isCheckingVoucher}
                  className="shrink-0"
                >
                  Áp dụng
                </Button>
              </div>

              {appliedVoucher && (
                <div className="flex items-center justify-between p-2.5 bg-[#faf5e8] border border-[#e6d3a3] rounded text-xs text-neutral-900">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
                    <span className="font-bold text-[#c59b27]">
                      {appliedVoucher.code} (-{formatCurrency(discountAmount)})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedVoucher(null)
                      setVoucherCodeInput('')
                    }}
                    className="text-xs text-red-600 hover:underline cursor-pointer"
                  >
                    Bỏ mã
                  </button>
                </div>
              )}

              {voucherError && (
                <p className="text-xs text-red-600 font-medium">
                  {voucherError}
                </p>
              )}
            </div>

            {/* Chi tiết bảng tiền */}
            <div className="pt-4 border-t border-neutral-100 space-y-2.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Tiền hàng tạm tính:</span>
                <span className="font-semibold text-neutral-900">
                  {formatCurrency(totalPrice)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-[#c59b27] font-semibold">
                  <span>Giảm giá từ Voucher:</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-600">
                <span>Phí vận chuyển tiêu chuẩn:</span>
                <span className="font-semibold text-neutral-900">
                  {formatCurrency(phiShip)}
                </span>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-neutral-950 pt-3 border-t border-neutral-200">
                <span>Tổng Tiền Thanh Toán:</span>
                <span className="text-lg text-neutral-950 font-black">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>

            {orderError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{orderError}</span>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full bg-neutral-950 hover:bg-[#c59b27] hover:text-black text-white font-bold text-sm shadow-md transition-all active:scale-[0.99]"
              isLoading={isSubmitting}
            >
              Xác Nhận Đặt Hàng ({formatCurrency(finalTotal)})
            </Button>

            <div className="flex items-center justify-center gap-4 text-[10px] text-neutral-400 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#c59b27]" /> Bảo hành 12T
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#c59b27]" /> Đồng kiểm khi nhận
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
