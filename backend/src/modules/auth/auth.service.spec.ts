import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DbService } from '../../database/db.service.js';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';

describe('AuthService', () => {
  let service: AuthService;
  let mockDbService: {
    getData: ReturnType<typeof vi.fn>;
    saveData: ReturnType<typeof vi.fn>;
  };
  let jwtService: JwtService;

  const sampleHashedPassword = bcrypt.hashSync('123456', 10);

  const sampleCustomers = [
    {
      id: 'KH001',
      hoTen: 'Nguyễn Văn An',
      sdt: '0987654321',
      email: 'vanan@gmail.com',
      tenDangNhap: 'vanan99',
      matKhau: sampleHashedPassword,
      role: 'user',
    },
    {
      id: 'KH002',
      hoTen: 'Trần Thị Mai',
      sdt: '0912345678',
      email: 'maitran@gmail.com',
      tenDangNhap: 'maitran',
      matKhau: 'admin123', // plaintext user mẫu
      role: 'admin',
    },
  ];

  beforeEach(() => {
    const dbState: Record<string, any[]> = {
      customers: JSON.parse(JSON.stringify(sampleCustomers)),
      refresh_tokens: [],
    };

    mockDbService = {
      getData: vi.fn().mockImplementation((collection: string) => {
        return Promise.resolve(JSON.parse(JSON.stringify(dbState[collection] || [])));
      }),
      saveData: vi.fn().mockImplementation((collection: string, data: any[]) => {
        dbState[collection] = JSON.parse(JSON.stringify(data));
        return Promise.resolve();
      }),
    };

    jwtService = new JwtService({ secret: 'test_jwt_secret' });
    service = new AuthService(
      mockDbService as unknown as DbService,
      jwtService,
    );
  });

  describe('register', () => {
    it('Đăng ký thành công tài khoản mới với role user và mật khẩu được hash', async () => {
      const dto: RegisterDto = {
        hoTen: 'Lê Văn C',
        email: 'levanc@gmail.com',
        sdt: '0933221100',
        tenDangNhap: 'levanc',
        matKhau: 'secret123',
      };

      const result = await service.register(dto);

      expect(result).toBeDefined();
      expect(result.id).toMatch(/^KH\d+/);
      expect(result.tenDangNhap).toBe('levanc');
      expect(result.role).toBe('user');
      expect((result as any).matKhau).toBeUndefined();

      expect(mockDbService.saveData).toHaveBeenCalledWith('customers', expect.any(Array));
    });

    it('Ném ConflictException nếu tên đăng nhập đã tồn tại', async () => {
      const dto: RegisterDto = {
        hoTen: 'Người Trùng',
        email: 'unique@gmail.com',
        sdt: '0999999999',
        tenDangNhap: 'vanan99', // Trùng với user KH001
        matKhau: '123456',
      };

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('Ném ConflictException nếu email đã tồn tại', async () => {
      const dto: RegisterDto = {
        hoTen: 'Người Trùng Email',
        email: 'vanan@gmail.com', // Trùng email
        sdt: '0999999999',
        tenDangNhap: 'newuser',
        matKhau: '123456',
      };

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('validateUser', () => {
    it('Xác thực đúng mật khẩu bằng bcrypt hash', async () => {
      const user = await service.validateUser('vanan99', '123456');

      expect(user).not.toBeNull();
      expect(user?.tenDangNhap).toBe('vanan99');
      expect(user?.role).toBe('user');
      expect((user as any)?.matKhau).toBeUndefined();
    });

    it('Xác thực đúng mật khẩu plaintext cho user mẫu', async () => {
      const user = await service.validateUser('maitran', 'admin123');

      expect(user).not.toBeNull();
      expect(user?.tenDangNhap).toBe('maitran');
      expect(user?.role).toBe('admin');
    });

    it('Trả về null nếu sai mật khẩu', async () => {
      const user = await service.validateUser('vanan99', 'wrongpass');
      expect(user).toBeNull();
    });

    it('Trả về null nếu tên đăng nhập không tồn tại', async () => {
      const user = await service.validateUser('notfound_user', '123456');
      expect(user).toBeNull();
    });
  });

  describe('login', () => {
    it('Tạo access_token và refresh_token và lưu vào db.refresh_tokens.json', async () => {
      const safeUser = {
        id: 'KH001',
        hoTen: 'Nguyễn Văn An',
        email: 'vanan@gmail.com',
        sdt: '0987654321',
        tenDangNhap: 'vanan99',
        role: 'user',
      };

      const res = await service.login(safeUser);

      expect(res).toBeDefined();
      expect(res.access_token).toBeDefined();
      expect(res.refresh_token).toBeDefined();
      expect(res.user.tenDangNhap).toBe('vanan99');

      expect(mockDbService.saveData).toHaveBeenCalledWith(
        'refresh_tokens',
        expect.arrayContaining([
          expect.objectContaining({
            token: res.refresh_token,
            userId: 'KH001',
          }),
        ]),
      );
    });
  });

  describe('refreshTokens', () => {
    it('Cấp mới token thành công và xoay vòng (Rotate token)', async () => {
      const safeUser = {
        id: 'KH001',
        hoTen: 'Nguyễn Văn An',
        email: 'vanan@gmail.com',
        sdt: '0987654321',
        tenDangNhap: 'vanan99',
        role: 'user',
      };

      const loginRes = await service.login(safeUser);
      const oldRefreshToken = loginRes.refresh_token;

      const refreshRes = await service.refreshTokens(oldRefreshToken);

      expect(refreshRes).toBeDefined();
      expect(refreshRes.access_token).toBeDefined();
      expect(refreshRes.refresh_token).toBeDefined();
      expect(refreshRes.refresh_token).not.toBe(oldRefreshToken);
    });

    it('Ném UnauthorizedException nếu refresh token không tồn tại trong DB', async () => {
      await expect(
        service.refreshTokens('invalid_token_not_in_db'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('Xóa refresh token khỏi db.refresh_tokens.json', async () => {
      const safeUser = {
        id: 'KH001',
        hoTen: 'Nguyễn Văn An',
        email: 'vanan@gmail.com',
        sdt: '0987654321',
        tenDangNhap: 'vanan99',
        role: 'user',
      };

      const loginRes = await service.login(safeUser);
      const res = await service.logout(loginRes.refresh_token);

      expect(res.success).toBe(true);
      expect(mockDbService.saveData).toHaveBeenCalledWith('refresh_tokens', []);
    });
  });
});
