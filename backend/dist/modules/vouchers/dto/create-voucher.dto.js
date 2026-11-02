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
import { IsBoolean, IsDateString, IsIn, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min, } from 'class-validator';
export class CreateVoucherDto {
    code;
    description;
    discountType;
    discountValue;
    minOrderValue;
    maxDiscountAmount;
    startDate;
    endDate;
    usageLimit;
    isActive;
}
__decorate([
    ApiProperty({
        example: 'LUMI10',
        description: 'Mã voucher (duy nhất, viết hoa)',
    }),
    IsString({ message: 'code phải là chuỗi ký tự' }),
    IsNotEmpty({ message: 'code không được để trống' }),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "code", void 0);
__decorate([
    ApiProperty({
        example: 'Giảm 10% tối đa 100.000đ cho đơn hàng từ 500.000đ',
        description: 'Mô tả chi tiết chương trình ưu đãi của voucher',
    }),
    IsString({ message: 'description phải là chuỗi ký tự' }),
    IsNotEmpty({ message: 'description không được để trống' }),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "description", void 0);
__decorate([
    ApiProperty({
        example: 'PERCENT',
        enum: ['PERCENT', 'FIXED'],
        description: 'Loại giảm giá: PERCENT (theo phần trăm) hoặc FIXED (số tiền cố định)',
    }),
    IsString({ message: 'discountType phải là chuỗi ký tự' }),
    IsIn(['PERCENT', 'FIXED'], {
        message: 'discountType phải là PERCENT hoặc FIXED',
    }),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "discountType", void 0);
__decorate([
    ApiProperty({
        example: 10,
        description: 'Giá trị giảm (nếu PERCENT thì là %, nếu FIXED thì là số tiền VNĐ)',
    }),
    IsNumber({}, { message: 'discountValue phải là số' }),
    IsPositive({ message: 'discountValue phải lớn hơn 0' }),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "discountValue", void 0);
__decorate([
    ApiPropertyOptional({
        example: 500000,
        default: 0,
        description: 'Giá trị đơn hàng tối thiểu để áp dụng voucher (VNĐ)',
    }),
    IsOptional(),
    IsNumber({}, { message: 'minOrderValue phải là số' }),
    Min(0, { message: 'minOrderValue không được âm' }),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "minOrderValue", void 0);
__decorate([
    ApiPropertyOptional({
        example: 100000,
        description: 'Số tiền giảm tối đa (thường áp dụng cho loại PERCENT)',
    }),
    IsOptional(),
    IsNumber({}, { message: 'maxDiscountAmount phải là số' }),
    Min(0, { message: 'maxDiscountAmount không được âm' }),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "maxDiscountAmount", void 0);
__decorate([
    ApiProperty({
        example: '2026-01-01T00:00:00.000Z',
        description: 'Thời gian bắt đầu áp dụng voucher (ISO 8601)',
    }),
    IsDateString({}, { message: 'startDate phải là định dạng ngày ISO 8601 hợp lệ' }),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "startDate", void 0);
__decorate([
    ApiProperty({
        example: '2026-12-31T23:59:59.000Z',
        description: 'Thời gian kết thúc / hết hạn voucher (ISO 8601)',
    }),
    IsDateString({}, { message: 'endDate phải là định dạng ngày ISO 8601 hợp lệ' }),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "endDate", void 0);
__decorate([
    ApiPropertyOptional({
        example: 100,
        description: 'Giới hạn tổng số lượt sử dụng voucher',
    }),
    IsOptional(),
    IsNumber({}, { message: 'usageLimit phải là số' }),
    Min(1, { message: 'usageLimit tối thiểu là 1' }),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "usageLimit", void 0);
__decorate([
    ApiPropertyOptional({
        example: true,
        default: true,
        description: 'Trạng thái kích hoạt voucher (true: đang hoạt động, false: ngưng sử dụng)',
    }),
    IsOptional(),
    IsBoolean({ message: 'isActive phải là boolean (true hoặc false)' }),
    __metadata("design:type", Boolean)
], CreateVoucherDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-voucher.dto.js.map