import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DbService } from '../../database/db.service.js';
import { CategoriesService, Category } from './categories.service.js';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let mockDbService: {
    getData: ReturnType<typeof vi.fn>;
    saveData: ReturnType<typeof vi.fn>;
  };

  const sampleCategories: Category[] = [
    { id: 'DM001', tenDanhMuc: 'Đèn bàn thông minh', moTa: 'Đèn bàn bảo vệ thị lực' },
    { id: 'DM002', tenDanhMuc: 'Đèn LED trang trí Ambient', moTa: 'Dải đèn RGB' },
  ];

  beforeEach(() => {
    mockDbService = {
      getData: vi.fn().mockResolvedValue([...sampleCategories]),
      saveData: vi.fn().mockResolvedValue(undefined),
    };
    service = new CategoriesService(mockDbService as unknown as DbService);
  });

  describe('findAll', () => {
    it('Lấy toàn bộ danh mục khi không truyền search', async () => {
      const res = await service.findAll();
      expect(res).toHaveLength(2);
    });

    it('Tìm kiếm gần đúng theo tên danh mục (search)', async () => {
      const res = await service.findAll({ search: 'Ambient' });
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe('DM002');
    });

    it('Trả về mảng rỗng nếu không khớp từ khóa tìm kiếm', async () => {
      const res = await service.findAll({ search: 'Không tồn tại' });
      expect(res).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('Lấy đúng danh mục theo ID', async () => {
      const cat = await service.findOne('DM001');
      expect(cat.id).toBe('DM001');
      expect(cat.tenDanhMuc).toBe('Đèn bàn thông minh');
    });

    it('Ném NotFoundException nếu ID không tồn tại', async () => {
      await expect(service.findOne('DM999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('Tạo mới danh mục với ID dạng CAT + timestamp', async () => {
      const newCat = await service.create({
        tenDanhMuc: 'Đèn trần thông minh',
        moTa: 'Đèn ốp trần phòng khách',
      });

      expect(newCat.id).toMatch(/^CAT\d+$/);
      expect(newCat.tenDanhMuc).toBe('Đèn trần thông minh');
      expect(mockDbService.saveData).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('Cập nhật thông tin danh mục theo ID', async () => {
      const updated = await service.update('DM001', {
        tenDanhMuc: 'Đèn bàn học sinh Pro',
      });

      expect(updated.id).toBe('DM001');
      expect(updated.tenDanhMuc).toBe('Đèn bàn học sinh Pro');
      expect(mockDbService.saveData).toHaveBeenCalled();
    });

    it('Ném NotFoundException khi cập nhật ID không tồn tại', async () => {
      await expect(service.update('DM999', { tenDanhMuc: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('Xóa danh mục theo ID', async () => {
      const res = await service.remove('DM001');
      expect(res.success).toBe(true);
      expect(res.deleted.id).toBe('DM001');
      expect(mockDbService.saveData).toHaveBeenCalled();
    });

    it('Ném NotFoundException khi xóa ID không tồn tại', async () => {
      await expect(service.remove('DM999')).rejects.toThrow(NotFoundException);
    });
  });
});
