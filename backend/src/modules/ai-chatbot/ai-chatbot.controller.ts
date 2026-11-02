import {
  Controller,
  Get,
  Query,
  Req,
  Sse,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { Public } from '../../common/decorators/public.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { AiChatbotService, ChatbotEntry } from './ai-chatbot.service.js';

interface MessageEvent {
  data: string | object;
  id?: string;
  type?: string;
  retry?: number;
}

@ApiTags('Chatbot')
@Controller('chat')
export class AiChatbotController {
  constructor(private readonly aiChatbotService: AiChatbotService) {}

  /**
   * Lấy lịch sử trò chuyện tư vấn của khách hàng hiện tại (Yêu cầu JWT)
   */
  @Get('history')
  @Roles('user', 'admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Lấy lịch sử hội thoại của Chatbot theo tài khoản khách hàng',
    description:
      'Chỉ dành cho người dùng đã đăng nhập. Trả về danh sách câu hỏi và câu trả lời của tài khoản tương ứng trong db.chatbots.json.',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách lịch sử hội thoại của khách hàng.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập hoặc token không hợp lệ.',
  })
  async getChatHistory(@Req() req: any): Promise<ChatbotEntry[]> {
    const maKH = req?.user?.userId || req?.user?.sub;
    if (!maKH) {
      throw new UnauthorizedException(
        'Không tìm thấy thông tin khách hàng trong token',
      );
    }
    return this.aiChatbotService.getChatHistory(maKH);
  }

  /**
   * SSE endpoint — GET /chat/stream?message=...
   * Endpoint duy nhất của chatbot tư vấn LumiShop sử dụng Server-Sent Events (SSE) streaming.
   * Cho phép cả khách vãng lai và người dùng đã đăng nhập (hỗ trợ JWT qua Bearer Header hoặc query param token).
   */
  @Public()
  @Sse('stream')
  @ApiOperation({
    summary: 'Chatbot tư vấn LumiShop (SSE streaming)',
    description:
      'Hỗ trợ khách vãng lai (không lưu lịch sử) và người dùng đăng nhập (tự động lưu lịch sử theo tài khoản).',
  })
  @ApiQuery({
    name: 'message',
    required: true,
    type: String,
    description: 'Nội dung tin nhắn / câu hỏi của khách hàng',
    example: 'Đèn bàn thông minh Lumi có những tính năng gì nổi bật?',
  })
  @ApiQuery({
    name: 'token',
    required: false,
    type: String,
    description:
      'JWT token tùy chọn (hữu ích cho native EventSource của trình duyệt)',
  })
  @ApiResponse({
    status: 200,
    description: 'Phản hồi streaming SSE từ AI Chatbot (text/event-stream)',
  })
  streamChat(
    @Query('message') message: string,
    @Req() req: any,
  ): Observable<MessageEvent> {
    const maKH = req?.user?.userId || req?.user?.sub;
    return this.aiChatbotService.streamChat(message, maKH);
  }
}
