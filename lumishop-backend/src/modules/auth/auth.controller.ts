import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@ApiTags('Auth')
@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Đăng ký tài khoản người dùng mới (Khách hàng)',
    description:
      'Tạo tài khoản người dùng mới với vai trò mặc định là user và mật khẩu được băm an toàn bằng bcrypt.',
  })
  @ApiResponse({
    status: 201,
    description: 'Đăng ký tài khoản thành công.',
  })
  @ApiResponse({
    status: 409,
    description: 'Tên đăng nhập hoặc email đã tồn tại.',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng nhập tài khoản',
    description:
      'Xác thực tên đăng nhập và mật khẩu, trả về cặp access_token (15 phút) và refresh_token (7 ngày).',
  })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công, trả về token và thông tin user.',
  })
  @ApiResponse({
    status: 401,
    description: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
  })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.tenDangNhap,
      loginDto.matKhau,
    );

    if (!user) {
      throw new UnauthorizedException(
        'Tên đăng nhập hoặc mật khẩu không chính xác',
      );
    }

    return this.authService.login(user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Làm mới Access Token bằng Refresh Token (Token Rotation)',
    description:
      'Gửi refresh_token còn hạn để nhận cặp access_token và refresh_token mới. Refresh token cũ sẽ bị hủy.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cấp mới token thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token không hợp lệ hoặc đã hết hạn.',
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng xuất tài khoản',
    description:
      'Thu hồi và xóa refresh_token khỏi database để ngăn chặn việc tiếp tục sử dụng.',
  })
  @ApiResponse({
    status: 200,
    description: 'Đăng xuất và thu hồi token thành công.',
  })
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }
}
