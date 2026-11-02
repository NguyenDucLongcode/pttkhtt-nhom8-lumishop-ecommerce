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
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, } from 'class-validator';
export class CreateProductDto {
    tenSP;
    moTa;
    giaBan;
    soLuongTon;
    hinhAnh;
    categoryId;
    trangThai;
}
__decorate([
    ApiProperty({ example: 'Đèn bàn LED chống cận Lumi', description: 'Tên sản phẩm' }),
    IsString({ message: 'tenSP phải là chuỗi ký tự' }),
    IsNotEmpty({ message: 'tenSP không được để trống' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "tenSP", void 0);
__decorate([
    ApiProperty({
        example: 'Đèn bàn LED bảo vệ mắt với 3 chế độ ánh sáng',
        description: 'Mô tả sản phẩm',
    }),
    IsString({ message: 'moTa phải là chuỗi ký tự' }),
    IsNotEmpty({ message: 'moTa không được để trống' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "moTa", void 0);
__decorate([
    ApiProperty({ example: 450000, description: 'Giá bán (VNĐ)' }),
    IsNumber({}, { message: 'giaBan phải là số' }),
    Min(0, { message: 'giaBan không được âm' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "giaBan", void 0);
__decorate([
    ApiProperty({ example: 50, description: 'Số lượng tồn kho' }),
    IsInt({ message: 'soLuongTon phải là số nguyên' }),
    Min(0, { message: 'soLuongTon không được âm' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "soLuongTon", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'https://picsum.photos/seed/SP001/400/400',
        description: 'Đường dẫn hình ảnh',
    }),
    IsOptional(),
    IsString({ message: 'hinhAnh phải là chuỗi ký tự' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "hinhAnh", void 0);
__decorate([
    ApiPropertyOptional({ example: 'DM001', description: 'Mã danh mục sản phẩm' }),
    IsOptional(),
    IsString({ message: 'categoryId phải là chuỗi ký tự' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "categoryId", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'DangBan',
        description: 'Trạng thái: DangBan | NgungBan',
    }),
    IsOptional(),
    IsString({ message: 'trangThai phải là chuỗi ký tự' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "trangThai", void 0);
//# sourceMappingURL=create-product.dto.js.map