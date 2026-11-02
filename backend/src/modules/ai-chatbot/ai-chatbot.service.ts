import { Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DbService } from '../../database/db.service.js';

interface MessageEvent {
  data: string | object;
  id?: string;
  type?: string;
  retry?: number;
}

interface OllamaChatMessage {
  role?: string;
  content?: string;
  thinking?: string;
}

interface OllamaChatChunk {
  model?: string;
  created_at?: string;
  message?: OllamaChatMessage;
  done?: boolean;
}

export interface ProductItem {
  id: string;
  tenSP: string;
  moTa: string;
  giaBan: number;
  soLuongTon: number;
  hinhAnh?: string;
  trangThai?: string;
  [key: string]: any;
}

export interface ProductCard {
  id: string;
  tenSP: string;
  giaBan: number;
  hinhAnh: string;
}

export interface ChatbotEntry {
  id: string;
  maKH?: string;
  cauHoi: string;
  cauTraLoi: string;
  timestamp: string;
  nguCanh?: string;
  trangThai?: string;
  [key: string]: any;
}

@Injectable()
export class AiChatbotService {
  private readonly logger = new Logger(AiChatbotService.name);
  private readonly ollamaUrl = 'http://localhost:11434/api/chat';
  private readonly modelName = 'qwen3:4b-instruct';

  constructor(private readonly dbService: DbService) {}

  /**
   * Truy xuất các sản phẩm liên quan nhất dựa vào câu hỏi của khách hàng (RAG)
   * Tối đa 3 sản phẩm phù hợp nhất
   */
  private findMatchingProducts(
    message: string,
    products: ProductItem[],
  ): ProductItem[] {
    if (!products || products.length === 0) return [];

    const lowerMessage = message.toLowerCase().trim();

    // Danh sách từ dừng phổ biến trong câu hỏi tiếng Việt
    const stopWords = new Set([
      'la', 'va', 'co', 'khong', 'gi', 'nao', 'the', 'sao', 'muon', 'can',
      'shop', 'em', 'anh', 'chi', 'toi', 'minh', 'ban', 'cho', 'voi', 'duoc',
      'nhu', 'o', 'tai', 'a', 'da', 'ha', 'nhe', 'nhi', 'day', 'day', 'xin',
    ]);

    // Tách từ khóa loại bỏ ký tự đặc biệt
    const rawTokens = lowerMessage
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2 && !stopWords.has(t));

    if (rawTokens.length === 0) {
      return [];
    }

    const scored = products
      .map((product) => {
        const tenLower = (product.tenSP || '').toLowerCase();
        const moTaLower = (product.moTa || '').toLowerCase();
        const idLower = (product.id || '').toLowerCase();
        let score = 0;

        for (const token of rawTokens) {
          if (idLower === token) {
            score += 20; // Trùng mã sản phẩm trực tiếp
          }
          if (tenLower.includes(token)) {
            score += 5; // Trùng từ trong tên sản phẩm
          }
          if (moTaLower.includes(token)) {
            score += 2; // Trùng từ trong mô tả sản phẩm
          }
        }

        // Khớp cụm từ nhiều từ liên tiếp
        if (rawTokens.length >= 2) {
          const phrase = rawTokens.join(' ');
          if (tenLower.includes(phrase)) score += 15;
          if (moTaLower.includes(phrase)) score += 8;
        }

        return { product, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, 3).map((item) => item.product);
  }

  /**
   * Stream response từ Ollama kết hợp RAG và trả về 2 luồng Event:
   * Luồng 1 - type: 'products' (Product Cards)
   * Luồng 2 - type: 'text' (Nội dung câu trả lời stream từ AI)
   */
  streamChat(message: string, maKH?: string): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      const chunks: string[] = [];

      const run = async () => {
        try {
          // BƯỚC 1: TRUY XUẤT DỮ LIỆU (RAG)
          let allProducts: ProductItem[] = [];
          try {
            allProducts = await this.dbService.getData<ProductItem>('products');
          } catch (err) {
            this.logger.warn('Không thể đọc file db.products.json:', err);
          }

          const matchedProducts = this.findMatchingProducts(
            message,
            allProducts,
          );

          // LUỒNG 1: TRẢ THẺ SẢN PHẨM NGAY KHI BẮT ĐẦU STREAM NẾU TÌM THẤY SẢN PHẨM PHÙ HỢP
          if (matchedProducts.length > 0) {
            const productCards: ProductCard[] = matchedProducts.map((p) => ({
              id: p.id,
              tenSP: p.tenSP,
              giaBan: p.giaBan,
              hinhAnh: p.hinhAnh || '',
            }));

            subscriber.next({
              data: JSON.stringify({
                type: 'products',
                content: productCards,
              }),
            });
          }

          // BƯỚC 2: TẠO NGỮ CẢNH RAG NẾU CÓ SẢN PHẨM TÌM THẤY
          let ragContext = '';
          if (matchedProducts.length > 0) {
            ragContext =
              '\nDưới đây là một số sản phẩm thực tế của shop:\n' +
              matchedProducts
                .map(
                  (p) =>
                    `- Tên: ${p.tenSP}, Giá: ${Number(p.giaBan)?.toLocaleString('vi-VN')}đ, Tồn kho: ${p.soLuongTon}`,
                )
                .join('\n');
          }

          // BƯỚC 3: TẠO PROMPT HOÀN CHỈNH (SYSTEM PROMPT + RAG CONTEXT)
          const systemPrompt = `Bạn là một nhân viên bán hàng xuất sắc của LumiShop. Bạn có nhiệm vụ tư vấn, thấu hiểu nhu cầu của khách hàng và chốt đơn.

Tính cách (Tone):
- Thân thiện, nhiệt tình, luôn xưng "em" và gọi khách là "anh/chị".
- Trả lời ngắn gọn, súc tích, không lan man.

Quy tắc tư vấn (Rules):
1. Không bao giờ chốt đơn ngay lập tức khi khách hàng hỏi chung chung (VD: "Shop có đèn bàn không?").
2. Phải đặt câu hỏi ngược lại để khai thác nhu cầu. Ví dụ: Nếu khách hỏi mua đèn bàn, hãy hỏi: "Dạ anh/chị muốn mua đèn cho học sinh chống cận hay đèn trang trí ạ? Ngân sách dự kiến của anh/chị khoảng bao nhiêu?"
3. Chỉ khi khách đã trả lời rõ nhu cầu, hãy đưa ra 1-2 gợi ý sản phẩm phù hợp kèm theo một câu thúc giục mua hàng tinh tế (VD: "Mẫu này đang rất hot, em thấy còn đúng 2 chiếc, anh/chị có muốn em chốt đơn luôn không ạ?").
4. Khi khách hàng có ý định mua, hướng dẫn họ: 'Anh/chị có thể bấm nút "Thêm vào giỏ hàng" ở ngay bên cạnh sản phẩm ạ.'${ragContext ? `\n\n${ragContext}` : ''}`;

          // GỬI ĐẾN OLLAMA (giữ nguyên think: false và stream: true)
          const response = await fetch(this.ollamaUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: this.modelName,
              messages: [
                {
                  role: 'system',
                  content: systemPrompt,
                },
                {
                  role: 'user',
                  content: message,
                },
              ],
              think: false,
              stream: true,
              options: {
                num_predict: 256,
              },
            }),
          });

