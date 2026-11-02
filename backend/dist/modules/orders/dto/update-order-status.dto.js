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
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
export const ORDER_STATUSES = [
    'ChoXacNhan',
    'DangGiao',
    'DaGiao',
    'DaHuy',
];
export class UpdateOrderStatusDto {
    trangThai;
}
__decorate([
    ApiProperty({
        example: 'DangGiao',
        enum: ORDER_STATUSES,
        description: 'Trạng thái đơn hàng: ChoXacNhan, DangGiao, DaGiao, DaHuy',
    }),
    IsString({ message: 'trangThai phải là chuỗi ký tự' }),
    IsNotEmpty({ message: 'trangThai không được để trống' }),
    IsIn(ORDER_STATUSES, {
        message: 'trangThai chỉ được phép là một trong: ChoXacNhan, DangGiao, DaGiao, DaHuy',
    }),
    __metadata("design:type", String)
], UpdateOrderStatusDto.prototype, "trangThai", void 0);
//# sourceMappingURL=update-order-status.dto.js.map