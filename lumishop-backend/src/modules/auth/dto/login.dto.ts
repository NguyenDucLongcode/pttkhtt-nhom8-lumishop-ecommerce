import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'vanan99',
    description: 'Tên đăng nhập',
  })
  @IsString({ message: 'tenDangNhap phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'tenDangNhap không được để trống' })
  tenDangNhap: string;

  @ApiProperty({
    example: '123456',
    description: 'Mật khẩu tài khoản',
  })
  @IsString({ message: 'matKhau phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'matKhau không được để trống' })
  matKhau: string;
}
