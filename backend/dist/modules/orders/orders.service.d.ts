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
export declare class OrdersService {
    private readonly dbService;
    private readonly logger;
    constructor(dbService: DbService);
    checkout(dto: CreateOrderDto): Promise<Order>;
    findAll(query?: QueryOrderDto): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    updateStatus(id: string, status: string): Promise<Order>;
    getRevenueReport(): Promise<RevenueReportResult>;
    getOrderHistory(maKH: string): Promise<Order[]>;
}
