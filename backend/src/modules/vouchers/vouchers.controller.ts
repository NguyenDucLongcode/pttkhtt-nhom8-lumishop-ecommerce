import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CreateVoucherDto } from './dto/create-voucher.dto.js';
import { QueryVoucherDto } from './dto/query-voucher.dto.js';
import { UpdateVoucherDto } from './dto/update-voucher.dto.js';
import {
  CheckVoucherResult,
  PaginatedVouchersResult,
  Voucher,
  VouchersService,
} from './vouchers.service.js';

@ApiTags('Vouchers')
@ApiBearerAuth('JWT-auth')
@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách voucher (có phân trang & lọc theo isActive, code)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách voucher kèm thông tin phân trang { data, total, page, limit }',
  })
  async findAll(
    @Query() query: QueryVoucherDto,
  ): Promise<PaginatedVouchersResult> {
    return this.vouchersService.findAll(query);
  }

  @Public()
  @Get('check/:code')
  @ApiOperation({
    summary: 'Kiểm tra tính hợp lệ của mã giảm giá (check hạn dùng, trạng thái, lượt dùng)',
  })
  @ApiParam({
    name: 'code',
    example: 'LUMI10',
    description: 'Mã voucher cần kiểm tra',
  })
  @ApiResponse({
    status: 200,
    description: 'Kết quả kiểm tra mã voucher { isValid, message, voucher }',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy voucher với mã đã cho',
  })
  async checkVoucher(
    @Param('code') code: string,
  ): Promise<CheckVoucherResult> {
    return this.vouchersService.checkVoucher(code);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết 1 voucher theo ID',
  })
  @ApiParam({
    name: 'id',
    example: 'VC001',
    description: 'Mã định danh voucher',
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin chi tiết voucher',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy voucher theo ID',
  })
  async findOne(@Param('id') id: string): Promise<Voucher> {
    return this.vouchersService.findOne(id);
  }

  @Roles('admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Tạo mới một voucher khuyến mãi',
  })
  @ApiResponse({
    status: 201,
    description: 'Voucher mới được tạo thành công',
  })
  @ApiResponse({
    status: 409,
    description: 'Mã voucher đã tồn tại',
  })
  async create(@Body() createVoucherDto: CreateVoucherDto): Promise<Voucher> {
    return this.vouchersService.create(createVoucherDto);
  }

  @Roles('admin')
  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật một phần thông tin voucher theo ID',
  })
  @ApiParam({
    name: 'id',
    example: 'VC001',
    description: 'Mã định danh voucher cần cập nhật',
  })
  @ApiResponse({
    status: 200,
    description: 'Voucher đã được cập nhật thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy voucher theo ID',
  })
  @ApiResponse({
    status: 409,
    description: 'Mã voucher mới bị trùng với voucher khác',
  })
  async update(
    @Param('id') id: string,
    @Body() updateVoucherDto: UpdateVoucherDto,
  ): Promise<Voucher> {
    return this.vouchersService.update(id, updateVoucherDto);
  }

  @Roles('admin')
  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa voucher khỏi hệ thống theo ID',
  })
  @ApiParam({
    name: 'id',
    example: 'VC001',
    description: 'Mã định danh voucher cần xóa',
  })
  @ApiResponse({
    status: 200,
    description: 'Voucher đã được xóa thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy voucher theo ID',
  })
  async remove(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string; deleted: Voucher }> {
    return this.vouchersService.remove(id);
  }
}
