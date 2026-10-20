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
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
export class QueryProductDto {
    page = 1;
    limit = 10;
    search;
    categoryId;
}
__decorate([
    ApiPropertyOptional({
        example: 1,
        default: 1,
        description: 'Số thứ tự trang (bắt đầu từ 1)',
    }),
    IsOptional(),
    Type(() => Number),
    IsInt({ message: 'page phải là số nguyên' }),
    Min(1, { message: 'page tối thiểu là 1' }),
    __metadata("design:type", Number)
], QueryProductDto.prototype, "page", void 0);
__decorate([
    ApiPropertyOptional({
        example: 10,
        default: 10,
        description: 'Số lượng sản phẩm trên một trang',
    }),
    IsOptional(),
    Type(() => Number),
    IsInt({ message: 'limit phải là số nguyên' }),
    Min(1, { message: 'limit tối thiểu là 1' }),
    __metadata("design:type", Number)
], QueryProductDto.prototype, "limit", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'đèn bàn',
        description: 'Từ khóa tìm kiếm theo tên, mô tả hoặc mã sản phẩm',
    }),
    IsOptional(),
    IsString({ message: 'search phải là chuỗi ký tự' }),
    __metadata("design:type", String)
], QueryProductDto.prototype, "search", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'DM001',
        description: 'Lọc sản phẩm theo mã danh mục',
    }),
    IsOptional(),
    IsString({ message: 'categoryId phải là chuỗi ký tự' }),
    __metadata("design:type", String)
], QueryProductDto.prototype, "categoryId", void 0);
//# sourceMappingURL=query-product.dto.js.map