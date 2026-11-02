import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DbService } from '../../database/db.service.js';
import {
  CartPopulatedItem,
  CartRecord,
  CartsService,
} from './carts.service.js';

describe('CartsService', () => {
  let service: CartsService;
  let mockDbService: {
    getData: ReturnType<typeof vi.fn>;
    saveData: ReturnType<typeof vi.fn>;
  };

  const sampleProducts = [
    {
      id: 'SP001',
      tenSP: 'Đèn bàn học chống cận Pro',
      giaBan: 450000,
      soLuongTon: 15,
      trangThai: 'DangBan',
    },
    {
      id: 'SP002',
      tenSP: 'Đèn hết hàng',
      giaBan: 300000,
      soLuongTon: 0,
      trangThai: 'DangBan',
    },
    {
      id: 'SP003',
      tenSP: 'Đèn ngừng bán',
      giaBan: 200000,
      soLuongTon: 10,
      trangThai: 'NgungBan',
    },
  ];

  let sampleCarts: CartRecord[];

  beforeEach(() => {
    sampleCarts = [
      {
        id: 'CART_KH001',
        maKH: 'KH001',
        items: [{ maSP: 'SP001', soLuong: 2 }],
      },
    ];

    mockDbService = {
      getData: vi.fn().mockImplementation((collection: string) => {
        if (collection === 'carts') {
          return Promise.resolve(sampleCarts);
        }
        if (collection === 'products') {
          return Promise.resolve(sampleProducts);
        }
        return Promise.resolve([]);
      }),
      saveData: vi.fn().mockImplementation((collection: string, data: any[]) => {
        if (collection === 'carts') {
          sampleCarts = data;
        }
        return Promise.resolve();
      }),
    };

    service = new CartsService(mockDbService as unknown as DbService);
  });

  describe('getCart', () => {
    it('Trả về mảng rỗng nếu khách hàng chưa có giỏ hàng', async () => {
      const res = await service.getCart('KH_CHUA_CO');
      expect(res).toEqual([]);
    });

    it('Trả về danh sách sản phẩm kèm thông tin chi tiết', async () => {
      const res: CartPopulatedItem[] = await service.getCart('KH001');
      expect(res).toHaveLength(1);
      expect(res[0].maSP).toBe('SP001');
      expect(res[0].soLuong).toBe(2);
      expect(res[0].product.tenSP).toBe('Đèn bàn học chống cận Pro');
      expect(res[0].product.giaBan).toBe(450000);
    });
  });

  describe('addToCart', () => {
    it('Báo lỗi NotFoundException khi sản phẩm không tồn tại', async () => {
      await expect(
        service.addToCart('KH001', { maSP: 'SP_KHONG_CO', soLuong: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('Báo lỗi BadRequestException khi sản phẩm hết hàng hoặc ngừng kinh doanh', async () => {
      await expect(
        service.addToCart('KH001', { maSP: 'SP002', soLuong: 1 }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.addToCart('KH001', { maSP: 'SP003', soLuong: 1 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('Tạo giỏ hàng mới và thêm sản phẩm nếu user chưa có giỏ', async () => {
      const res = await service.addToCart('KH002', {
        maSP: 'SP001',
        soLuong: 3,
      });
      expect(res).toHaveLength(1);
      expect(res[0].maSP).toBe('SP001');
      expect(res[0].soLuong).toBe(3);
      expect(mockDbService.saveData).toHaveBeenCalled();
    });

    it('Cộng dồn số lượng nếu sản phẩm đã có trong giỏ hàng', async () => {
      const res = await service.addToCart('KH001', {
        maSP: 'SP001',
        soLuong: 3,
      });
      expect(res).toHaveLength(1);
      expect(res[0].soLuong).toBe(5); // 2 cũ + 3 mới
    });

    it('Không vượt quá số lượng tồn kho của sản phẩm', async () => {
      const res = await service.addToCart('KH001', {
        maSP: 'SP001',
        soLuong: 50, // Vượt quá tồn kho 15
      });
      expect(res[0].soLuong).toBe(15);
    });
  });

  describe('updateQuantity', () => {
    it('Báo lỗi NotFoundException nếu không tìm thấy giỏ hàng', async () => {
      await expect(
        service.updateQuantity('KH_LA', 'SP001', 5),
      ).rejects.toThrow(NotFoundException);
    });

    it('Cập nhật số lượng mới của sản phẩm trong giỏ', async () => {
      const res = await service.updateQuantity('KH001', 'SP001', 8);
      expect(res[0].soLuong).toBe(8);
    });

    it('Tự động xóa sản phẩm nếu cập nhật số lượng <= 0', async () => {
      const res = await service.updateQuantity('KH001', 'SP001', 0);
      expect(res).toHaveLength(0);
    });
  });

  describe('removeFromCart', () => {
    it('Xóa sản phẩm được chỉ định khỏi giỏ hàng', async () => {
      const res = await service.removeFromCart('KH001', 'SP001');
      expect(res).toHaveLength(0);
      expect(mockDbService.saveData).toHaveBeenCalled();
    });
  });

  describe('clearCart', () => {
    it('Dọn sạch toàn bộ giỏ hàng của user', async () => {
      const res = await service.clearCart('KH001');
      expect(res).toEqual([]);
      expect(sampleCarts.find((c) => c.maKH === 'KH001')?.items).toEqual([]);
    });
  });
});
