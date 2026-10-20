import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DbService } from '../../database/db.service.js';
import { Product, ProductsService } from './products.service.js';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockDbService: {
    getData: ReturnType<typeof vi.fn>;
    saveData: ReturnType<typeof vi.fn>;
  };

  const sampleProducts: Product[] = [
    {
      id: 'SP001',
      tenSP: 'Đèn bàn A',
      moTa: 'Mô tả A',
      giaBan: 100000,
      soLuongTon: 10,
      hinhAnh: '',
      categoryId: 'DM001',
      trangThai: 'DangBan',
    },
    {
      id: 'SP002',
      tenSP: 'Đèn bàn B',
      moTa: 'Mô tả B',
      giaBan: 200000,
      soLuongTon: 10,
      hinhAnh: '',
      categoryId: 'DM001',
      trangThai: 'DangBan',
    },
    {
      id: 'SP003',
      tenSP: 'Đèn bàn C',
      moTa: 'Mô tả C',
      giaBan: 300000,
      soLuongTon: 10,
      hinhAnh: '',
      categoryId: 'DM001',
      trangThai: 'DangBan',
    },
    {
      id: 'SP004',
      tenSP: 'Đèn bàn D',
      moTa: 'Mô tả D',
      giaBan: 400000,
      soLuongTon: 10,
      hinhAnh: '',
      categoryId: 'DM001',
      trangThai: 'DangBan',
    },
    {
      id: 'SP005',
      tenSP: 'Đèn bàn E',
      moTa: 'Mô tả E',
      giaBan: 500000,
      soLuongTon: 10,
      hinhAnh: '',
      categoryId: 'DM001',
      trangThai: 'DangBan',
    },
    {
      id: 'SP006',
      tenSP: 'Đèn bàn ngừng bán',
      moTa: 'Mô tả F',
      giaBan: 600000,
      soLuongTon: 0,
      hinhAnh: '',
      categoryId: 'DM001',
      trangThai: 'NgungBan',
    },
    {
      id: 'SP010',
      tenSP: 'Đèn LED A',
      moTa: 'Mô tả LED',
      giaBan: 150000,
      soLuongTon: 10,
      hinhAnh: '',
      categoryId: 'DM002',
      trangThai: 'DangBan',
    },
    {
      id: 'SP020',
      tenSP: 'Sản phẩm đơn danh mục',
      moTa: 'Không có sản phẩm cùng danh mục',
      giaBan: 250000,
      soLuongTon: 5,
      hinhAnh: '',
      categoryId: 'DM099',
      trangThai: 'DangBan',
    },
  ];

  beforeEach(() => {
    mockDbService = {
      getData: vi.fn().mockResolvedValue([...sampleProducts]),
      saveData: vi.fn().mockResolvedValue(undefined),
    };
    service = new ProductsService(mockDbService as unknown as DbService);
  });

  describe('getRecommendations', () => {
    it('trả về tối đa 4 sản phẩm cùng danh mục, loại trừ sản phẩm đang xem', async () => {
      const result = await service.getRecommendations('SP001');

      expect(result.length).toBeLessThanOrEqual(4);
      expect(result).toHaveLength(4);
      expect(result.every((p) => p.categoryId === 'DM001')).toBe(true);
      expect(result.every((p) => p.trangThai === 'DangBan')).toBe(true);
      expect(result.some((p) => p.id === 'SP001')).toBe(false);
      expect(result.some((p) => p.id === 'SP006')).toBe(false);
    });

    it('không trả về sản phẩm khác danh mục khi còn hàng cùng category', async () => {
      const result = await service.getRecommendations('SP001');
      expect(result.some((p) => p.categoryId === 'DM002')).toBe(false);
    });

    it('fallback sang sản phẩm đang bán ngẫu nhiên khi không có cùng danh mục', async () => {
      const result = await service.getRecommendations('SP020');

      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(4);
      expect(result.every((p) => p.trangThai === 'DangBan')).toBe(true);
      expect(result.every((p) => p.id !== 'SP020')).toBe(true);
      expect(result.every((p) => p.categoryId !== 'DM099')).toBe(true);
    });

    it('ném NotFoundException nếu productId không tồn tại', async () => {
      await expect(service.getRecommendations('SP999')).rejects.toThrow(NotFoundException);
    });
  });
});
