import { Observable } from 'rxjs';
import { AiChatbotService, ChatbotEntry } from './ai-chatbot.service.js';
interface MessageEvent {
    data: string | object;
    id?: string;
    type?: string;
    retry?: number;
}
export declare class AiChatbotController {
    private readonly aiChatbotService;
    constructor(aiChatbotService: AiChatbotService);
    getChatHistory(req: any): Promise<ChatbotEntry[]>;
    streamChat(message: string, req: any): Observable<MessageEvent>;
}
export {};
