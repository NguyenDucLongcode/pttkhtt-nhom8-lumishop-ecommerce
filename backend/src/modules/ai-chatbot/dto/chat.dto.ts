import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChatDto {
  @ApiProperty({
    example: 'Đèn bàn thông minh Lumi có những tính năng gì nổi bật?',
    description: 'Nội dung tin nhắn / câu hỏi của khách hàng',
  })
  @IsString({ message: 'message phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'message không được để trống' })
  message: string;
}
