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
export class ProductDto {
    id;
    tenSP;
    moTa;
    giaBan;
    soLuongTon;
    hinhAnh;
    categoryId;
    trangThai;
}
__decorate([
    ApiProperty({ example: 'SP001', description: 'Mã định danh sản phẩm' }),
    __metadata("design:type", String)
], ProductDto.prototype, "id", void 0);
__decorate([
    ApiProperty({ example: 'Đèn bàn thông minh Lumi Smart Desk Lamp Pro', description: 'Tên sản phẩm' }),
    __metadata("design:type", String)
], ProductDto.prototype, "tenSP", void 0);
__decorate([
    ApiProperty({ example: 'Đèn bàn bảo vệ mắt điều khiển qua ứng dụng và giọng nói', description: 'Mô tả sản phẩm' }),
    __metadata("design:type", String)
], ProductDto.prototype, "moTa", void 0);
__decorate([
    ApiProperty({ example: 550000, description: 'Giá bán của sản phẩm (VNĐ)' }),
    __metadata("design:type", Number)
], ProductDto.prototype, "giaBan", void 0);
__decorate([
    ApiProperty({ example: 40, description: 'Số lượng tồn kho' }),
    __metadata("design:type", Number)
], ProductDto.prototype, "soLuongTon", void 0);
__decorate([
    ApiProperty({ example: 'https://picsum.photos/seed/SP001/400/400', description: 'Đường dẫn hình ảnh' }),
    __metadata("design:type", String)
], ProductDto.prototype, "hinhAnh", void 0);
__decorate([
    ApiPropertyOptional({ example: 'DM001', description: 'Mã danh mục sản phẩm' }),
    __metadata("design:type", String)
], ProductDto.prototype, "categoryId", void 0);
__decorate([
    ApiProperty({ example: 'DangBan', description: 'Trạng thái kinh doanh sản phẩm' }),
    __metadata("design:type", String)
], ProductDto.prototype, "trangThai", void 0);
//# sourceMappingURL=product.dto.js.map