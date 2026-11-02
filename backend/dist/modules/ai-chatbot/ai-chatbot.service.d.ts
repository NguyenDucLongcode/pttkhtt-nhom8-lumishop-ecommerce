import { Observable } from 'rxjs';
import { DbService } from '../../database/db.service.js';
interface MessageEvent {
    data: string | object;
    id?: string;
    type?: string;
    retry?: number;
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
export declare class AiChatbotService {
    private readonly dbService;
    private readonly logger;
    private readonly ollamaUrl;
    private readonly modelName;
    constructor(dbService: DbService);
    private extractSearchKeyword;
    private countTotalProducts;
    streamChat(message: string, maKH?: string, history?: ConversationMessage[]): Observable<MessageEvent>;
    getChatHistory(maKH: string): Promise<ChatbotEntry[]>;
    saveChatHistory(cauHoi: string, cauTraLoi: string, maKH?: string): Promise<void>;
}
export {};
