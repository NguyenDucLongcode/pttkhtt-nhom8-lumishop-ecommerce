import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryCustomerDto {
  @ApiPropertyOptional({
    example: 'An',
    description: 'Từ khóa tìm kiếm theo Họ tên hoặc Số điện thoại (search)',
  })
  @IsOptional()
  @IsString({ message: 'search phải là chuỗi ký tự' })
  search?: string;
}
