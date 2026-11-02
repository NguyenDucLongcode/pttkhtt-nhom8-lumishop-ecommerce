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
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
export class AddToCartDto {
    maSP;
    soLuong;
}
__decorate([
    ApiProperty({
        example: 'SP001',
        description: 'Mã sản phẩm muốn thêm vào giỏ hàng',
    }),
    IsString({ message: 'maSP phải là chuỗi ký tự' }),
    IsNotEmpty({ message: 'maSP không được để trống' }),
    __metadata("design:type", String)
], AddToCartDto.prototype, "maSP", void 0);
__decorate([
    ApiProperty({
        example: 1,
        description: 'Số lượng thêm vào giỏ hàng (tối thiểu là 1)',
        minimum: 1,
    }),
    IsNumber({}, { message: 'soLuong phải là số' }),
    Min(1, { message: 'soLuong phải lớn hơn hoặc bằng 1' }),
    __metadata("design:type", Number)
], AddToCartDto.prototype, "soLuong", void 0);
//# sourceMappingURL=add-to-cart.dto.js.map