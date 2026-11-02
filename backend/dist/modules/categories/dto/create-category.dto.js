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
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class CreateCategoryDto {
    tenDanhMuc;
    moTa;
}
__decorate([
    ApiProperty({
        example: 'Đèn bàn thông minh',
        description: 'Tên danh mục sản phẩm (bắt buộc)',
    }),
    IsString({ message: 'tenDanhMuc phải là chuỗi ký tự' }),
    IsNotEmpty({ message: 'tenDanhMuc không được để trống' }),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "tenDanhMuc", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'Các dòng đèn bàn làm việc và học tập bảo vệ thị lực',
        description: 'Mô tả chi tiết về danh mục',
    }),
    IsOptional(),
    IsString({ message: 'moTa phải là chuỗi ký tự' }),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "moTa", void 0);
//# sourceMappingURL=create-category.dto.js.map