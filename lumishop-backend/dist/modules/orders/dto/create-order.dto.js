var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested, } from 'class-validator';
import { OrderItemDto } from './order-item.dto.js';
export class CreateOrderDto {
    maKH;
    diaChiGiao;
    phuongThucTT;
    items;
    voucherCode;
    phiShip;
}
__decorate([
    ApiProperty({
        example: 'KH001',
        description: 'Mã khách hàng đặt hàng (bắt buộc)',
    }),
    IsString({ message: 'maKH phải là chuỗi ký tự' }),
    IsNotEmpty({ message: 'maKH không được để trống' }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "maKH", void 0);
__decorate([
    ApiProperty({
        example: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
        description: 'Địa chỉ nhận hàng (bắt buộc)',
    }),
    IsString({ message: 'diaChiGiao phải là chuỗi ký tự' }),
    IsNotEmpty({ message: 'diaChiGiao không được để trống' }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "diaChiGiao", void 0);
__decorate([
    ApiProperty({
        example: 'COD',
        enum: ['COD', 'ChuyenKhoan', 'ViDienTu'],
        description: 'Phương thức thanh toán: COD, ChuyenKhoan hoặc ViDienTu',
    }),
    IsIn(['COD', 'ChuyenKhoan', 'ViDienTu'], {
        message: 'phuongThucTT phải là một trong: COD, ChuyenKhoan, ViDienTu',
    }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "phuongThucTT", void 0);
__decorate([
    ApiProperty({
        type: [OrderItemDto],
        description: 'Danh sách sản phẩm đặt mua',
    }),
    IsArray({ message: 'items phải là một mảng sản phẩm' }),
    ArrayNotEmpty({ message: 'items không được rỗng' }),
    ValidateNested({ each: true }),
    Type(() => OrderItemDto),
    __metadata("design:type", Array)
], CreateOrderDto.prototype, "items", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'LUMI10',
        description: 'Mã giảm giá voucher (nếu có)',
    }),
    IsOptional(),
    IsString({ message: 'voucherCode phải là chuỗi ký tự' }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "voucherCode", void 0);
__decorate([
    ApiProperty({
        example: 30000,
        description: 'Phí vận chuyển giao hàng (VNĐ)',
    }),
    IsNumber({}, { message: 'phiShip phải là số' }),
    Min(0, { message: 'phiShip không được âm' }),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "phiShip", void 0);
//# sourceMappingURL=create-order.dto.js.map