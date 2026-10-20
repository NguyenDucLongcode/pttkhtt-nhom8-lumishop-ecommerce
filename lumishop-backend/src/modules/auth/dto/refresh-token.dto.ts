import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token hợp lệ đã nhận khi đăng nhập',
  })
  @IsString({ message: 'refreshToken phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'refreshToken không được để trống' })
  refreshToken: string;
}
