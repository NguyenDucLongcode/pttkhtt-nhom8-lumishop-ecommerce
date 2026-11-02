import { OrderItemDto } from './order-item.dto.js';
export type PaymentMethod = 'COD' | 'ChuyenKhoan' | 'ViDienTu';
export declare class CreateOrderDto {
    maKH: string;
    diaChiGiao: string;
    phuongThucTT: PaymentMethod;
    items: OrderItemDto[];
    voucherCode?: string;
    phiShip: number;
}
