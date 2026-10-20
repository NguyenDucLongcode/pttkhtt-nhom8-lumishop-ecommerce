import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Đèn bàn LED chống cận Lumi', description: 'Tên sản phẩm' })
  @IsString({ message: 'tenSP phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'tenSP không được để trống' })
  tenSP: string;

  @ApiProperty({
    example: 'Đèn bàn LED bảo vệ mắt với 3 chế độ ánh sáng',
    description: 'Mô tả sản phẩm',
  })
  @IsString({ message: 'moTa phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'moTa không được để trống' })
  moTa: string;

  @ApiProperty({ example: 450000, description: 'Giá bán (VNĐ)' })
  @IsNumber({}, { message: 'giaBan phải là số' })
  @Min(0, { message: 'giaBan không được âm' })
  giaBan: number;

  @ApiProperty({ example: 50, description: 'Số lượng tồn kho' })
  @IsInt({ message: 'soLuongTon phải là số nguyên' })
  @Min(0, { message: 'soLuongTon không được âm' })
  soLuongTon: number;

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
    example: 'DangBan',
    description: 'Trạng thái: DangBan | NgungBan',
  })
  @IsOptional()
  @IsString({ message: 'trangThai phải là chuỗi ký tự' })
  trangThai?: string;
}
