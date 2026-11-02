import { ConflictException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DbService } from '../../database/db.service.js';
import { CreateVoucherDto } from './dto/create-voucher.dto.js';
import { UpdateVoucherDto } from './dto/update-voucher.dto.js';
import { Voucher, VouchersService } from './vouchers.service.js';

describe('VouchersService', () => {
  let service: VouchersService;
  let mockDbService: {
    getData: ReturnType<typeof vi.fn>;
    saveData: ReturnType<typeof vi.fn>;
  };

  const sampleVouchers: Voucher[] = Array.from({ length: 15 }, (_, i) => ({
    id: `VC${String(i + 1).padStart(3, '0')}`,
    code: `CODE${i + 1}`,
    description: `Mô tả voucher số ${i + 1}`,
    discountType: (i % 2 === 0 ? 'PERCENT' : 'FIXED') as 'PERCENT' | 'FIXED',
    discountValue: (i + 1) * 10,
    minOrderValue: 100000,
    maxDiscountAmount: 50000,
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2026-12-31T23:59:59.000Z',
    usageLimit: 100,
    usedCount: i,
    isActive: i < 12, // 12 active, 3 inactive
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }));

  beforeEach(() => {
    mockDbService = {
      getData: vi.fn().mockResolvedValue([...sampleVouchers]),
      saveData: vi.fn().mockResolvedValue(undefined),
    };
    service = new VouchersService(mockDbService as unknown as DbService);
  });

  describe('findAll & Pagination (Page 1 & Page 2)', () => {
    it('should return Page 1 with default limit 10 (10 items)', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.total).toBe(15);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.data).toHaveLength(10);
      expect(result.data[0].id).toBe('VC001');
      expect(result.data[9].id).toBe('VC010');
    });

    it('should return Page 2 with limit 10 (remaining 5 items)', async () => {
      const result = await service.findAll({ page: 2, limit: 10 });

      expect(result.total).toBe(15);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.data).toHaveLength(5);
      expect(result.data[0].id).toBe('VC011');
      expect(result.data[4].id).toBe('VC015');
    });

    it('should not have overlapping items between Page 1 and Page 2', async () => {
      const page1 = await service.findAll({ page: 1, limit: 10 });
      const page2 = await service.findAll({ page: 2, limit: 10 });

      const page1Ids = page1.data.map((v) => v.id);
      const page2Ids = page2.data.map((v) => v.id);

      const intersection = page1Ids.filter((id) => page2Ids.includes(id));
      expect(intersection).toHaveLength(0);
    });

    it('should return empty data array when page exceeds total pages', async () => {
      const result = await service.findAll({ page: 3, limit: 10 });

      expect(result.total).toBe(15);
      expect(result.page).toBe(3);
      expect(result.data).toHaveLength(0);
    });

    it('should filter by isActive = true', async () => {
      const result = await service.findAll({ isActive: true, limit: 20 });

      expect(result.total).toBe(12);
      expect(result.data.every((v) => v.isActive === true)).toBe(true);
    });

    it('should filter by isActive = false', async () => {
      const result = await service.findAll({ isActive: false, limit: 20 });

      expect(result.total).toBe(3);
      expect(result.data.every((v) => v.isActive === false)).toBe(true);
    });

    it('should filter by code with partial search (case-insensitive)', async () => {
      const result = await service.findAll({ code: 'code1' });

      // Matches: CODE1, CODE10, CODE11, CODE12, CODE13, CODE14, CODE15
      expect(result.total).toBe(7);
      expect(result.data.every((v) => v.code.includes('CODE1'))).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return voucher if found', async () => {
      const voucher = await service.findOne('VC001');
      expect(voucher).toBeDefined();
      expect(voucher.id).toBe('VC001');
      expect(voucher.code).toBe('CODE1');
    });

    it('should throw NotFoundException if voucher not found', async () => {
      await expect(service.findOne('VC999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new voucher and save to db', async () => {
      const newDto: CreateVoucherDto = {
        code: 'NEWCODE',
        description: 'Voucher mới tạo',
        discountType: 'PERCENT',
        discountValue: 15,
        minOrderValue: 200000,
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-12-31T23:59:59.000Z',
        isActive: true,
      };

      const result = await service.create(newDto);

      expect(result).toBeDefined();
      expect(result.code).toBe('NEWCODE');
      expect(result.usedCount).toBe(0);
      expect(mockDbService.saveData).toHaveBeenCalled();
    });

    it('should throw ConflictException if voucher code already exists', async () => {
      const duplicateDto: CreateVoucherDto = {
        code: 'CODE1',
        description: 'Trùng mã',
        discountType: 'PERCENT',
        discountValue: 10,
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-12-31T23:59:59.000Z',
      };

      await expect(service.create(duplicateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('should update existing voucher', async () => {
      const updateDto: UpdateVoucherDto = {
        description: 'Mô tả mới đã cập nhật',
        discountValue: 99,
      };

      const updated = await service.update('VC001', updateDto);

      expect(updated.id).toBe('VC001');
      expect(updated.description).toBe('Mô tả mới đã cập nhật');
      expect(updated.discountValue).toBe(99);
      expect(mockDbService.saveData).toHaveBeenCalled();
    });

    it('should throw NotFoundException if voucher ID not found', async () => {
      await expect(
        service.update('VC999', { description: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if new code duplicates another voucher', async () => {
      await expect(
        service.update('VC001', { code: 'CODE2' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove voucher by ID', async () => {
      const res = await service.remove('VC001');

      expect(res.success).toBe(true);
      expect(res.deleted.id).toBe('VC001');
      expect(mockDbService.saveData).toHaveBeenCalled();
    });

    it('should throw NotFoundException if voucher ID not found', async () => {
      await expect(service.remove('VC999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('checkVoucher', () => {
    it('should return isValid = true for active valid voucher', async () => {
      const res = await service.checkVoucher('CODE1');

      expect(res.isValid).toBe(true);
      expect(res.voucher.code).toBe('CODE1');
      expect(res.message).toContain('hợp lệ');
    });

    it('should return isValid = false for inactive voucher', async () => {
      // CODE13 is inactive (i=12)
      const res = await service.checkVoucher('CODE13');

      expect(res.isValid).toBe(false);
      expect(res.message).toContain('ngưng áp dụng');
    });

    it('should throw NotFoundException if voucher code does not exist', async () => {
      await expect(service.checkVoucher('NONEXISTENT')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
