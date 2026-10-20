import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export const ORDER_STATUSES = [
  'ChoXacNhan',
  'DangGiao',
  'DaGiao',
  'DaHuy',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export class UpdateOrderStatusDto {
  @ApiProperty({
    example: 'DangGiao',
    enum: ORDER_STATUSES,
    description: 'Trạng thái đơn hàng: ChoXacNhan, DangGiao, DaGiao, DaHuy',
  })
  @IsString({ message: 'trangThai phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'trangThai không được để trống' })
  @IsIn(ORDER_STATUSES, {
    message: 'trangThai chỉ được phép là một trong: ChoXacNhan, DangGiao, DaGiao, DaHuy',
  })
  trangThai: OrderStatus;
}
