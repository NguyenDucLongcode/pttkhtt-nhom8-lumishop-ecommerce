import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryProductDto {
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
    description: 'Số lượng sản phẩm trên một trang',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit phải là số nguyên' })
  @Min(1, { message: 'limit tối thiểu là 1' })
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'đèn bàn',
    description: 'Từ khóa tìm kiếm theo tên, mô tả hoặc mã sản phẩm',
  })
  @IsOptional()
  @IsString({ message: 'search phải là chuỗi ký tự' })
  search?: string;

  @ApiPropertyOptional({
    example: 'DM001',
    description: 'Lọc sản phẩm theo mã danh mục',
  })
  @IsOptional()
  @IsString({ message: 'categoryId phải là chuỗi ký tự' })
  categoryId?: string;
}
