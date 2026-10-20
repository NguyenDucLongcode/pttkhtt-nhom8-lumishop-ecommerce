import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Họ và tên người đăng ký',
  })
  @IsString({ message: 'hoTen phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'hoTen không được để trống' })
  hoTen: string;

  @ApiProperty({
    example: 'user@lumishop.vn',
    description: 'Địa chỉ email người dùng',
  })
  @IsEmail({}, { message: 'email phải đúng định dạng email hợp lệ' })
  @IsNotEmpty({ message: 'email không được để trống' })
  email: string;

  @ApiProperty({
    example: '0988776655',
    description: 'Số điện thoại liên hệ',
  })
  @IsString({ message: 'sdt phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'sdt không được để trống' })
  sdt: string;

  @ApiProperty({
    example: 'nguyenvana',
    description: 'Tên đăng nhập (duy nhất)',
  })
  @IsString({ message: 'tenDangNhap phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'tenDangNhap không được để trống' })
  tenDangNhap: string;

  @ApiProperty({
    example: '123456',
    description: 'Mật khẩu tài khoản (tối thiểu 6 ký tự)',
  })
  @IsString({ message: 'matKhau phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'matKhau không được để trống' })
  @MinLength(6, { message: 'matKhau phải có ít nhất 6 ký tự' })
  matKhau: string;
}
