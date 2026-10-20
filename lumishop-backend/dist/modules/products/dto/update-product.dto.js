var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
export class UpdateProductDto {
    tenSP;
    moTa;
    giaBan;
    soLuongTon;
    hinhAnh;
    categoryId;
    trangThai;
}
__decorate([
    ApiPropertyOptional({
        example: 'Đèn bàn LED chống cận Lumi V2',
        description: 'Tên sản phẩm',
    }),
    IsOptional(),
    IsString({ message: 'tenSP phải là chuỗi ký tự' }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "tenSP", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'Đèn bàn LED nâng cấp bảo vệ mắt',
        description: 'Mô tả sản phẩm',
    }),
    IsOptional(),
    IsString({ message: 'moTa phải là chuỗi ký tự' }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "moTa", void 0);
__decorate([
    ApiPropertyOptional({ example: 550000, description: 'Giá bán (VNĐ)' }),
    IsOptional(),
    IsNumber({}, { message: 'giaBan phải là số' }),
    Min(0, { message: 'giaBan không được âm' }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "giaBan", void 0);
__decorate([
    ApiPropertyOptional({ example: 30, description: 'Số lượng tồn kho' }),
    IsOptional(),
    IsInt({ message: 'soLuongTon phải là số nguyên' }),
    Min(0, { message: 'soLuongTon không được âm' }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "soLuongTon", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'https://picsum.photos/seed/SP001/400/400',
        description: 'Đường dẫn hình ảnh',
    }),
    IsOptional(),
    IsString({ message: 'hinhAnh phải là chuỗi ký tự' }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "hinhAnh", void 0);
__decorate([
    ApiPropertyOptional({ example: 'DM001', description: 'Mã danh mục sản phẩm' }),
    IsOptional(),
    IsString({ message: 'categoryId phải là chuỗi ký tự' }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "categoryId", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'NgungBan',
        description: 'Trạng thái: DangBan | NgungBan',
    }),
    IsOptional(),
    IsString({ message: 'trangThai phải là chuỗi ký tự' }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "trangThai", void 0);
//# sourceMappingURL=update-product.dto.js.map