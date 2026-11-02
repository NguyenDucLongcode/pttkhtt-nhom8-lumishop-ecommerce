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
  categoryId?: string;
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

export interface ConversationMessage {
  role: string;
  content: string;
}

@Injectable()
export class AiChatbotService {
  private readonly logger = new Logger(AiChatbotService.name);
  private readonly ollamaUrl = 'http://localhost:11434/api/chat';
  private readonly modelName = 'qwen3:4b-instruct';

  constructor(private readonly dbService: DbService) {}

  /**
   * Trích xuất từ khóa tìm kiếm chính từ câu hỏi của khách hàng (có xét đến ngữ cảnh lịch sử)
   */
  private extractSearchKeyword(
    message: string,
    suggestedProducts: ProductItem[],
    history?: ConversationMessage[],
  ): string {
    const lower = message.toLowerCase();

    // 1. Kiểm tra các danh mục hoặc cụm từ phổ biến thường gặp trong LumiShop
    const commonKeywords = [
      'đèn bàn',
      'đèn led',
      'đèn ngủ',
      'đèn chùm',
      'phụ kiện',
      'bóng đèn',
      'công tắc',
      'chống cận',
      'led rgb',
      'thông minh',
      'cảm ứng',
      'pha lê',
    ];

    for (const kw of commonKeywords) {
      if (lower.includes(kw)) {
        return kw;
      }
    }

    // 2. Nếu câu hiện tại ngắn hoặc bổ sung ngữ cảnh (VD: "dùng để trang trí á bạn"), kiểm tra câu hỏi trước trong history
    if (history && history.length > 0) {
      const recentUserMessages = history
        .filter((h) => h.role === 'user')
        .map((h) => (h.content || '').toLowerCase())
        .reverse();

      for (const prevMsg of recentUserMessages) {
        for (const kw of commonKeywords) {
          if (prevMsg.includes(kw)) {
            return kw;
          }
        }
      }
    }

    // 3. Nếu câu hỏi không chứa cụm trực tiếp, lấy từ loại của sản phẩm được gợi ý
    if (suggestedProducts.length > 0) {
      const first = suggestedProducts[0];
      const firstTen = (first.tenSP || '').toLowerCase();
      for (const kw of commonKeywords) {
        if (firstTen.includes(kw)) {
          return kw;
        }
      }

      if (first.categoryId) {
        const catMap: Record<string, string> = {
          DM001: 'đèn bàn',
          DM002: 'đèn led',
          DM003: 'đèn ngủ',
          DM004: 'đèn chùm',
          DM005: 'phụ kiện',
        };
        if (catMap[first.categoryId]) {
          return catMap[first.categoryId];
        }
      }
    }

    // 4. Fallback: Lọc bỏ các từ dừng thông dụng trong tiếng Việt
    const stopWords = new Set([
      'shop', 'có', 'không', 'em', 'anh', 'chi', 'chị', 'tôi', 'toi', 'minh', 'mình',
      'bạn', 'ban', 'cho', 'với', 'voi', 'được', 'duoc', 'xin', 'chào', 'chao', 'hello',
      'hi', 'tư', 'vấn', 'tu', 'van', 'hỏi', 'hoi', 'muốn', 'muon', 'cần', 'can',
      'tìm', 'tim', 'mua', 'xem', 'bán', 'ban', 'mẫu', 'mau', 'loại', 'loai', 'nào',
      'nao', 'gì', 'gi', 'thế', 'the', 'giá', 'gia', 'bao', 'nhiêu', 'nhieu', 'ạ', 'a',
      'ơi', 'oi', 'nhé', 'nhe', 'này', 'nay', 'ở', 'đâu', 'dùng', 'để', 'á',
    ]);

    const words = lower
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !stopWords.has(w));

    if (words.length > 0) {
      return words.slice(0, 3).join(' ');
    }

