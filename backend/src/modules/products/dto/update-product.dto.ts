import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({
    example: 'Đèn bàn LED chống cận Lumi V2',
    description: 'Tên sản phẩm',
  })
  @IsOptional()
  @IsString({ message: 'tenSP phải là chuỗi ký tự' })
  tenSP?: string;

  @ApiPropertyOptional({
    example: 'Đèn bàn LED nâng cấp bảo vệ mắt',
    description: 'Mô tả sản phẩm',
  })
  @IsOptional()
  @IsString({ message: 'moTa phải là chuỗi ký tự' })
  moTa?: string;

  @ApiPropertyOptional({ example: 550000, description: 'Giá bán (VNĐ)' })
  @IsOptional()
  @IsNumber({}, { message: 'giaBan phải là số' })
  @Min(0, { message: 'giaBan không được âm' })
  giaBan?: number;

  @ApiPropertyOptional({ example: 30, description: 'Số lượng tồn kho' })
  @IsOptional()
  @IsInt({ message: 'soLuongTon phải là số nguyên' })
  @Min(0, { message: 'soLuongTon không được âm' })
  soLuongTon?: number;

  @ApiPropertyOptional({
    example: 'https://picsum.photos/seed/SP001/400/400',
    description: 'Đường dẫn hình ảnh',
  })
  @IsOptional()
  @IsString({ message: 'hinhAnh phải là chuỗi ký tự' })
  hinhAnh?: string;

  @ApiPropertyOptional({ example: 'DM001', description: 'Mã danh mục sản phẩm' })
  @IsOptional()
  @IsString({ message: 'categoryId phải là chuỗi ký tự' })
  categoryId?: string;

  @ApiPropertyOptional({
    example: 'NgungBan',
    description: 'Trạng thái: DangBan | NgungBan',
  })
  @IsOptional()
  @IsString({ message: 'trangThai phải là chuỗi ký tự' })
  trangThai?: string;
}
