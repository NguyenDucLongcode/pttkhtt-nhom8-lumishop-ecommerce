import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class OrderItemDto {
  @ApiProperty({
    example: 'SP001',
    description: 'Mã sản phẩm khách hàng đặt mua',
  })
  @IsString({ message: 'maSP phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'maSP không được để trống' })
  maSP: string;

  @ApiProperty({
    example: 2,
    description: 'Số lượng mua (phải lớn hơn 0)',
  })
  @IsInt({ message: 'soLuong phải là số nguyên' })
  @Min(1, { message: 'soLuong phải tối thiểu là 1' })
  soLuong: number;
}
