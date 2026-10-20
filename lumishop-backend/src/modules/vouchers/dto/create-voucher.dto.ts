import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateVoucherDto {
  @ApiProperty({
    example: 'LUMI10',
    description: 'Mã voucher (duy nhất, viết hoa)',
  })
  @IsString({ message: 'code phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'code không được để trống' })
  code: string;

  @ApiProperty({
    example: 'Giảm 10% tối đa 100.000đ cho đơn hàng từ 500.000đ',
    description: 'Mô tả chi tiết chương trình ưu đãi của voucher',
  })
  @IsString({ message: 'description phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'description không được để trống' })
  description: string;

  @ApiProperty({
    example: 'PERCENT',
    enum: ['PERCENT', 'FIXED'],
    description: 'Loại giảm giá: PERCENT (theo phần trăm) hoặc FIXED (số tiền cố định)',
  })
  @IsString({ message: 'discountType phải là chuỗi ký tự' })
  @IsIn(['PERCENT', 'FIXED'], {
    message: 'discountType phải là PERCENT hoặc FIXED',
  })
  discountType: 'PERCENT' | 'FIXED';

  @ApiProperty({
    example: 10,
    description: 'Giá trị giảm (nếu PERCENT thì là %, nếu FIXED thì là số tiền VNĐ)',
  })
  @IsNumber({}, { message: 'discountValue phải là số' })
  @IsPositive({ message: 'discountValue phải lớn hơn 0' })
  discountValue: number;

  @ApiPropertyOptional({
    example: 500000,
    default: 0,
    description: 'Giá trị đơn hàng tối thiểu để áp dụng voucher (VNĐ)',
  })
  @IsOptional()
  @IsNumber({}, { message: 'minOrderValue phải là số' })
  @Min(0, { message: 'minOrderValue không được âm' })
  minOrderValue?: number;

  @ApiPropertyOptional({
    example: 100000,
    description: 'Số tiền giảm tối đa (thường áp dụng cho loại PERCENT)',
  })
  @IsOptional()
  @IsNumber({}, { message: 'maxDiscountAmount phải là số' })
  @Min(0, { message: 'maxDiscountAmount không được âm' })
  maxDiscountAmount?: number;

  @ApiProperty({
    example: '2026-01-01T00:00:00.000Z',
    description: 'Thời gian bắt đầu áp dụng voucher (ISO 8601)',
  })
  @IsDateString({}, { message: 'startDate phải là định dạng ngày ISO 8601 hợp lệ' })
  startDate: string;

  @ApiProperty({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Thời gian kết thúc / hết hạn voucher (ISO 8601)',
  })
  @IsDateString({}, { message: 'endDate phải là định dạng ngày ISO 8601 hợp lệ' })
  endDate: string;

  @ApiPropertyOptional({
    example: 100,
    description: 'Giới hạn tổng số lượt sử dụng voucher',
  })
  @IsOptional()
  @IsNumber({}, { message: 'usageLimit phải là số' })
  @Min(1, { message: 'usageLimit tối thiểu là 1' })
  usageLimit?: number;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Trạng thái kích hoạt voucher (true: đang hoạt động, false: ngưng sử dụng)',
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive phải là boolean (true hoặc false)' })
  isActive?: boolean;
}
