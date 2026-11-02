var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, HttpCode, HttpStatus, Post, UnauthorizedException, } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { RegisterDto } from './dto/register.dto.js';
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async register(registerDto) {
        return this.authService.register(registerDto);
    }
    async login(loginDto) {
        const user = await this.authService.validateUser(loginDto.tenDangNhap, loginDto.matKhau);
        if (!user) {
            throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không chính xác');
        }
        return this.authService.login(user);
    }
    async refresh(refreshTokenDto) {
        return this.authService.refreshTokens(refreshTokenDto.refreshToken);
    }
    async logout(refreshTokenDto) {
        return this.authService.logout(refreshTokenDto.refreshToken);
    }
};
__decorate([
    Post('register'),
    ApiOperation({
        summary: 'Đăng ký tài khoản người dùng mới (Khách hàng)',
        description: 'Tạo tài khoản người dùng mới với vai trò mặc định là user và mật khẩu được băm an toàn bằng bcrypt.',
    }),
    ApiResponse({
        status: 201,
        description: 'Đăng ký tài khoản thành công.',
    }),
    ApiResponse({
        status: 409,
        description: 'Tên đăng nhập hoặc email đã tồn tại.',
    }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    Post('login'),
    HttpCode(HttpStatus.OK),
    ApiOperation({
        summary: 'Đăng nhập tài khoản',
        description: 'Xác thực tên đăng nhập và mật khẩu, trả về cặp access_token (15 phút) và refresh_token (7 ngày).',
    }),
    ApiResponse({
        status: 200,
        description: 'Đăng nhập thành công, trả về token và thông tin user.',
    }),
    ApiResponse({
        status: 401,
        description: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
    }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    Post('refresh'),
    HttpCode(HttpStatus.OK),
    ApiOperation({
        summary: 'Làm mới Access Token bằng Refresh Token (Token Rotation)',
        description: 'Gửi refresh_token còn hạn để nhận cặp access_token và refresh_token mới. Refresh token cũ sẽ bị hủy.',
    }),
    ApiResponse({
        status: 200,
        description: 'Cấp mới token thành công.',
    }),
    ApiResponse({
        status: 401,
        description: 'Refresh token không hợp lệ hoặc đã hết hạn.',
    }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    Post('logout'),
    HttpCode(HttpStatus.OK),
    ApiOperation({
        summary: 'Đăng xuất tài khoản',
        description: 'Thu hồi và xóa refresh_token khỏi database để ngăn chặn việc tiếp tục sử dụng.',
    }),
    ApiResponse({
        status: 200,
        description: 'Đăng xuất và thu hồi token thành công.',
    }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
AuthController = __decorate([
    ApiTags('Auth'),
    Public(),
    Controller('auth'),
    __metadata("design:paramtypes", [AuthService])
], AuthController);
export { AuthController };
//# sourceMappingURL=auth.controller.js.map