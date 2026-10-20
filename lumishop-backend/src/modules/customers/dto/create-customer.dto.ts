import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    example: 'Nguyễn Văn An',
    description: 'Họ và tên khách hàng (bắt buộc)',
  })
  @IsString({ message: 'hoTen phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'hoTen không được để trống' })
  hoTen: string;

  @ApiProperty({
    example: '0987654321',
    description: 'Số điện thoại liên hệ (bắt buộc)',
  })
  @IsString({ message: 'sdt phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'sdt không được để trống' })
  sdt: string;

  @ApiProperty({
    example: 'vanan.nguyen@gmail.com',
    description: 'Địa chỉ email (phải đúng định dạng email)',
  })
  @IsEmail({}, { message: 'email phải đúng định dạng email hợp lệ' })
  @IsNotEmpty({ message: 'email không được để trống' })
  email: string;

  @ApiPropertyOptional({
    example: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
    description: 'Địa chỉ giao hàng',
  })
  @IsOptional()
  @IsString({ message: 'diaChi phải là chuỗi ký tự' })
  diaChi?: string;

  @ApiProperty({
    example: 'vanan99',
    description: 'Tên đăng nhập tài khoản (bắt buộc, duy nhất)',
  })
  @IsString({ message: 'tenDangNhap phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'tenDangNhap không được để trống' })
  tenDangNhap: string;

  @ApiProperty({
    example: 'P@ssword123',
    description: 'Mật khẩu tài khoản (bắt buộc)',
  })
  @IsString({ message: 'matKhau phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'matKhau không được để trống' })
  matKhau: string;
}
