import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { RegisterDto } from './dto/register.dto.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<import("./auth.service.js").SafeUser>;
    login(loginDto: LoginDto): Promise<import("./auth.service.js").AuthResponse>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<import("./auth.service.js").AuthResponse>;
    logout(refreshTokenDto: RefreshTokenDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
