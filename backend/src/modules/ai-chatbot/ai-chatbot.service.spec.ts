import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DbService } from '../../database/db.service.js';
import { AiChatbotService, ProductItem } from './ai-chatbot.service.js';

describe('AiChatbotService', () => {
  let service: AiChatbotService;
  let mockDbService: {
    getData: ReturnType<typeof vi.fn>;
    saveData: ReturnType<typeof vi.fn>;
  };

  const sampleProducts: ProductItem[] = [
    {
      id: 'SP001',
      tenSP: 'Đèn bàn thông minh Lumi Smart Desk Lamp Pro',
      moTa: 'Đèn bàn bảo vệ mắt điều khiển qua ứng dụng và giọng nói',
      giaBan: 550000,
      soLuongTon: 40,
      hinhAnh: 'https://lumishop.vn/images/sp001.jpg',
    },
    {
      id: 'SP002',
      tenSP: 'Dây đèn LED RGB Lumi Ambient Strip 5m',
      moTa: 'Dải đèn LED RGB 16 triệu màu đồng bộ âm nhạc',
      giaBan: 320000,
      soLuongTon: 85,
      hinhAnh: 'https://lumishop.vn/images/sp002.jpg',
    },
    {
      id: 'SP003',
      tenSP: 'Công tắc cảm ứng Lumi Smart Switch 3 nút',
      moTa: 'Công tắc điều khiển đèn thông minh qua wifi và zigbee',
      giaBan: 750000,
      soLuongTon: 15,
      hinhAnh: 'https://lumishop.vn/images/sp003.jpg',
    },
  ];

  beforeEach(() => {
    mockDbService = {
      getData: vi.fn().mockImplementation((collection: string) => {
        if (collection === 'products') return Promise.resolve([...sampleProducts]);
        return Promise.resolve([]);
      }),
      saveData: vi.fn().mockResolvedValue(undefined),
    };

    service = new AiChatbotService(mockDbService as unknown as DbService);
  });

  describe('RAG Keyword Matching (findMatchingProducts)', () => {
    it('Tìm đúng sản phẩm theo tên (ví dụ: "đèn bàn")', () => {
      const matched = (service as any).findMatchingProducts(
        'Shop có đèn bàn thông minh không?',
        sampleProducts,
      );

      expect(matched.length).toBeGreaterThan(0);
      expect(matched[0].id).toBe('SP001');
    });

    it('Tìm đúng sản phẩm theo mô tả (ví dụ: "đồng bộ âm nhạc")', () => {
      const matched = (service as any).findMatchingProducts(
        'Mình muốn tìm loại led có đồng bộ âm nhạc',
        sampleProducts,
      );

      expect(matched.length).toBeGreaterThan(0);
      expect(matched[0].id).toBe('SP002');
    });

    it('Giới hạn lấy tối đa 3 sản phẩm', () => {
      const matched = (service as any).findMatchingProducts(
        'Lumi thông minh',
        sampleProducts,
      );

      expect(matched.length).toBeLessThanOrEqual(3);
    });

    it('Trả về mảng rỗng nếu câu hỏi không khớp sản phẩm nào', () => {
      const matched = (service as any).findMatchingProducts(
        'Thời tiết hôm nay thế nào?',
        sampleProducts,
      );

      expect(matched).toHaveLength(0);
    });
  });

  describe('streamChat', () => {
    it('Phát event type: "products" khi tìm thấy sản phẩm phù hợp', async () => {
      // Mock fetch Ollama
      const mockReadableStream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                message: { content: 'Dạ shop có mẫu đèn bàn học' },
                done: false,
              }) + '\n',
            ),
          );
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                message: { content: ' rất tốt ạ!' },
                done: true,
              }) + '\n',
            ),
          );
          controller.close();
        },
      });

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        body: mockReadableStream,
      } as unknown as Response);

      const events: any[] = [];
      await new Promise<void>((resolve, reject) => {
        service.streamChat('Shop có đèn bàn không?').subscribe({
          next: (e) => events.push(JSON.parse(e.data as string)),
          error: reject,
          complete: resolve,
        });
      });

      // Event đầu tiên phải là type: 'products'
      expect(events.length).toBeGreaterThanOrEqual(2);
      expect(events[0].type).toBe('products');
      expect(events[0].content).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'SP001' }),
        ]),
      );

      // Các event tiếp theo phải là type: 'text'
      const textEvents = events.filter((e) => e.type === 'text');
      expect(textEvents.length).toBeGreaterThan(0);
      expect(textEvents.map((e) => e.content).join('')).toBe(
        'Dạ shop có mẫu đèn bàn học rất tốt ạ!',
      );

      // Event kết thúc phải là type: 'done' với content: '[DONE]'
      const lastEvent = events[events.length - 1];
      expect(lastEvent.type).toBe('done');
      expect(lastEvent.content).toBe('[DONE]');
    });
  });

  describe('getChatHistory & saveChatHistory', () => {
    it('Lọc và chỉ lấy danh sách lịch sử chat của đúng mã khách hàng maKH', async () => {
      const sampleHistory = [
        {
          id: 'CB001',
          maKH: 'KH001',
          cauHoi: 'Đèn Lumi có bền không?',
          cauTraLoi: 'Dạ rất bền ạ!',
          timestamp: '2026-10-15T09:00:00.000Z',
        },
        {
          id: 'CB002',
          maKH: 'KH002',
          cauHoi: 'Shop có voucher không?',
          cauTraLoi: 'Dạ có mã LUMI50 ạ!',
          timestamp: '2026-10-16T10:00:00.000Z',
        },
      ];

      mockDbService.getData.mockResolvedValueOnce(sampleHistory);

      const history = await service.getChatHistory('KH001');
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe('CB001');
      expect(history[0].maKH).toBe('KH001');
      expect(history[0].cauHoi).toBe('Đèn Lumi có bền không?');
    });

    it('Trả về mảng rỗng nếu maKH không hợp lệ hoặc không có lịch sử', async () => {
      const history = await service.getChatHistory('');
      expect(history).toEqual([]);
      expect(mockDbService.getData).not.toHaveBeenCalled();
    });

    it('Lưu lịch sử chat có maKH khi khách hàng đã đăng nhập', async () => {
      const existing: any[] = [];
      mockDbService.getData.mockResolvedValueOnce(existing);

      await service.saveChatHistory(
        'Đèn này bảo hành bao lâu?',
        'Dạ bảo hành 24 tháng chính hãng ạ!',
        'KH001',
      );

      expect(mockDbService.saveData).toHaveBeenCalledWith(
        'chatbots',
        expect.arrayContaining([
          expect.objectContaining({
            maKH: 'KH001',
            cauHoi: 'Đèn này bảo hành bao lâu?',
            cauTraLoi: 'Dạ bảo hành 24 tháng chính hãng ạ!',
            id: expect.stringMatching(/^CB\d+/),
            timestamp: expect.any(String),
            nguCanh: 'TuVanKhachHang',
            trangThai: 'DaPhanHoi',
          }),
        ]),
      );
    });

    it('Không lưu vào database nếu không có maKH (khách vãng lai)', async () => {
      await service.saveChatHistory(
        'Shop có mở cửa chủ nhật không?',
        'Dạ có mở từ 8h đến 21h ạ!',
        undefined,
      );

      expect(mockDbService.saveData).not.toHaveBeenCalled();
    });
  });
});