    return 'đèn';
  }

  /**
   * Đếm tổng số sản phẩm trong DB có chứa từ khóa đó (phục vụ nút Xem tất cả sản phẩm)
   */
  private countTotalProducts(
    keyword: string,
    allProducts: ProductItem[],
  ): number {
    if (!keyword || !allProducts || allProducts.length === 0) return 0;
    const kw = keyword.toLowerCase().trim();

    const matched = allProducts.filter((p) => {
      const ten = (p.tenSP || '').toLowerCase();
      const moTa = (p.moTa || '').toLowerCase();
      return ten.includes(kw) || moTa.includes(kw);
    });

    return matched.length;
  }

  /**
   * Stream response từ Ollama kết hợp In-Context Learning & Conversation Memory:
   * - Nhồi toàn bộ danh sách sản phẩm vào System Prompt
   * - Hỗ trợ bộ nhớ ngắn hạn thông qua mảng history (4-6 tin nhắn gần nhất)
   * - AI chủ động chèn mã [PRODUCT:ID] (tối đa 3) khi muốn gợi ý
   * - Backend bắt mã bằng Regex, xóa khỏi text stream, gửi metadata { type: 'products', content, searchKeyword, totalFound }
   */
  streamChat(
    message: string,
    maKH?: string,
    history?: ConversationMessage[],
  ): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      const chunks: string[] = [];
      const foundProductIds = new Set<string>();
      let productsEventSent = false;

      const run = async () => {
        try {
          // BƯỚC 1: ĐỌC TOÀN BỘ SẢN PHẨM TỪ DB (IN-CONTEXT LEARNING)
          let allProducts: ProductItem[] = [];
          try {
            allProducts = await this.dbService.getData<ProductItem>('products');
          } catch (err) {
            this.logger.warn('Không thể đọc file db.products.json:', err);
          }

          // BƯỚC 2: TẠO PRODUCT CONTEXT ĐỊNH DẠNG: - [ID] Tên SP - Giá tiền - Tồn kho
          const productContext = allProducts
            .map(
              (p) =>
                `- [${p.id}] ${p.tenSP} - ${Number(p.giaBan || 0).toLocaleString('vi-VN')}đ - Tồn kho: ${p.soLuongTon}`,
            )
            .join('\n');

          // BƯỚC 3: TẠO SYSTEM PROMPT MỚI CÓ HỖ TRỢ CONVERSATION MEMORY
          const systemPrompt = `Bạn là nhân viên tư vấn bán hàng xuất sắc của LumiShop. Nhiệm vụ của bạn là tư vấn tận tình, thấu hiểu nhu cầu của khách hàng và chốt đơn dựa trên danh sách sản phẩm thực tế của cửa hàng.

Tính cách & văn phong (Tone):
- Thân thiện, niềm nở, lịch sự, luôn xưng "em" và gọi khách là "anh/chị".
- Trả lời ngắn gọn, tự nhiên, súc tích, đi thẳng vào trọng tâm, không lan man.

Danh sách sản phẩm thực tế tại cửa hàng LumiShop:
${productContext}

QUY TẮC TƯ VẤN VÀ GỢI Ý SẢN PHẨM:
1. Bạn CHỈ được tư vấn các sản phẩm có trong danh sách trên của shop.
2. GHI NHỚ NGỮ CẢNH HỘI THOẠI (Conversation Memory):
- Bạn đang trò chuyện liên tục với khách. Hãy LUÔN LUÔN ghi nhớ các câu hỏi và câu trả lời trước đó trong lịch sử trò chuyện.
- Nếu khách hàng bổ sung chi tiết hoặc làm rõ nhu cầu ở câu sau (Ví dụ: Câu trước: "Tư vấn đèn bàn", Câu sau: "dùng để trang trí á bạn" hoặc "cho bé học lớp 1"), bạn PHẢI hiểu khách hàng vẫn đang tìm kiếm loại sản phẩm ở câu trước (ở đây là "đèn bàn dùng để trang trí"), TUYỆT ĐỐI KHÔNG tự động chuyển sang các danh mục không liên quan khác như cây cảnh, khung ảnh, đồ gia dụng.
- Dựa trên nhu cầu tích hợp đó, hãy gợi ý 1-3 mẫu đèn bàn phù hợp (Ví dụ: Đèn bàn gỗ vintage Lumi Wood [PRODUCT:SP006] hoặc Đèn bàn thông minh [PRODUCT:SP002]).
3. QUY TẮC GỢI Ý: Khi tư vấn hoặc giới thiệu sản phẩm cho khách, nếu bạn muốn gợi ý hiển thị sản phẩm cụ thể, hãy chèn mã [PRODUCT:ID] vào cuối câu trả lời (Ví dụ: [PRODUCT:SP006] hoặc [PRODUCT:SP001] [PRODUCT:SP002]).
- TUYỆT ĐỐI chỉ gợi ý TỐI ĐA 3 sản phẩm phù hợp nhất trong một câu trả lời (tối đa 3 mã [PRODUCT:ID]).
- Nếu có nhiều hơn 3 sản phẩm phù hợp, chỉ chọn 1-3 sản phẩm tiêu biểu nhất để chèn mã [PRODUCT:ID], các sản phẩm còn lại hãy tư vấn ngắn gọn bằng lời và khuyên khách bấm nút xem thêm.
4. QUY TẮC TỪ CHỐI: Nếu khách hỏi món mà shop không kinh doanh (ví dụ: bút, thước, sách, quần áo, thực phẩm, thiết bị không có trong danh sách...), hãy trả lời khéo léo và lịch sự rằng shop hiện không bán mặt hàng này, đồng thời có thể giới thiệu các dòng đèn chiếu sáng hoặc phụ kiện thông minh shop đang có. TUYỆT ĐỐI KHÔNG ĐƯỢC chèn bất kỳ mã [PRODUCT:...] nào khi từ chối hoặc khi shop không có sản phẩm.
5. Với các câu chào hỏi xã giao hoặc câu hỏi chung chung chưa rõ nhu cầu, hãy chào hỏi niềm nở và hỏi thăm nhu cầu của khách, không tự ý chèn mã [PRODUCT:ID].`;

          // BƯỚC 4: CHUẨN BỊ MẢNG MESSAGES CHUẨN OLLAMA (SYSTEM + CONVERSATION HISTORY + CÂU HỎI MỚI NHẤT)
          const ollamaMessages: Array<{ role: string; content: string }> = [
            {
              role: 'system',
              content: systemPrompt,
            },
          ];

          // Nối lịch sử hội thoại gần nhất (nếu có)
          if (history && history.length > 0) {
            for (const h of history) {
              const role = h.role === 'assistant' ? 'assistant' : 'user';
              if (h.content && typeof h.content === 'string') {
                ollamaMessages.push({
                  role,
                  content: h.content,
                });
              }
            }
          }

          // Nối câu hỏi mới nhất của khách hàng
          ollamaMessages.push({
            role: 'user',
            content: message,
          });

          // GỬI ĐẾN OLLAMA
          const response = await fetch(this.ollamaUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: this.modelName,
              messages: ollamaMessages,
              think: false,
              stream: true,
              options: {
                num_predict: 350,
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
          let pendingStreamText = '';
          const productTagRegex = /\[PRODUCT:([a-zA-Z0-9_-]+)\]/g;

          const emitCleanText = (flushAll = false) => {
            // 1. Tìm tất cả các mã [PRODUCT:ID] hoàn chỉnh
            let match: RegExpExecArray | null;
            while ((match = productTagRegex.exec(pendingStreamText)) !== null) {
              const pid = match[1].toUpperCase();
              foundProductIds.add(pid);
            }
            // Xóa các mã hoàn chỉnh khỏi text
            pendingStreamText = pendingStreamText.replace(productTagRegex, '');

            if (flushAll) {
              if (pendingStreamText) {
                chunks.push(pendingStreamText);
                subscriber.next({
                  data: JSON.stringify({
                    type: 'text',
                    content: pendingStreamText,
                  }),
                });
                pendingStreamText = '';
              }
              return;
            }

            // 2. Tránh lộ mã đang dở dạng [PROD... chưa có ]
            const lastOpenBracket = pendingStreamText.lastIndexOf('[');
            if (
              lastOpenBracket !== -1 &&
              pendingStreamText.indexOf(']', lastOpenBracket) === -1
            ) {
              // Nếu đoạn từ '[' đến cuối chuỗi ngắn hơn 35 ký tự, tạm giữ lại chờ chunk tiếp theo
              if (pendingStreamText.length - lastOpenBracket < 35) {
                const safePart = pendingStreamText.slice(0, lastOpenBracket);
                pendingStreamText = pendingStreamText.slice(lastOpenBracket);
                if (safePart) {
                  chunks.push(safePart);
                  subscriber.next({
                    data: JSON.stringify({
                      type: 'text',
                      content: safePart,
                    }),
                  });
                }
                return;
              }
            }

            // 3. Emit toàn bộ phần an toàn
            if (pendingStreamText) {
              chunks.push(pendingStreamText);
              subscriber.next({
                data: JSON.stringify({
                  type: 'text',
                  content: pendingStreamText,
                }),
              });
              pendingStreamText = '';
            }
          };

          // HÀM GỬI EVENT PRODUCTS VỚI METADATA
          const sendProductsEvent = () => {
            if (productsEventSent || foundProductIds.size === 0) return;

            const matchedProducts = Array.from(foundProductIds)
              .slice(0, 3)
              .map((id) => allProducts.find((p) => p.id.toUpperCase() === id))
              .filter((p): p is ProductItem => !!p);

            if (matchedProducts.length > 0) {
              const searchKeyword = this.extractSearchKeyword(
                message,
                matchedProducts,
                history,
              );
              const totalFound = Math.max(
                this.countTotalProducts(searchKeyword, allProducts),
                matchedProducts.length,
              );

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
                  searchKeyword,
                  totalFound,
                }),
              });
              productsEventSent = true;
            }
          };

          // ĐỌC LUỒNG STREAM TỪ OLLAMA
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const parsed = JSON.parse(line) as OllamaChatChunk;

                if (parsed.message?.thinking) {
                  if (parsed.done === true) break;
                  continue;
                }

                const content = parsed.message?.content;
                if (content && typeof content === 'string' && content.length > 0) {
                  pendingStreamText += content;
                  emitCleanText(false);

                  // Nếu vừa phát hiện thêm mã sản phẩm mới mà chưa phát event
                  if (foundProductIds.size > 0 && !productsEventSent) {
                    sendProductsEvent();
                  }
                }

                if (parsed.done === true) {
                  break;
                }
              } catch {
                this.logger.warn(`Không parse được dòng NDJSON: ${line}`);
              }
            }
          }

          // Xử lý nốt buffer dòng còn lại nếu có
          if (buffer.trim()) {
            try {
              const parsed = JSON.parse(buffer) as OllamaChatChunk;
              if (!parsed.message?.thinking && parsed.message?.content) {
                pendingStreamText += parsed.message.content;
              }
            } catch {
              this.logger.warn(`Không parse được buffer còn lại: ${buffer}`);
            }
          }

          // Flush toàn bộ text còn lại (xóa sạch mọi mã [PRODUCT:...])
          emitCleanText(true);

          // Đảm bảo event products được gửi nếu có mã tìm thấy
          sendProductsEvent();

          // Lưu lịch sử chat sau khi hoàn thành (chỉ lưu nếu có maKH, lưu text sạch không có mã)
          const fullResponse = chunks.join('').trim();
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
