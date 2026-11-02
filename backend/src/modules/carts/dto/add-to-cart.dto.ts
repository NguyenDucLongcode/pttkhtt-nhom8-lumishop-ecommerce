import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({
    example: 'SP001',
    description: 'Mã sản phẩm muốn thêm vào giỏ hàng',
  })
  @IsString({ message: 'maSP phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'maSP không được để trống' })
  maSP: string;

  @ApiProperty({
    example: 1,
    description: 'Số lượng thêm vào giỏ hàng (tối thiểu là 1)',
    minimum: 1,
  })
  @IsNumber({}, { message: 'soLuong phải là số' })
  @Min(1, { message: 'soLuong phải lớn hơn hoặc bằng 1' })
  soLuong: number;
}
