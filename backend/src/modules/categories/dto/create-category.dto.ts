import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Đèn bàn thông minh',
    description: 'Tên danh mục sản phẩm (bắt buộc)',
  })
  @IsString({ message: 'tenDanhMuc phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'tenDanhMuc không được để trống' })
  tenDanhMuc: string;

  @ApiPropertyOptional({
    example: 'Các dòng đèn bàn làm việc và học tập bảo vệ thị lực',
    description: 'Mô tả chi tiết về danh mục',
  })
  @IsOptional()
  @IsString({ message: 'moTa phải là chuỗi ký tự' })
  moTa?: string;
}
