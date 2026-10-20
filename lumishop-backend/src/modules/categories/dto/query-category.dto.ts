import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryCategoryDto {
  @ApiPropertyOptional({
    example: 'Đèn bàn',
    description: 'Từ khóa tìm kiếm theo tên danh mục (search)',
  })
  @IsOptional()
  @IsString({ message: 'search phải là chuỗi ký tự' })
  search?: string;
}
