var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
export class OrderItemDto {
    maSP;
    soLuong;
}
__decorate([
    ApiProperty({
        example: 'SP001',
        description: 'Mã sản phẩm khách hàng đặt mua',
    }),
    IsString({ message: 'maSP phải là chuỗi ký tự' }),
    IsNotEmpty({ message: 'maSP không được để trống' }),
    __metadata("design:type", String)
], OrderItemDto.prototype, "maSP", void 0);
__decorate([
    ApiProperty({
        example: 2,
        description: 'Số lượng mua (phải lớn hơn 0)',
    }),
    IsInt({ message: 'soLuong phải là số nguyên' }),
    Min(1, { message: 'soLuong phải tối thiểu là 1' }),
    __metadata("design:type", Number)
], OrderItemDto.prototype, "soLuong", void 0);
//# sourceMappingURL=order-item.dto.js.map