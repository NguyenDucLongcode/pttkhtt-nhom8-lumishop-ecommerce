var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
import { ConflictException, Injectable, Logger, UnauthorizedException, } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import bcrypt from 'bcrypt';
import { DbService } from '../../database/db.service.js';
import { JWT_REFRESH_SECRET, JWT_SECRET, } from './jwt.strategy.js';
let AuthService = AuthService_1 = class AuthService {
    dbService;
    jwtService;
    logger = new Logger(AuthService_1.name);
    constructor(dbService, jwtService) {
        this.dbService = dbService;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const customers = await this.dbService.getData('customers');
        const normalizedUsername = dto.tenDangNhap.trim().toLowerCase();
        const normalizedEmail = dto.email.trim().toLowerCase();
        if (customers.some((c) => c.tenDangNhap.toLowerCase() === normalizedUsername)) {
            throw new ConflictException(`Tên đăng nhập "${dto.tenDangNhap}" đã tồn tại trong hệ thống`);
        }
        if (customers.some((c) => c.email.toLowerCase() === normalizedEmail)) {
            throw new ConflictException(`Email "${dto.email}" đã được đăng ký bởi tài khoản khác`);
        }
        const hashedPassword = await bcrypt.hash(dto.matKhau, 10);
        const now = new Date().toISOString();
        const newCustomer = {
            id: `KH${Date.now()}`,
            hoTen: dto.hoTen.trim(),
            email: normalizedEmail,
            sdt: dto.sdt.trim(),
            tenDangNhap: dto.tenDangNhap.trim(),
            matKhau: hashedPassword,
            role: 'user',
            diaChi: '',
            createdAt: now,
            updatedAt: now,
        };
        customers.push(newCustomer);
        await this.dbService.saveData('customers', customers);
        this.logger.log(` Đăng ký thành công tài khoản: ${newCustomer.tenDangNhap}`);
        const { matKhau: _, ...safeUser } = newCustomer;
        return { ...safeUser, role: safeUser.role || 'user' };
    }
    async validateUser(username, pass) {
        const customers = await this.dbService.getData('customers');
        const normalizedUsername = username.trim().toLowerCase();
        const customer = customers.find((c) => c.tenDangNhap.toLowerCase() === normalizedUsername);
        if (!customer) {
            return null;
        }
        let isMatch = false;
        if (customer.matKhau === pass) {
            isMatch = true;
        }
        else {
            try {
                isMatch = await bcrypt.compare(pass, customer.matKhau);
            }
            catch {
                isMatch = false;
            }
        }
        if (!isMatch) {
            return null;
        }
        const { matKhau: _, ...safeUser } = customer;
        return { ...safeUser, role: safeUser.role || 'user' };
    }
    async login(user) {
        const accessPayload = {
            sub: user.id,
            username: user.tenDangNhap,
            role: user.role || 'user',
        };
        const refreshPayload = {
            sub: user.id,
            username: user.tenDangNhap,
            jti: crypto.randomUUID(),
        };
        const accessToken = await this.jwtService.signAsync(accessPayload, {
            secret: JWT_SECRET,
            expiresIn: '15m',
        });
        const refreshToken = await this.jwtService.signAsync(refreshPayload, {
            secret: JWT_REFRESH_SECRET,
            expiresIn: '7d',
        });
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const tokens = await this.dbService.getData('refresh_tokens');
        tokens.push({
            token: refreshToken,
            userId: user.id,
            expiresAt,
        });
        await this.dbService.saveData('refresh_tokens', tokens);
        this.logger.log(` Người dùng ${user.tenDangNhap} đăng nhập thành công`);
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user,
        };
    }
    async refreshTokens(refreshToken) {
        const tokens = await this.dbService.getData('refresh_tokens');
        const tokenIndex = tokens.findIndex((t) => t.token === refreshToken);
        if (tokenIndex === -1) {
            throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã bị thu hồi');
        }
        const tokenRecord = tokens[tokenIndex];
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: JWT_REFRESH_SECRET,
            });
        }
        catch {
            tokens.splice(tokenIndex, 1);
            await this.dbService.saveData('refresh_tokens', tokens);
            throw new UnauthorizedException('Refresh token đã hết hạn hoặc không hợp lệ');
        }
        if (new Date(tokenRecord.expiresAt) < new Date()) {
            tokens.splice(tokenIndex, 1);
            await this.dbService.saveData('refresh_tokens', tokens);
            throw new UnauthorizedException('Refresh token đã hết hạn sử dụng');
        }
        const customers = await this.dbService.getData('customers');
        const customer = customers.find((c) => c.id === tokenRecord.userId || c.id === payload.sub);
        if (!customer) {
            tokens.splice(tokenIndex, 1);
            await this.dbService.saveData('refresh_tokens', tokens);
            throw new UnauthorizedException('Tài khoản người dùng liên kết không còn tồn tại');
        }
        const { matKhau: _, ...safeUser } = customer;
        const cleanUser = { ...safeUser, role: safeUser.role || 'user' };
        tokens.splice(tokenIndex, 1);
        const accessPayload = {
            sub: cleanUser.id,
            username: cleanUser.tenDangNhap,
            role: cleanUser.role,
        };
        const refreshPayload = {
            sub: cleanUser.id,
            username: cleanUser.tenDangNhap,
            jti: crypto.randomUUID(),
        };
        const newAccessToken = await this.jwtService.signAsync(accessPayload, {
            secret: JWT_SECRET,
            expiresIn: '15m',
        });
        const newRefreshToken = await this.jwtService.signAsync(refreshPayload, {
            secret: JWT_REFRESH_SECRET,
            expiresIn: '7d',
        });
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        tokens.push({
            token: newRefreshToken,
            userId: cleanUser.id,
            expiresAt,
        });
        await this.dbService.saveData('refresh_tokens', tokens);
        this.logger.log(` Rotate refresh token thành công cho: ${cleanUser.tenDangNhap}`);
        return {
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            user: cleanUser,
        };
    }
    async logout(refreshToken) {
        const tokens = await this.dbService.getData('refresh_tokens');
        const filtered = tokens.filter((t) => t.token !== refreshToken);
        await this.dbService.saveData('refresh_tokens', filtered);
        this.logger.log(` Đã thu hồi refresh token và đăng xuất`);
        return {
            success: true,
            message: 'Đăng xuất thành công, refresh token đã được thu hồi',
        };
    }
};
AuthService = AuthService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [DbService,
        JwtService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map