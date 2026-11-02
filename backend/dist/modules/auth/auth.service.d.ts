import { JwtService } from '@nestjs/jwt';
import { DbService } from '../../database/db.service.js';
import { RegisterDto } from './dto/register.dto.js';
export interface SafeUser {
    id: string;
    hoTen: string;
    email: string;
    sdt: string;
    diaChi?: string;
    tenDangNhap: string;
    role: string;
    createdAt?: string;
    updatedAt?: string;
}
export interface RefreshTokenRecord {
    token: string;
    userId: string;
    expiresAt: string;
}
export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: SafeUser;
}
export declare class AuthService {
    private readonly dbService;
    private readonly jwtService;
    private readonly logger;
    constructor(dbService: DbService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<SafeUser>;
    validateUser(username: string, pass: string): Promise<SafeUser | null>;
    login(user: SafeUser): Promise<AuthResponse>;
    refreshTokens(refreshToken: string): Promise<AuthResponse>;
    logout(refreshToken: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
