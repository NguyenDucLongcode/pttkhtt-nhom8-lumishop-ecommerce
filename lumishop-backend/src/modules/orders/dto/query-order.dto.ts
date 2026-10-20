import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryOrderDto {
  @ApiPropertyOptional({
    example: 'ChoXacNhan',
    description: 'Lọc danh sách theo trạng thái đơn hàng (ví dụ: ChoXacNhan, DangGiao, HoanThanh, DaHuy)',
  })
  @IsOptional()
  @IsString({ message: 'trangThai phải là chuỗi ký tự' })
  trangThai?: string;
}
