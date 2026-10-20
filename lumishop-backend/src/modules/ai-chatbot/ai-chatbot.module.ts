import { Module } from '@nestjs/common';
import { AiChatbotController } from './ai-chatbot.controller.js';
import { AiChatbotService } from './ai-chatbot.service.js';
import { DatabaseModule } from '../../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [AiChatbotController],
  providers: [AiChatbotService],
  exports: [AiChatbotService],
})
export class AiChatbotModule {}
