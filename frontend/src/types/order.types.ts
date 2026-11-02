export type PaymentMethod = 'COD' | 'ChuyenKhoan' | 'ViDienTu'
export type OrderStatus = 'ChoXacNhan' | 'DangChuanBi' | 'DangGiao' | 'DaGiao' | 'DaHuy'

export interface OrderItemDetail {
  maSP: string
  tenSP: string
  giaBan: number
  soLuong: number
  thanhTien: number
}

export interface Order {
  id: string
  maKH: string
  diaChiGiao: string
  phuongThucTT: PaymentMethod
  items: OrderItemDetail[]
  tongTienHang: number
  tienGiamGia: number
  phiShip: number
  tongTien: number
  voucherCode?: string
  ngayDat?: string
  ngayTao?: string
  trangThai: OrderStatus
  paymentId?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItemDto {
  maSP: string
  soLuong: number
}

export interface CreateOrderDto {
  maKH: string
  diaChiGiao: string
  phuongThucTT: PaymentMethod
  items: OrderItemDto[]
  voucherCode?: string
  phiShip: number
}

export interface DailyRevenueItem {
  date: string
  revenue: number
}

export interface RevenueReportResult {
  totalRevenue: number
  totalOrders: number
  dailyRevenue: DailyRevenueItem[]
}
