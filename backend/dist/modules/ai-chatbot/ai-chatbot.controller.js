var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Query, Req, Sse, UnauthorizedException, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { Public } from '../../common/decorators/public.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { AiChatbotService } from './ai-chatbot.service.js';
let AiChatbotController = class AiChatbotController {
    aiChatbotService;
    constructor(aiChatbotService) {
        this.aiChatbotService = aiChatbotService;
    }
    async getChatHistory(req) {
        const maKH = req?.user?.userId || req?.user?.sub;
        if (!maKH) {
            throw new UnauthorizedException('Không tìm thấy thông tin khách hàng trong token');
        }
        return this.aiChatbotService.getChatHistory(maKH);
    }
    streamChat(message, req) {
        const maKH = req?.user?.userId || req?.user?.sub;
        return this.aiChatbotService.streamChat(message, maKH);
    }
};
__decorate([
    Get('history'),
    Roles('user', 'admin'),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
        summary: 'Lấy lịch sử hội thoại của Chatbot theo tài khoản khách hàng',
        description: 'Chỉ dành cho người dùng đã đăng nhập. Trả về danh sách câu hỏi và câu trả lời của tài khoản tương ứng trong db.chatbots.json.',
    }),
    ApiResponse({
        status: 200,
        description: 'Danh sách lịch sử hội thoại của khách hàng.',
    }),
    ApiResponse({
        status: 401,
        description: 'Chưa đăng nhập hoặc token không hợp lệ.',
    }),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiChatbotController.prototype, "getChatHistory", null);
__decorate([
    Public(),
    Sse('stream'),
    ApiOperation({
        summary: 'Chatbot tư vấn LumiShop (SSE streaming)',
        description: 'Hỗ trợ khách vãng lai (không lưu lịch sử) và người dùng đăng nhập (tự động lưu lịch sử theo tài khoản).',
    }),
    ApiQuery({
        name: 'message',
        required: true,
        type: String,
        description: 'Nội dung tin nhắn / câu hỏi của khách hàng',
        example: 'Đèn bàn thông minh Lumi có những tính năng gì nổi bật?',
    }),
    ApiQuery({
        name: 'token',
        required: false,
        type: String,
        description: 'JWT token tùy chọn (hữu ích cho native EventSource của trình duyệt)',
    }),
    ApiResponse({
        status: 200,
        description: 'Phản hồi streaming SSE từ AI Chatbot (text/event-stream)',
    }),
    __param(0, Query('message')),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Observable)
], AiChatbotController.prototype, "streamChat", null);
AiChatbotController = __decorate([
    ApiTags('Chatbot'),
    Controller('chat'),
    __metadata("design:paramtypes", [AiChatbotService])
], AiChatbotController);
export { AiChatbotController };
//# sourceMappingURL=ai-chatbot.controller.js.map