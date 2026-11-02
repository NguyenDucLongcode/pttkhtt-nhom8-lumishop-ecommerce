import { ConflictException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DbService } from '../../database/db.service.js';
import { Customer, CustomersService } from './customers.service.js';

describe('CustomersService', () => {
  let service: CustomersService;
  let mockDbService: {
    getData: ReturnType<typeof vi.fn>;
    saveData: ReturnType<typeof vi.fn>;
  };

  const sampleCustomers: Customer[] = [
    {
      id: 'KH001',
      hoTen: 'Nguyễn Văn An',
      sdt: '0987654321',
      email: 'vanan.nguyen@gmail.com',
      diaChi: '123 Nguyễn Huệ, TP.HCM',
      tenDangNhap: 'vanan99',
      matKhau: 'hashed_123',
    },
    {
      id: 'KH002',
      hoTen: 'Trần Thị Mai',
      sdt: '0912345678',
      email: 'thimai.tran@gmail.com',
      diaChi: '456 Lê Lợi, Đồng Nai',
      tenDangNhap: 'maitran',
      matKhau: 'hashed_456',
    },
  ];

  beforeEach(() => {
    mockDbService = {
      getData: vi.fn().mockResolvedValue([...sampleCustomers]),
      saveData: vi.fn().mockResolvedValue(undefined),
    };
    service = new CustomersService(mockDbService as unknown as DbService);
  });

  describe('findAll', () => {
    it('Lấy toàn bộ khách hàng và ẩn matKhau', async () => {
      const res = await service.findAll();
      expect(res).toHaveLength(2);
      expect((res[0] as any).matKhau).toBeUndefined();
    });

    it('Tìm kiếm khách hàng theo Họ tên', async () => {
      const res = await service.findAll({ search: 'Mai' });
      expect(res).toHaveLength(1);
      expect(res[0].hoTen).toBe('Trần Thị Mai');
    });

    it('Tìm kiếm khách hàng theo Số điện thoại', async () => {
      const res = await service.findAll({ search: '0987654321' });
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe('KH001');
    });
  });

  describe('findOne', () => {
    it('Lấy thông tin chi tiết khách hàng theo ID và ẩn matKhau', async () => {
      const customer = await service.findOne('KH001');
      expect(customer.id).toBe('KH001');
      expect((customer as any).matKhau).toBeUndefined();
    });

    it('Ném NotFoundException khi ID không tồn tại', async () => {
      await expect(service.findOne('KH999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('Tạo mới khách hàng với ID dạng KH + timestamp và mã hóa mật khẩu', async () => {
      const newCust = await service.create({
        hoTen: 'Lê Hoàng Nam',
        sdt: '0933333333',
        email: 'hoangnam@gmail.com',
        diaChi: '789 CMT8',
        tenDangNhap: 'hoangnam',
        matKhau: 'Password@123',
      });

      expect(newCust.id).toMatch(/^KH\d+$/);
      expect(newCust.hoTen).toBe('Lê Hoàng Nam');
      expect((newCust as any).matKhau).toBeUndefined();
      expect(mockDbService.saveData).toHaveBeenCalled();
    });

    it('Ném ConflictException nếu trùng tên đăng nhập', async () => {
      await expect(
        service.create({
          hoTen: 'Test User',
          sdt: '0900000000',
          email: 'test@gmail.com',
          tenDangNhap: 'vanan99', // Trùng KH001
          matKhau: '123456',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('Ném ConflictException nếu trùng email', async () => {
      await expect(
        service.create({
          hoTen: 'Test User 2',
          sdt: '0900000001',
          email: 'vanan.nguyen@gmail.com', // Trùng KH001
          tenDangNhap: 'newuser123',
          matKhau: '123456',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('Cập nhật thông tin cá nhân khách hàng', async () => {
      const updated = await service.update('KH001', {
        hoTen: 'Nguyễn Văn An (VIP)',
        diaChi: 'Địa chỉ mới Quận 7',
      });

      expect(updated.id).toBe('KH001');
      expect(updated.hoTen).toBe('Nguyễn Văn An (VIP)');
      expect(mockDbService.saveData).toHaveBeenCalled();
    });

    it('Ném NotFoundException khi cập nhật ID không tồn tại', async () => {
      await expect(
        service.update('KH999', { hoTen: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('Ném ConflictException nếu đổi email trùng với khách hàng khác', async () => {
      await expect(
        service.update('KH001', { email: 'thimai.tran@gmail.com' }), // Trùng KH002
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('Xóa khách hàng theo ID', async () => {
      const res = await service.remove('KH001');
      expect(res.success).toBe(true);
      expect(res.deleted.id).toBe('KH001');
      expect(mockDbService.saveData).toHaveBeenCalled();
    });

    it('Ném NotFoundException khi xóa ID không tồn tại', async () => {
      await expect(service.remove('KH999')).rejects.toThrow(NotFoundException);
    });
  });
});
