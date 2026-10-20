import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { OrderItemDto } from './order-item.dto.js';

export type PaymentMethod = 'COD' | 'ChuyenKhoan' | 'ViDienTu';

export class CreateOrderDto {
  @ApiProperty({
    example: 'KH001',
    description: 'Mã khách hàng đặt hàng (bắt buộc)',
  })
  @IsString({ message: 'maKH phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'maKH không được để trống' })
  maKH: string;

  @ApiProperty({
    example: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
    description: 'Địa chỉ nhận hàng (bắt buộc)',
  })
  @IsString({ message: 'diaChiGiao phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'diaChiGiao không được để trống' })
  diaChiGiao: string;

  @ApiProperty({
    example: 'COD',
    enum: ['COD', 'ChuyenKhoan', 'ViDienTu'],
    description: 'Phương thức thanh toán: COD, ChuyenKhoan hoặc ViDienTu',
  })
  @IsIn(['COD', 'ChuyenKhoan', 'ViDienTu'], {
    message: 'phuongThucTT phải là một trong: COD, ChuyenKhoan, ViDienTu',
  })
  phuongThucTT: PaymentMethod;

  @ApiProperty({
    type: [OrderItemDto],
    description: 'Danh sách sản phẩm đặt mua',
  })
  @IsArray({ message: 'items phải là một mảng sản phẩm' })
  @ArrayNotEmpty({ message: 'items không được rỗng' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({
    example: 'LUMI10',
    description: 'Mã giảm giá voucher (nếu có)',
  })
  @IsOptional()
  @IsString({ message: 'voucherCode phải là chuỗi ký tự' })
  voucherCode?: string;

  @ApiProperty({
    example: 30000,
    description: 'Phí vận chuyển giao hàng (VNĐ)',
  })
  @IsNumber({}, { message: 'phiShip phải là số' })
  @Min(0, { message: 'phiShip không được âm' })
  phiShip: number;
}
