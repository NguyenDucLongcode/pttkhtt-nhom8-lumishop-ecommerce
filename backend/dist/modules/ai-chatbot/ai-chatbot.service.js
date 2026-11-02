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
    extractSearchKeyword(message, suggestedProducts, history) {
        const lower = message.toLowerCase();
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
        if (suggestedProducts.length > 0) {
            const first = suggestedProducts[0];
            const firstTen = (first.tenSP || '').toLowerCase();
            for (const kw of commonKeywords) {
                if (firstTen.includes(kw)) {
                    return kw;
                }
            }
            if (first.categoryId) {
                const catMap = {
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
    countTotalProducts(keyword, allProducts) {
        if (!keyword || !allProducts || allProducts.length === 0)
            return 0;
        const kw = keyword.toLowerCase().trim();
        const matched = allProducts.filter((p) => {
            const ten = (p.tenSP || '').toLowerCase();
            const moTa = (p.moTa || '').toLowerCase();
            return ten.includes(kw) || moTa.includes(kw);
        });
        return matched.length;
    }
    streamChat(message, maKH, history) {
        return new Observable((subscriber) => {
            const chunks = [];
            const foundProductIds = new Set();
            let productsEventSent = false;
            const run = async () => {
                try {
                    let allProducts = [];
                    try {
                        allProducts = await this.dbService.getData('products');
                    }
                    catch (err) {
                        this.logger.warn('Không thể đọc file db.products.json:', err);
                    }
                    const productContext = allProducts
                        .map((p) => `- [${p.id}] ${p.tenSP} - ${Number(p.giaBan || 0).toLocaleString('vi-VN')}đ - Tồn kho: ${p.soLuongTon}`)
                        .join('\n');
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
                    const ollamaMessages = [
                        {
                            role: 'system',
                            content: systemPrompt,
                        },
                    ];
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
                    ollamaMessages.push({
                        role: 'user',
                        content: message,
                    });
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
                        let match;
                        while ((match = productTagRegex.exec(pendingStreamText)) !== null) {
                            const pid = match[1].toUpperCase();
                            foundProductIds.add(pid);
                        }
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
                        const lastOpenBracket = pendingStreamText.lastIndexOf('[');
                        if (lastOpenBracket !== -1 &&
                            pendingStreamText.indexOf(']', lastOpenBracket) === -1) {
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
                    const sendProductsEvent = () => {
                        if (productsEventSent || foundProductIds.size === 0)
                            return;
                        const matchedProducts = Array.from(foundProductIds)
                            .slice(0, 3)
                            .map((id) => allProducts.find((p) => p.id.toUpperCase() === id))
                            .filter((p) => !!p);
                        if (matchedProducts.length > 0) {
                            const searchKeyword = this.extractSearchKeyword(message, matchedProducts, history);
                            const totalFound = Math.max(this.countTotalProducts(searchKeyword, allProducts), matchedProducts.length);
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
                                    searchKeyword,
                                    totalFound,
                                }),
                            });
                            productsEventSent = true;
                        }
                    };
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
                                    pendingStreamText += content;
                                    emitCleanText(false);
                                    if (foundProductIds.size > 0 && !productsEventSent) {
                                        sendProductsEvent();
                                    }
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
                                pendingStreamText += parsed.message.content;
                            }
                        }
                        catch {
                            this.logger.warn(`Không parse được buffer còn lại: ${buffer}`);
                        }
                    }
                    emitCleanText(true);
                    sendProductsEvent();
                    const fullResponse = chunks.join('').trim();
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