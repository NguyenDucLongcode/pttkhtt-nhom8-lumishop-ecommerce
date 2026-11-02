import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from '../../database/db.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { QueryOrderDto } from './dto/query-order.dto.js';

export interface OrderItemDetail {
  maSP: string;
  tenSP: string;
  giaBan: number;
  soLuong: number;
  thanhTien: number;
}

export interface Order {
  id: string;
  maKH: string;
  diaChiGiao: string;
  phuongThucTT: string;
  items: OrderItemDetail[];
  tongTienHang: number;
  tienGiamGia: number;
  phiShip: number;
  tongTien: number;
  voucherCode?: string;
  ngayDat: string;
  trangThai: string;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  maDH: string;
  soTien: number;
  phuongThuc: string;
  thoiGian: string;
  trangThai: string;
}

export interface DailyRevenueItem {
  date: string;
  revenue: number;
}

export interface RevenueReportResult {
  totalRevenue: number;
  totalOrders: number;
  dailyRevenue: DailyRevenueItem[];
}

interface ProductItem {
  id: string;
  tenSP: string;
  giaBan: number;
  soLuongTon: number;
  [key: string]: any;
}

interface CustomerItem {
  id: string;
  hoTen: string;
  [key: string]: any;
}

interface VoucherItem {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  [key: string]: any;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly dbService: DbService) {}

  /**
   * Xử lý đặt hàng (Checkout) & Tính toán Hóa đơn tuần tự 8 bước
   */
  async checkout(dto: CreateOrderDto): Promise<Order> {
    const now = new Date();
    const nowIso = now.toISOString();

    // Bước 1: Kiểm tra Khách hàng (Gọi DbService đọc 'customers' xem maKH có tồn tại không)
    const customers = await this.dbService.getData<CustomerItem>('customers');
    const customer = customers.find((c) => c.id === dto.maKH);
    if (!customer) {
      throw new BadRequestException(
        `Khách hàng với mã "${dto.maKH}" không tồn tại`,
      );
    }

    // Bước 2: Kiểm tra Sản phẩm và Tồn kho
    const products = await this.dbService.getData<ProductItem>('products');

    // Gom số lượng yêu cầu theo từng maSP để kiểm tra chính xác nếu có trùng lặp
    const requestedQuantityMap = new Map<string, number>();
    for (const item of dto.items) {
      const current = requestedQuantityMap.get(item.maSP) || 0;
      requestedQuantityMap.set(item.maSP, current + item.soLuong);
    }

    for (const [maSP, totalQty] of requestedQuantityMap.entries()) {
      const product = products.find((p) => p.id === maSP);
      if (!product) {
        throw new BadRequestException(
          `Sản phẩm với mã "${maSP}" không tồn tại`,
        );
      }
      if (product.soLuongTon < totalQty) {
        throw new BadRequestException(
          `Sản phẩm ${product.tenSP || maSP} không đủ số lượng`,
        );
      }
    }

    // Bước 3: Tính tổng tiền hàng (Cộng giaBan * soLuong của tất cả sản phẩm)
    let tongTienHang = 0;
    const orderItems: OrderItemDetail[] = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.maSP)!;
      const giaBan = Number(product.giaBan) || 0;
      const thanhTien = giaBan * item.soLuong;
      tongTienHang += thanhTien;

      return {
        maSP: item.maSP,
        tenSP: product.tenSP,
        giaBan,
        soLuong: item.soLuong,
        thanhTien,
      };
    });

    // Bước 4: Áp dụng Voucher (nếu có)
    let tienGiamGia = 0;
    let appliedVoucherCode: string | undefined = undefined;

    if (dto.voucherCode && dto.voucherCode.trim().length > 0) {
      const cleanCode = dto.voucherCode.trim().toUpperCase();
      const vouchers = await this.dbService.getData<VoucherItem>('vouchers');
      const voucher = vouchers.find(
        (v) => v.code.toUpperCase() === cleanCode,
      );

      if (!voucher) {
        throw new BadRequestException(
          `Voucher với mã "${dto.voucherCode}" không tồn tại`,
        );
      }

      if (!voucher.isActive) {
        throw new BadRequestException('Voucher hiện tại đang ngưng áp dụng');
      }

      if (new Date(voucher.startDate) > now) {
        throw new BadRequestException('Voucher chưa đến thời gian áp dụng');
      }

      if (new Date(voucher.endDate) < now) {
        throw new BadRequestException('Voucher đã hết hạn sử dụng');
      }

      if (
        voucher.usageLimit !== undefined &&
        voucher.usedCount >= voucher.usageLimit
      ) {
        throw new BadRequestException('Voucher đã hết lượt sử dụng');
      }

      if (
        voucher.minOrderValue !== undefined &&
        tongTienHang < voucher.minOrderValue
      ) {
        throw new BadRequestException(
          `Đơn hàng chưa đạt giá trị tối thiểu (${voucher.minOrderValue}đ) để áp dụng voucher`,
        );
      }

      // Tính số tiền được giảm
      if (voucher.discountType === 'PERCENT') {
        let discount = (tongTienHang * voucher.discountValue) / 100;
        if (
          voucher.maxDiscountAmount !== undefined &&
          discount > voucher.maxDiscountAmount
        ) {
          discount = voucher.maxDiscountAmount;
        }
        tienGiamGia = discount;
      } else if (voucher.discountType === 'FIXED') {
        tienGiamGia = voucher.discountValue;
      }

      // Tiền giảm giá không được vượt quá tổng tiền hàng
      if (tienGiamGia > tongTienHang) {
        tienGiamGia = tongTienHang;
      }

      appliedVoucherCode = voucher.code;

      // Cập nhật số lần sử dụng của voucher
      const vIndex = vouchers.findIndex((v) => v.id === voucher.id);
      if (vIndex !== -1) {
        vouchers[vIndex].usedCount = (vouchers[vIndex].usedCount || 0) + 1;
        vouchers[vIndex].updatedAt = nowIso;
        await this.dbService.saveData('vouchers', vouchers);
      }
    }

    // Bước 5: Tính Tổng thanh toán cuối cùng: TongTien = Tổng tiền hàng - Tiền giảm giá + phiShip
    const phiShip = Number(dto.phiShip) || 0;
    const tongTien = Math.max(0, tongTienHang - tienGiamGia + phiShip);

    // Bước 6: Tạo Đơn hàng
    // Object Order mới với ID (dạng DH + timestamp), ngayDat (ngày hiện tại), trangThai: 'ChoXacNhan'
    const orderTimestamp = Date.now();
    const orderId = `DH${orderTimestamp}`;
    const paymentId = `TT${orderTimestamp}`;

    const newOrder: Order = {
      id: orderId,
      maKH: dto.maKH,
      diaChiGiao: dto.diaChiGiao.trim(),
      phuongThucTT: dto.phuongThucTT,
      items: orderItems,
      tongTienHang,
      tienGiamGia,
      phiShip,
      tongTien,
      voucherCode: appliedVoucherCode,
      ngayDat: nowIso,
      trangThai: 'ChoXacNhan',
      paymentId,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const orders = await this.dbService.getData<Order>('orders');
    orders.push(newOrder);
    await this.dbService.saveData('orders', orders);

    // Bước 7: Trừ tồn kho: Cập nhật lại soLuongTon của các sản phẩm trong file db.products.json
    for (const [maSP, qtyToDeduct] of requestedQuantityMap.entries()) {
      const pIndex = products.findIndex((p) => p.id === maSP);
      if (pIndex !== -1) {
        products[pIndex].soLuongTon = Math.max(
          0,
          products[pIndex].soLuongTon - qtyToDeduct,
        );
      }
    }
    await this.dbService.saveData('products', products);

    // Bước 8: Tạo bản ghi Thanh toán (dạng TT + timestamp) tương ứng với đơn hàng và lưu vào db.payments.json
    const newPayment: Payment = {
      id: paymentId,
      maDH: orderId,
      soTien: tongTien,
      phuongThuc: dto.phuongThucTT,
      thoiGian: nowIso,
      trangThai: dto.phuongThucTT === 'COD' ? 'ChoThanhToan' : 'ChoThanhToan',
    };

    const payments = await this.dbService.getData<Payment>('payments');
    payments.push(newPayment);
    await this.dbService.saveData('payments', payments);

    this.logger.log(
      ` Đơn hàng ${orderId} đã được tạo thành công cho khách hàng ${dto.maKH}. Tổng tiền: ${tongTien}đ`,
    );

    // Trả về thông tin đơn hàng vừa tạo
    return newOrder;
  }

  /**
   * Lấy danh sách đơn hàng, hỗ trợ lọc theo trạng thái
   */
  async findAll(query?: QueryOrderDto): Promise<Order[]> {
    const orders = await this.dbService.getData<Order>('orders');

    if (query?.trangThai && query.trangThai.trim().length > 0) {
      const filterStatus = query.trangThai.trim().toLowerCase();
      return orders.filter(
        (o) => o.trangThai && o.trangThai.toLowerCase() === filterStatus,
      );
    }

    return orders;
  }

  /**
   * Xem chi tiết 1 đơn hàng theo ID
   */
  async findOne(id: string): Promise<Order> {
    const orders = await this.dbService.getData<Order>('orders');
    const order = orders.find((o) => o.id === id);

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với ID "${id}"`);
    }

    return order;
  }

  /**
   * Cập nhật trạng thái đơn hàng (Dành cho Admin)
   * Nếu chuyển sang trạng thái 'DaHuy', hoàn lại số lượng tồn kho cho các sản phẩm
   */
  async updateStatus(id: string, status: string): Promise<Order> {
    const orders = await this.dbService.getData<Order>('orders');
    const index = orders.findIndex((o) => o.id === id);

    if (index === -1) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với ID "${id}"`);
    }

    const currentOrder = orders[index];
    const oldStatus = currentOrder.trangThai;

    // Nếu đơn hàng chuyển sang 'DaHuy' (và trước đó chưa bị hủy), hoàn lại số lượng tồn kho
    if (status === 'DaHuy' && oldStatus !== 'DaHuy') {
      const products = await this.dbService.getData<ProductItem>('products');
      if (currentOrder.items && Array.isArray(currentOrder.items)) {
        for (const item of currentOrder.items) {
          const pIndex = products.findIndex((p) => p.id === item.maSP);
          if (pIndex !== -1) {
            products[pIndex].soLuongTon += item.soLuong;
          }
        }
        await this.dbService.saveData('products', products);
        this.logger.log(
          ` Đã hoàn lại tồn kho cho các sản phẩm của đơn hàng bị hủy: ${id}`,
        );
      }
    }

    const updatedOrder: Order = {
      ...currentOrder,
      trangThai: status,
      updatedAt: new Date().toISOString(),
    };

    orders[index] = updatedOrder;
    await this.dbService.saveData('orders', orders);

    this.logger.log(
      ` Cập nhật trạng thái đơn hàng ${id}: ${oldStatus} -> ${status}`,
    );
    return updatedOrder;
  }

  /**
   * Báo cáo tổng hợp doanh thu các đơn hàng đã giao thành công ('DaGiao')
   * Gom nhóm doanh thu theo từng ngày để vẽ biểu đồ
   */
  async getRevenueReport(): Promise<RevenueReportResult> {
    const orders = await this.dbService.getData<Order>('orders');
    const deliveredOrders = orders.filter((o) => o.trangThai === 'DaGiao');

    const totalOrders = deliveredOrders.length;
    const totalRevenue = deliveredOrders.reduce(
      (sum, o) => sum + (Number(o.tongTien) || 0),
      0,
    );

    // Gom nhóm doanh thu theo từng ngày (YYYY-MM-DD)
    const dailyMap = new Map<string, number>();
    for (const order of deliveredOrders) {
      const rawDate = order.ngayDat || order.createdAt || new Date().toISOString();
      const dateStr = rawDate.slice(0, 10);
      const current = dailyMap.get(dateStr) || 0;
      dailyMap.set(dateStr, current + (Number(order.tongTien) || 0));
    }

    // Sắp xếp ngày tăng dần theo thời gian
    const dailyRevenue: DailyRevenueItem[] = Array.from(dailyMap.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, revenue]) => ({ date, revenue }));

    return {
      totalRevenue,
      totalOrders,
      dailyRevenue,
    };
  }

  /**
   * Lấy lịch sử đơn hàng của một khách hàng cụ thể (sắp xếp mới nhất trước)
   */
  async getOrderHistory(maKH: string): Promise<Order[]> {
    const orders = await this.dbService.getData<Order>('orders');
    const customerOrders = orders.filter((o) => o.maKH === maKH);

    customerOrders.sort((a, b) => {
      const timeA = new Date(a.ngayDat || a.createdAt || 0).getTime();
      const timeB = new Date(b.ngayDat || b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    return customerOrders;
  }
}
