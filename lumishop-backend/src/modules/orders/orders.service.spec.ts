import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DbService } from '../../database/db.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrdersService } from './orders.service.js';

describe('OrdersService', () => {
  let service: OrdersService;
  let mockDbService: {
    getData: ReturnType<typeof vi.fn>;
    saveData: ReturnType<typeof vi.fn>;
  };

  const sampleCustomers = [
    {
      id: 'KH001',
      hoTen: 'Nguyễn Văn An',
      sdt: '0987654321',
      email: 'vanan@gmail.com',
    },
  ];

  const sampleProducts = [
    {
      id: 'SP001',
      tenSP: 'Đèn bàn thông minh Lumi',
      giaBan: 500000,
      soLuongTon: 10,
    },
    {
      id: 'SP002',
      tenSP: 'Dây đèn LED RGB Lumi',
      giaBan: 200000,
      soLuongTon: 5,
    },
  ];

  const sampleVouchers = [
    {
      id: 'VC001',
      code: 'LUMI10',
      discountType: 'PERCENT' as const,
      discountValue: 10,
      minOrderValue: 200000,
      maxDiscountAmount: 40000,
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-12-31T23:59:59.000Z',
      usageLimit: 100,
      usedCount: 0,
      isActive: true,
    },
    {
      id: 'VC002',
      code: 'FIX50',
      discountType: 'FIXED' as const,
      discountValue: 50000,
      minOrderValue: 300000,
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-12-31T23:59:59.000Z',
      usageLimit: 10,
      usedCount: 0,
      isActive: true,
    },
    {
      id: 'VC003',
      code: 'EXPIRED',
      discountType: 'FIXED' as const,
      discountValue: 10000,
      startDate: '2020-01-01T00:00:00.000Z',
      endDate: '2020-12-31T23:59:59.000Z',
      isActive: true,
      usedCount: 0,
    },
  ];

  beforeEach(() => {
    const dbState: Record<string, any[]> = {
      customers: JSON.parse(JSON.stringify(sampleCustomers)),
      products: JSON.parse(JSON.stringify(sampleProducts)),
      vouchers: JSON.parse(JSON.stringify(sampleVouchers)),
      orders: [],
      payments: [],
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

    service = new OrdersService(mockDbService as unknown as DbService);
  });

  describe('checkout', () => {
    it('Bước 1: Ném BadRequestException nếu mã khách hàng không tồn tại', async () => {
      const dto: CreateOrderDto = {
        maKH: 'KH_NOT_FOUND',
        diaChiGiao: '123 Đường ABC',
        phuongThucTT: 'COD',
        items: [{ maSP: 'SP001', soLuong: 1 }],
        phiShip: 30000,
      };

      await expect(service.checkout(dto)).rejects.toThrow(BadRequestException);
    });

    it('Bước 2: Ném BadRequestException nếu mã sản phẩm không tồn tại', async () => {
      const dto: CreateOrderDto = {
        maKH: 'KH001',
        diaChiGiao: '123 Đường ABC',
        phuongThucTT: 'COD',
        items: [{ maSP: 'SP_NOT_FOUND', soLuong: 1 }],
        phiShip: 30000,
      };

      await expect(service.checkout(dto)).rejects.toThrow(BadRequestException);
    });

    it('Bước 2: Ném BadRequestException nếu sản phẩm không đủ tồn kho', async () => {
      const dto: CreateOrderDto = {
        maKH: 'KH001',
        diaChiGiao: '123 Đường ABC',
        phuongThucTT: 'COD',
        items: [{ maSP: 'SP001', soLuong: 999 }], // Tồn kho chỉ có 10
        phiShip: 30000,
      };

      await expect(service.checkout(dto)).rejects.toThrow(
        /không đủ số lượng/i,
      );
    });

    it('Bước 3, 5, 6, 7, 8: Checkout thành công không có voucher', async () => {
      const dto: CreateOrderDto = {
        maKH: 'KH001',
        diaChiGiao: '123 Đường ABC, Hà Nội',
        phuongThucTT: 'COD',
        items: [
          { maSP: 'SP001', soLuong: 2 }, // 500k * 2 = 1.000.000
          { maSP: 'SP002', soLuong: 1 }, // 200k * 1 = 200.000
        ],
        phiShip: 30000,
      };

      const order = await service.checkout(dto);

      expect(order).toBeDefined();
      expect(order.id).toMatch(/^DH\d+/);
      expect(order.maKH).toBe('KH001');
      expect(order.trangThai).toBe('ChoXacNhan');
      expect(order.tongTienHang).toBe(1200000);
      expect(order.tienGiamGia).toBe(0);
      expect(order.phiShip).toBe(30000);
      expect(order.tongTien).toBe(1230000);
      expect(order.items).toHaveLength(2);
      expect(order.paymentId).toMatch(/^TT\d+/);

      // Kiểm tra gọi saveData
      expect(mockDbService.saveData).toHaveBeenCalledWith('orders', expect.any(Array));
      expect(mockDbService.saveData).toHaveBeenCalledWith('products', expect.any(Array));
      expect(mockDbService.saveData).toHaveBeenCalledWith('payments', expect.any(Array));
    });

    it('Bước 4: Áp dụng voucher % giảm thành công với maxDiscountAmount', async () => {
      const dto: CreateOrderDto = {
        maKH: 'KH001',
        diaChiGiao: '123 Đường ABC',
        phuongThucTT: 'ChuyenKhoan',
        items: [{ maSP: 'SP001', soLuong: 2 }], // 1.000.000đ
        voucherCode: 'LUMI10', // 10% = 100.000đ nhưng max là 40.000đ
        phiShip: 20000,
      };

      const order = await service.checkout(dto);

      expect(order.tongTienHang).toBe(1000000);
      expect(order.tienGiamGia).toBe(40000); // Bị giới hạn ở 40k
      expect(order.phiShip).toBe(20000);
      expect(order.tongTien).toBe(1000000 - 40000 + 20000); // 980.000
      expect(order.voucherCode).toBe('LUMI10');
    });

    it('Bước 4: Áp dụng voucher giảm tiền cố định FIXED thành công', async () => {
      const dto: CreateOrderDto = {
        maKH: 'KH001',
        diaChiGiao: '123 Đường ABC',
        phuongThucTT: 'ViDienTu',
        items: [{ maSP: 'SP001', soLuong: 1 }], // 500.000đ
        voucherCode: 'FIX50', // Giảm 50.000đ
        phiShip: 15000,
      };

      const order = await service.checkout(dto);

      expect(order.tongTienHang).toBe(500000);
      expect(order.tienGiamGia).toBe(50000);
      expect(order.tongTien).toBe(500000 - 50000 + 15000); // 465.000
    });

    it('Bước 4: Ném lỗi nếu voucher đã hết hạn', async () => {
      const dto: CreateOrderDto = {
        maKH: 'KH001',
        diaChiGiao: '123 Đường ABC',
        phuongThucTT: 'COD',
        items: [{ maSP: 'SP001', soLuong: 1 }],
        voucherCode: 'EXPIRED',
        phiShip: 20000,
      };

      await expect(service.checkout(dto)).rejects.toThrow(
        /hết hạn sử dụng/i,
      );
    });

    it('Bước 4: Ném lỗi nếu voucher không tồn tại', async () => {
      const dto: CreateOrderDto = {
        maKH: 'KH001',
        diaChiGiao: '123 Đường ABC',
        phuongThucTT: 'COD',
        items: [{ maSP: 'SP001', soLuong: 1 }],
        voucherCode: 'INVALID_CODE',
        phiShip: 20000,
      };

      await expect(service.checkout(dto)).rejects.toThrow(
        /không tồn tại/i,
      );
    });
  });

  describe('findAll', () => {
    it('Lấy toàn bộ đơn hàng', async () => {
      mockDbService.getData.mockResolvedValueOnce([
        { id: 'DH001', trangThai: 'ChoXacNhan' },
        { id: 'DH002', trangThai: 'HoanThanh' },
      ]);

      const list = await service.findAll();
      expect(list).toHaveLength(2);
    });

    it('Lọc đơn hàng theo trạng thái', async () => {
      mockDbService.getData.mockResolvedValueOnce([
        { id: 'DH001', trangThai: 'ChoXacNhan' },
        { id: 'DH002', trangThai: 'HoanThanh' },
      ]);

      const list = await service.findAll({ trangThai: 'ChoXacNhan' });
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe('DH001');
    });
  });

  describe('findOne', () => {
    it('Lấy chi tiết đơn hàng theo ID thành công', async () => {
      mockDbService.getData.mockResolvedValueOnce([
        { id: 'DH001', tongTien: 500000 },
      ]);

      const order = await service.findOne('DH001');
      expect(order.id).toBe('DH001');
    });

    it('Ném NotFoundException nếu không tìm thấy đơn hàng', async () => {
      mockDbService.getData.mockResolvedValueOnce([]);

      await expect(service.findOne('DH999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('Cập nhật trạng thái đơn hàng thành công', async () => {
      const orders = [
        {
          id: 'DH001',
          trangThai: 'ChoXacNhan',
          items: [{ maSP: 'SP001', soLuong: 2 }],
        },
      ];
      mockDbService.getData.mockResolvedValueOnce(orders);

      const updated = await service.updateStatus('DH001', 'DangGiao');

      expect(updated.trangThai).toBe('DangGiao');
      expect(mockDbService.saveData).toHaveBeenCalledWith('orders', expect.any(Array));
    });

    it('Ném NotFoundException nếu không tìm thấy đơn hàng cần cập nhật', async () => {
      mockDbService.getData.mockResolvedValueOnce([]);

      await expect(
        service.updateStatus('DH_NOT_FOUND', 'DangGiao'),
      ).rejects.toThrow(NotFoundException);
    });

    it('Hoàn lại số lượng tồn kho khi đơn hàng chuyển sang trạng thái DaHuy', async () => {
      const orders = [
        {
          id: 'DH001',
          trangThai: 'ChoXacNhan',
          items: [
            { maSP: 'SP001', soLuong: 3 },
            { maSP: 'SP002', soLuong: 2 },
          ],
        },
      ];
      const products = [
        { id: 'SP001', tenSP: 'Đèn bàn', giaBan: 500000, soLuongTon: 10 },
        { id: 'SP002', tenSP: 'LED strip', giaBan: 200000, soLuongTon: 5 },
      ];

      mockDbService.getData
        .mockResolvedValueOnce(orders) // get orders
        .mockResolvedValueOnce(products); // get products when cancelled

      const updated = await service.updateStatus('DH001', 'DaHuy');

      expect(updated.trangThai).toBe('DaHuy');
      // Tồn kho SP001 phải tăng từ 10 -> 13, SP002 từ 5 -> 7
      expect(mockDbService.saveData).toHaveBeenCalledWith(
        'products',
        expect.arrayContaining([
          expect.objectContaining({ id: 'SP001', soLuongTon: 13 }),
          expect.objectContaining({ id: 'SP002', soLuongTon: 7 }),
        ]),
      );
    });
  });

  describe('getRevenueReport', () => {
    it('Tính tổng doanh thu và gom nhóm theo ngày cho các đơn hàng DaGiao', async () => {
      const orders = [
        {
          id: 'DH001',
          trangThai: 'DaGiao',
          tongTien: 300000,
          ngayDat: '2026-10-15T09:00:00.000Z',
        },
        {
          id: 'DH002',
          trangThai: 'DaGiao',
          tongTien: 500000,
          ngayDat: '2026-10-15T15:30:00.000Z',
        },
        {
          id: 'DH003',
          trangThai: 'DaGiao',
          tongTien: 200000,
          ngayDat: '2026-10-16T10:00:00.000Z',
        },
        {
          id: 'DH004',
          trangThai: 'DangGiao', // Chưa giao xong -> không tính vào doanh thu
          tongTien: 400000,
          ngayDat: '2026-10-16T11:00:00.000Z',
        },
        {
          id: 'DH005',
          trangThai: 'DaHuy', // Đã hủy -> không tính
          tongTien: 150000,
          ngayDat: '2026-10-16T12:00:00.000Z',
        },
      ];

      mockDbService.getData.mockResolvedValueOnce(orders);

      const report = await service.getRevenueReport();

      expect(report.totalOrders).toBe(3);
      expect(report.totalRevenue).toBe(1000000); // 300k + 500k + 200k
      expect(report.dailyRevenue).toHaveLength(2);
      expect(report.dailyRevenue).toEqual([
        { date: '2026-10-15', revenue: 800000 },
        { date: '2026-10-16', revenue: 200000 },
      ]);
    });

    it('Trả về doanh thu bằng 0 nếu chưa có đơn hàng nào DaGiao', async () => {
      mockDbService.getData.mockResolvedValueOnce([
        { id: 'DH001', trangThai: 'ChoXacNhan', tongTien: 300000 },
      ]);

      const report = await service.getRevenueReport();

      expect(report.totalOrders).toBe(0);
      expect(report.totalRevenue).toBe(0);
      expect(report.dailyRevenue).toEqual([]);
    });
  });

  describe('getOrderHistory', () => {
    it('Lấy danh sách đơn hàng của khách hàng theo mã và sắp xếp mới nhất trước', async () => {
      const orders = [
        {
          id: 'DH001',
          maKH: 'KH001',
          ngayDat: '2026-10-10T10:00:00.000Z',
        },
        {
          id: 'DH002',
          maKH: 'KH002',
          ngayDat: '2026-10-12T10:00:00.000Z',
        },
        {
          id: 'DH003',
          maKH: 'KH001',
          ngayDat: '2026-10-15T10:00:00.000Z',
        },
      ];

      mockDbService.getData.mockResolvedValueOnce(orders);

      const history = await service.getOrderHistory('KH001');

      expect(history).toHaveLength(2);
      expect(history[0].id).toBe('DH003'); // Ngày 15 mới hơn ngày 10
      expect(history[1].id).toBe('DH001');
    });

    it('Trả về mảng rỗng nếu khách hàng chưa có đơn hàng nào', async () => {
      mockDbService.getData.mockResolvedValueOnce([]);

      const history = await service.getOrderHistory('KH_CHUA_MUA');
      expect(history).toEqual([]);
    });
  });
});
