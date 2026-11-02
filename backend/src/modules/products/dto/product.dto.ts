import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty({ example: 'SP001', description: 'Mã định danh sản phẩm' })
  id: string;

  @ApiProperty({ example: 'Đèn bàn thông minh Lumi Smart Desk Lamp Pro', description: 'Tên sản phẩm' })
  tenSP: string;

  @ApiProperty({ example: 'Đèn bàn bảo vệ mắt điều khiển qua ứng dụng và giọng nói', description: 'Mô tả sản phẩm' })
  moTa: string;

  @ApiProperty({ example: 550000, description: 'Giá bán của sản phẩm (VNĐ)' })
  giaBan: number;

  @ApiProperty({ example: 40, description: 'Số lượng tồn kho' })
  soLuongTon: number;

  @ApiProperty({ example: 'https://picsum.photos/seed/SP001/400/400', description: 'Đường dẫn hình ảnh' })
  hinhAnh: string;

  @ApiPropertyOptional({ example: 'DM001', description: 'Mã danh mục sản phẩm' })
  categoryId?: string;

  @ApiProperty({ example: 'DangBan', description: 'Trạng thái kinh doanh sản phẩm' })
  trangThai: string;
}

