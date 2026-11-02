import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryVoucherDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Số thứ tự trang (bắt đầu từ 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page phải là số nguyên' })
  @Min(1, { message: 'page tối thiểu là 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    description: 'Số lượng voucher trên một trang',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit phải là số nguyên' })
  @Min(1, { message: 'limit tối thiểu là 1' })
  limit?: number = 10;

  @ApiPropertyOptional({
    example: true,
    description: 'Lọc voucher theo trạng thái hoạt động (true hoặc false)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1') return true;
    if (value === 'false' || value === false || value === 0 || value === '0') return false;
    return value;
  })
  @IsBoolean({ message: 'isActive phải là boolean (true hoặc false)' })
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 'LUMI',
    description: 'Tìm kiếm gần đúng theo mã voucher (code)',
  })
  @IsOptional()
  @IsString({ message: 'code phải là chuỗi ký tự' })
  code?: string;
}
