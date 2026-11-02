import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCustomerDto } from './create-customer.dto.js';

/**
 * UpdateCustomerDto chỉ cho phép cập nhật thông tin cá nhân (hoTen, sdt, email, diaChi).
 * Không cho phép cập nhật tenDangNhap và matKhau qua API này.
 */
export class UpdateCustomerDto extends PartialType(
  OmitType(CreateCustomerDto, ['tenDangNhap', 'matKhau'] as const),
) {}
