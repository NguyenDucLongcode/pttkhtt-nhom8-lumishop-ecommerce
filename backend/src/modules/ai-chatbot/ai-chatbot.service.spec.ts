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
      tenSP: 'Đèn bàn LED chống cận Lumi Desk Pro',
      moTa: 'Đèn bàn bảo vệ mắt điều khiển qua ứng dụng và giọng nói',
      giaBan: 550000,
      soLuongTon: 40,
      categoryId: 'DM001',
      hinhAnh: 'https://lumishop.vn/images/sp001.jpg',
    },
    {
      id: 'SP002',
      tenSP: 'Dây đèn LED RGB Lumi Ambient Strip 5m',
      moTa: 'Dải đèn LED RGB 16 triệu màu đồng bộ âm nhạc',
      giaBan: 320000,
      soLuongTon: 85,
      categoryId: 'DM002',
      hinhAnh: 'https://lumishop.vn/images/sp002.jpg',
    },
    {
      id: 'SP003',
      tenSP: 'Đèn bàn thông minh Lumi Smart Desk V2',
      moTa: 'Đèn bàn học sinh cao cấp tích hợp sạc không dây',
      giaBan: 750000,
      soLuongTon: 15,
      categoryId: 'DM001',
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

  describe('Keyword Extraction & Product Count (Conversation Memory)', () => {
    it('Trích xuất đúng từ khóa chính từ câu hỏi (ví dụ: "đèn bàn")', () => {
      const keyword = (service as any).extractSearchKeyword(
        'Shop có mẫu đèn bàn nào chống cận tốt không em?',
        [sampleProducts[0]],
      );

      expect(keyword).toBe('đèn bàn');
    });

    it('Ghi nhớ ngữ cảnh: Khách hỏi câu nối tiếp "dùng để trang trí á bạn" vẫn trích xuất đúng "đèn bàn"', () => {
      const history = [
        { role: 'user', content: 'Tư vấn đèn bàn' },
        { role: 'assistant', content: 'Dạ shop có nhiều mẫu đèn bàn thông minh và đèn học ạ.' },
      ];

      const keyword = (service as any).extractSearchKeyword(
        'dùng để trang trí á bạn',
        [sampleProducts[0]],
        history,
      );

      expect(keyword).toBe('đèn bàn');
    });

    it('Đếm tổng số sản phẩm trong DB có chứa từ khóa đó', () => {
      const count = (service as any).countTotalProducts('đèn bàn', sampleProducts);
      // Có 2 sản phẩm là đèn bàn trong sampleProducts
      expect(count).toBe(2);
    });

    it('Trả về 0 nếu không tìm thấy sản phẩm nào theo từ khóa lạ', () => {
      const count = (service as any).countTotalProducts('bút bi', sampleProducts);
      expect(count).toBe(0);
    });
  });

  describe('streamChat (In-Context & Regex Product Tag)', () => {
    it('Phát event type: "products" với metadata và xóa sạch mã [PRODUCT:ID] khỏi text stream', async () => {
      // Mock fetch Ollama trả về stream chứa mã [PRODUCT:SP001]
      const mockReadableStream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                message: { content: 'Dạ em gợi ý cho anh/chị mẫu đèn bàn Pro này ạ. [PRODUCT:SP001]' },
                done: false,
              }) + '\n',
            ),
          );
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                message: { content: ' Rất phù hợp cho bé học bài ạ!' },
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

      // Kiểm tra có event products
      const productEvents = events.filter((e) => e.type === 'products');
      expect(productEvents.length).toBe(1);
      expect(productEvents[0].content).toHaveLength(1);
      expect(productEvents[0].content[0].id).toBe('SP001');
      expect(productEvents[0].searchKeyword).toBe('đèn bàn');
      expect(productEvents[0].totalFound).toBeGreaterThanOrEqual(1);

      // Kiểm tra các event text: TUYỆT ĐỐI KHÔNG CHỨA [PRODUCT:SP001]
      const textEvents = events.filter((e) => e.type === 'text');
      const fullText = textEvents.map((e) => e.content).join('');
      expect(fullText).not.toContain('[PRODUCT:SP001]');
      expect(fullText).toContain('Dạ em gợi ý cho anh/chị mẫu đèn bàn Pro này ạ.');
      expect(fullText).toContain('Rất phù hợp cho bé học bài ạ!');

      // Event kết thúc phải là type: 'done' với content: '[DONE]'
      const lastEvent = events[events.length - 1];
      expect(lastEvent.type).toBe('done');
      expect(lastEvent.content).toBe('[DONE]');
    });

    it('Không phát event products nếu AI từ chối món hàng không có (không chèn mã PRODUCT)', async () => {
      // Mock fetch Ollama từ chối mặt hàng
      const mockReadableStream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                message: { content: 'Dạ LumiShop hiện không bán bút bi ạ, shop chỉ chuyên các dòng đèn thông minh thôi ạ!' },
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
        service.streamChat('Shop có bán bút bi không?').subscribe({
          next: (e) => events.push(JSON.parse(e.data as string)),
          error: reject,
          complete: resolve,
        });
      });

      // Không có event type products nào được phát
      const productEvents = events.filter((e) => e.type === 'products');
      expect(productEvents).toHaveLength(0);

      // Có text phản hồi
      const textEvents = events.filter((e) => e.type === 'text');
      expect(textEvents.length).toBeGreaterThan(0);
      expect(textEvents.map((e) => e.content).join('')).toContain('không bán bút bi');
    });

    it('Truyền mảng lịch sử (Conversation Memory) vào messages gửi Ollama API theo đúng chuẩn', async () => {
      let capturedBody: any = null;

      const mockReadableStream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                message: { content: 'Dạ em gợi ý mẫu đèn bàn vintage này rất hợp để trang trí ạ! [PRODUCT:SP003]' },
                done: true,
              }) + '\n',
            ),
          );
          controller.close();
        },
      });

      vi.spyOn(globalThis, 'fetch').mockImplementationOnce((_url, init) => {
        if (init && init.body) {
          capturedBody = JSON.parse(init.body as string);
        }
        return Promise.resolve({
          ok: true,
          body: mockReadableStream,
        } as unknown as Response);
      });

      const history = [
        { role: 'user', content: 'Tư vấn đèn bàn' },
        { role: 'assistant', content: 'Shop có nhiều mẫu đèn bàn ạ, anh/chị cần loại nào?' },
      ];

      await new Promise<void>((resolve, reject) => {
        service.streamChat('dùng để trang trí á bạn', undefined, history).subscribe({
          next: () => {},
          error: reject,
          complete: resolve,
        });
      });

      // Kiểm tra body gửi đến Ollama
      expect(capturedBody).toBeDefined();
      expect(Array.isArray(capturedBody.messages)).toBe(true);

      // messages[0] là system prompt
      expect(capturedBody.messages[0].role).toBe('system');
      // messages[1] là câu hỏi cũ của user
      expect(capturedBody.messages[1]).toEqual({ role: 'user', content: 'Tư vấn đèn bàn' });
      // messages[2] là câu trả lời cũ của assistant
      expect(capturedBody.messages[2]).toEqual({
        role: 'assistant',
        content: 'Shop có nhiều mẫu đèn bàn ạ, anh/chị cần loại nào?',
      });
      // messages[3] là câu hỏi mới nhất của user
      expect(capturedBody.messages[3]).toEqual({ role: 'user', content: 'dùng để trang trí á bạn' });
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
