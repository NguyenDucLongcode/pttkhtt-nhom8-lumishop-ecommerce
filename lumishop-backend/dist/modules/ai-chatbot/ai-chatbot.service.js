var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiChatbotService_1;
import { Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DbService } from '../../database/db.service.js';
let AiChatbotService = AiChatbotService_1 = class AiChatbotService {
    dbService;
    logger = new Logger(AiChatbotService_1.name);
    ollamaUrl = 'http://localhost:11434/api/chat';
    modelName = 'qwen3:4b-instruct';
    constructor(dbService) {
        this.dbService = dbService;
    }
    findMatchingProducts(message, products) {
        if (!products || products.length === 0)
            return [];
        const lowerMessage = message.toLowerCase().trim();
        const stopWords = new Set([
            'la', 'va', 'co', 'khong', 'gi', 'nao', 'the', 'sao', 'muon', 'can',
            'shop', 'em', 'anh', 'chi', 'toi', 'minh', 'ban', 'cho', 'voi', 'duoc',
            'nhu', 'o', 'tai', 'a', 'da', 'ha', 'nhe', 'nhi', 'day', 'day', 'xin',
        ]);
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
                    score += 20;
                }
                if (tenLower.includes(token)) {
                    score += 5;
                }
                if (moTaLower.includes(token)) {
                    score += 2;
                }
            }
            if (rawTokens.length >= 2) {
                const phrase = rawTokens.join(' ');
                if (tenLower.includes(phrase))
                    score += 15;
                if (moTaLower.includes(phrase))
                    score += 8;
            }
            return { product, score };
        })
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score);
        return scored.slice(0, 3).map((item) => item.product);
    }
    streamChat(message, maKH) {
        return new Observable((subscriber) => {
            const chunks = [];
            const run = async () => {
                try {
                    let allProducts = [];
                    try {
                        allProducts = await this.dbService.getData('products');
                    }
                    catch (err) {
                        this.logger.warn('Không thể đọc file db.products.json:', err);
                    }
                    const matchedProducts = this.findMatchingProducts(message, allProducts);
                    if (matchedProducts.length > 0) {
                        const productCards = matchedProducts.map((p) => ({
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
                    let ragContext = '';
                    if (matchedProducts.length > 0) {
                        ragContext =
                            '\nDưới đây là một số sản phẩm thực tế của shop:\n' +
                                matchedProducts
                                    .map((p) => `- Tên: ${p.tenSP}, Giá: ${Number(p.giaBan)?.toLocaleString('vi-VN')}đ, Tồn kho: ${p.soLuongTon}`)
                                    .join('\n');
                    }
                    const systemPrompt = `Bạn là một nhân viên bán hàng xuất sắc của LumiShop. Bạn có nhiệm vụ tư vấn, thấu hiểu nhu cầu của khách hàng và chốt đơn.

Tính cách (Tone):
- Thân thiện, nhiệt tình, luôn xưng "em" và gọi khách là "anh/chị".
- Trả lời ngắn gọn, súc tích, không lan man.

Quy tắc tư vấn (Rules):
1. Không bao giờ chốt đơn ngay lập tức khi khách hàng hỏi chung chung (VD: "Shop có đèn bàn không?").
2. Phải đặt câu hỏi ngược lại để khai thác nhu cầu. Ví dụ: Nếu khách hỏi mua đèn bàn, hãy hỏi: "Dạ anh/chị muốn mua đèn cho học sinh chống cận hay đèn trang trí ạ? Ngân sách dự kiến của anh/chị khoảng bao nhiêu?"
3. Chỉ khi khách đã trả lời rõ nhu cầu, hãy đưa ra 1-2 gợi ý sản phẩm phù hợp kèm theo một câu thúc giục mua hàng tinh tế (VD: "Mẫu này đang rất hot, em thấy còn đúng 2 chiếc, anh/chị có muốn em chốt đơn luôn không ạ?").
4. Khi khách hàng có ý định mua, hướng dẫn họ: 'Anh/chị có thể bấm nút "Thêm vào giỏ hàng" ở ngay bên cạnh sản phẩm ạ.'${ragContext ? `\n\n${ragContext}` : ''}`;
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
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done)
                            break;
                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n');
                        buffer = lines.pop() || '';
                        for (const line of lines) {
                            if (!line.trim())
                                continue;
                            try {
                                const parsed = JSON.parse(line);
                                if (parsed.message?.thinking) {
                                    if (parsed.done === true)
                                        break;
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
                            }
                            catch {
                                this.logger.warn(`Không parse được dòng NDJSON: ${line}`);
                            }
                        }
                    }
                    if (buffer.trim()) {
                        try {
                            const parsed = JSON.parse(buffer);
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
                        }
                        catch {
                            this.logger.warn(`Không parse được buffer còn lại: ${buffer}`);
                        }
                    }
                    const fullResponse = chunks.join('');
                    if (maKH) {
                        await this.saveChatHistory(message, fullResponse, maKH);
                    }
                    subscriber.next({
                        data: JSON.stringify({
                            type: 'done',
                            content: '[DONE]',
                        }),
                    });
                    subscriber.complete();
                }
                catch (error) {
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
    async getChatHistory(maKH) {
        if (!maKH)
            return [];
        const chatbots = await this.dbService.getData('chatbots');
        return chatbots.filter((entry) => entry.maKH === maKH);
    }
    async saveChatHistory(cauHoi, cauTraLoi, maKH) {
        if (!maKH) {
            return;
        }
        try {
            const chatbots = await this.dbService.getData('chatbots');
            const now = new Date().toISOString();
            const newEntry = {
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
        }
        catch (err) {
            this.logger.warn('Không thể lưu lịch sử chat vào db.json:', err);
        }
    }
};
AiChatbotService = AiChatbotService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [DbService])
], AiChatbotService);
export { AiChatbotService };
//# sourceMappingURL=ai-chatbot.service.js.map