import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import bcrypt from 'bcrypt';
import { DbService } from '../../database/db.service.js';
import { RegisterDto } from './dto/register.dto.js';
import {
  JWT_REFRESH_SECRET,
  JWT_SECRET,
} from './jwt.strategy.js';

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

interface CustomerRecord {
  id: string;
  hoTen: string;
  sdt: string;
  email: string;
  diaChi?: string;
  tenDangNhap: string;
  matKhau: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly dbService: DbService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Đăng ký tài khoản người dùng mới (Role mặc định: 'user')
   */
  async register(dto: RegisterDto): Promise<SafeUser> {
    const customers = await this.dbService.getData<CustomerRecord>('customers');
    const normalizedUsername = dto.tenDangNhap.trim().toLowerCase();
    const normalizedEmail = dto.email.trim().toLowerCase();

    // Kiểm tra trùng lặp tên đăng nhập
    if (
      customers.some(
        (c) => c.tenDangNhap.toLowerCase() === normalizedUsername,
      )
    ) {
      throw new ConflictException(
        `Tên đăng nhập "${dto.tenDangNhap}" đã tồn tại trong hệ thống`,
      );
    }

    // Kiểm tra trùng lặp email
    if (customers.some((c) => c.email.toLowerCase() === normalizedEmail)) {
      throw new ConflictException(
        `Email "${dto.email}" đã được đăng ký bởi tài khoản khác`,
      );
    }

    const hashedPassword = await bcrypt.hash(dto.matKhau, 10);
    const now = new Date().toISOString();

    const newCustomer: CustomerRecord = {
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

  /**
   * Xác thực thông tin đăng nhập của người dùng
   * Hỗ trợ mật khẩu đã hash bcrypt và mật khẩu plaintext mẫu để dễ test
   */
  async validateUser(username: string, pass: string): Promise<SafeUser | null> {
    const customers = await this.dbService.getData<CustomerRecord>('customers');
    const normalizedUsername = username.trim().toLowerCase();

    const customer = customers.find(
      (c) => c.tenDangNhap.toLowerCase() === normalizedUsername,
    );

    if (!customer) {
      return null;
    }

    let isMatch = false;
    // Kiểm tra trực tiếp plaintext (dành cho user mẫu)
    if (customer.matKhau === pass) {
      isMatch = true;
    } else {
      // Kiểm tra bằng bcrypt compare
      try {
        isMatch = await bcrypt.compare(pass, customer.matKhau);
      } catch {
        isMatch = false;
      }
    }

    if (!isMatch) {
      return null;
    }

    const { matKhau: _, ...safeUser } = customer;
    return { ...safeUser, role: safeUser.role || 'user' };
  }

  /**
   * Đăng nhập và tạo bộ đôi Access Token (15m) + Refresh Token (7d)
   */
  async login(user: SafeUser): Promise<AuthResponse> {
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

    // Tính thời gian hết hạn sau 7 ngày
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    // Lưu refresh token vào db.refresh_tokens.json
    const tokens =
      await this.dbService.getData<RefreshTokenRecord>('refresh_tokens');
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

  /**
   * Cấp mới cặp token qua Refresh Token (Rotate token)
   */
  async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    const tokens =
      await this.dbService.getData<RefreshTokenRecord>('refresh_tokens');
    const tokenIndex = tokens.findIndex((t) => t.token === refreshToken);

    if (tokenIndex === -1) {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã bị thu hồi',
      );
    }

    const tokenRecord = tokens[tokenIndex];

    // Kiểm tra tính hợp lệ và hạn của token bằng JwtService
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: JWT_REFRESH_SECRET,
      });
    } catch {
      // Xóa token không hợp lệ
      tokens.splice(tokenIndex, 1);
      await this.dbService.saveData('refresh_tokens', tokens);
      throw new UnauthorizedException(
        'Refresh token đã hết hạn hoặc không hợp lệ',
      );
    }

    // Kiểm tra thêm expiresAt
    if (new Date(tokenRecord.expiresAt) < new Date()) {
      tokens.splice(tokenIndex, 1);
      await this.dbService.saveData('refresh_tokens', tokens);
      throw new UnauthorizedException('Refresh token đã hết hạn sử dụng');
    }

    // Tìm thông tin khách hàng
    const customers = await this.dbService.getData<CustomerRecord>('customers');
    const customer = customers.find(
      (c) => c.id === tokenRecord.userId || c.id === payload.sub,
    );

    if (!customer) {
      tokens.splice(tokenIndex, 1);
      await this.dbService.saveData('refresh_tokens', tokens);
      throw new UnauthorizedException(
        'Tài khoản người dùng liên kết không còn tồn tại',
      );
    }

    const { matKhau: _, ...safeUser } = customer;
    const cleanUser: SafeUser = { ...safeUser, role: safeUser.role || 'user' };

    // Xóa token cũ (Rotate)
    tokens.splice(tokenIndex, 1);

    // Tạo cặp token mới
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

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

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

  /**
   * Đăng xuất và thu hồi Refresh Token
   */
  async logout(
    refreshToken: string,
  ): Promise<{ success: boolean; message: string }> {
    const tokens =
      await this.dbService.getData<RefreshTokenRecord>('refresh_tokens');
    const filtered = tokens.filter((t) => t.token !== refreshToken);

    await this.dbService.saveData('refresh_tokens', filtered);
    this.logger.log(` Đã thu hồi refresh token và đăng xuất`);

    return {
      success: true,
      message: 'Đăng xuất thành công, refresh token đã được thu hồi',
    };
  }
}
