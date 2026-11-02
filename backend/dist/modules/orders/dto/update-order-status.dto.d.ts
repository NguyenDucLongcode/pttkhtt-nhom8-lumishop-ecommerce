export declare const ORDER_STATUSES: readonly ["ChoXacNhan", "DangGiao", "DaGiao", "DaHuy"];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export declare class UpdateOrderStatusDto {
    trangThai: OrderStatus;
}