          if (!response.ok) {
            throw new Error(`Ollama response error ${response.status}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('Response body is not a stream');
          }

          const decoder = new TextDecoder('utf-8');
          let buffer = '';

          // LUỒNG 2: TRẢ TEXT CỦA AI KHI OLLAMA NHẢ CHỮ
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Ollama trả về NDJSON — mỗi dòng là một JSON object
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const parsed = JSON.parse(line) as OllamaChatChunk;

                // Bỏ qua nếu là suy nghĩ ngầm (thinking)
                if (parsed.message?.thinking) {
                  if (parsed.done === true) break;
                  continue;
                }

                const content = parsed.message?.content;

                if (content && typeof content === 'string' && content.length > 0) {
                  chunks.push(content);
                  subscriber.next({
                    data: JSON.stringify({
                      type: 'text',
                      content,
                    }),
                  });
                }

                if (parsed.done === true) {
                  break;
                }
              } catch {
                this.logger.warn(`Không parse được dòng NDJSON: ${line}`);
              }
            }
          }

          // Xử lý nốt phần buffer còn lại nếu có
          if (buffer.trim()) {
            try {
              const parsed = JSON.parse(buffer) as OllamaChatChunk;
              if (!parsed.message?.thinking && parsed.message?.content) {
                const content = parsed.message.content;
                chunks.push(content);
                subscriber.next({
                  data: JSON.stringify({
                    type: 'text',
                    content,
                  }),
                });
              }
            } catch {
              this.logger.warn(`Không parse được buffer còn lại: ${buffer}`);
            }
          }

          // Lưu lịch sử chat sau khi hoàn thành (chỉ lưu nếu có maKH của khách hàng đã đăng nhập)
          const fullResponse = chunks.join('');
          if (maKH) {
            await this.saveChatHistory(message, fullResponse, maKH);
          }

          // Gửi tín hiệu kết thúc hoàn toàn luồng stream để Client chủ động đóng EventSource
          subscriber.next({
            data: JSON.stringify({
              type: 'done',
              content: '[DONE]',
            }),
          });

          subscriber.complete();
        } catch (error: any) {
          this.logger.error('Lỗi khi gọi API Ollama /api/chat:', error);
          subscriber.next({
            data: JSON.stringify({
              type: 'error',
              error: `Không thể kết nối với mô hình AI Ollama (${this.modelName}): ${error?.message || error}`,
              content: `Không thể kết nối với mô hình AI Ollama (${this.modelName}): ${error?.message || error}`,
            }),
          });
          subscriber.complete();
        }
      };

      void run();
    });
  }

  /**
   * Lấy lịch sử hội thoại của một khách hàng cụ thể theo maKH
   */
  async getChatHistory(maKH: string): Promise<ChatbotEntry[]> {
    if (!maKH) return [];
    const chatbots = await this.dbService.getData<ChatbotEntry>('chatbots');
    return chatbots.filter((entry) => entry.maKH === maKH);
  }

  /**
   * Lưu lịch sử câu hỏi và câu trả lời vào db.chatbots.json theo tài khoản khách hàng (maKH)
   * Nếu không có maKH (khách vãng lai), không lưu vào database
   */
  async saveChatHistory(
    cauHoi: string,
    cauTraLoi: string,
    maKH?: string,
  ): Promise<void> {
    if (!maKH) {
      return;
    }

    try {
      const chatbots = await this.dbService.getData<ChatbotEntry>('chatbots');
      const now = new Date().toISOString();
      const newEntry: ChatbotEntry = {
        id: `CB${Date.now()}`,
        maKH,
        cauHoi,
        cauTraLoi,
        timestamp: now,
        nguCanh: 'TuVanKhachHang',
        trangThai: 'DaPhanHoi',
      };
      chatbots.push(newEntry);
      await this.dbService.saveData('chatbots', chatbots);
    } catch (err) {
      this.logger.warn('Không thể lưu lịch sử chat vào db.json:', err);
    }
  }
}
