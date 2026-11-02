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
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
export class QueryVoucherDto {
    page = 1;
    limit = 10;
    isActive;
    code;
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
], QueryVoucherDto.prototype, "page", void 0);
__decorate([
    ApiPropertyOptional({
        example: 10,
        default: 10,
        description: 'Số lượng voucher trên một trang',
    }),
    IsOptional(),
    Type(() => Number),
    IsInt({ message: 'limit phải là số nguyên' }),
    Min(1, { message: 'limit tối thiểu là 1' }),
    __metadata("design:type", Number)
], QueryVoucherDto.prototype, "limit", void 0);
__decorate([
    ApiPropertyOptional({
        example: true,
        description: 'Lọc voucher theo trạng thái hoạt động (true hoặc false)',
    }),
    IsOptional(),
    Transform(({ value }) => {
        if (value === 'true' || value === true || value === 1 || value === '1')
            return true;
        if (value === 'false' || value === false || value === 0 || value === '0')
            return false;
        return value;
    }),
    IsBoolean({ message: 'isActive phải là boolean (true hoặc false)' }),
    __metadata("design:type", Boolean)
], QueryVoucherDto.prototype, "isActive", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'LUMI',
        description: 'Tìm kiếm gần đúng theo mã voucher (code)',
    }),
    IsOptional(),
    IsString({ message: 'code phải là chuỗi ký tự' }),
    __metadata("design:type", String)
], QueryVoucherDto.prototype, "code", void 0);
//# sourceMappingURL=query-voucher.dto.js.map