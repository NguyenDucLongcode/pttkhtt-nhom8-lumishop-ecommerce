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
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CustomersService, SafeCustomer } from './customers.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { QueryCustomerDto } from './dto/query-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách khách hàng (tìm kiếm theo Tên hoặc Số điện thoại)' })
  @ApiResponse({ status: 200, description: 'Danh sách khách hàng' })
  async findAll(@Query() query: QueryCustomerDto): Promise<SafeCustomer[]> {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết 1 khách hàng theo ID' })
  @ApiParam({ name: 'id', example: 'KH001', description: 'Mã định danh khách hàng' })
  @ApiResponse({ status: 200, description: 'Chi tiết khách hàng' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khách hàng' })
  async findOne(@Param('id') id: string): Promise<SafeCustomer> {
    return this.customersService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Đăng ký / Tạo mới một khách hàng' })
  @ApiResponse({ status: 201, description: 'Khách hàng tạo mới thành công' })
  @ApiResponse({ status: 409, description: 'Tên đăng nhập hoặc Email đã tồn tại' })
  async create(@Body() createCustomerDto: CreateCustomerDto): Promise<SafeCustomer> {
    return this.customersService.create(createCustomerDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân khách hàng theo ID (không đổi tài khoản/mật khẩu)' })
  @ApiParam({ name: 'id', example: 'KH001', description: 'Mã định danh khách hàng' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khách hàng' })
  @ApiResponse({ status: 409, description: 'Email mới đã được sử dụng' })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<SafeCustomer> {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa khách hàng theo ID' })
  @ApiParam({ name: 'id', example: 'KH001', description: 'Mã định danh khách hàng' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khách hàng' })
  async remove(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string; deleted: SafeCustomer }> {
    return this.customersService.remove(id);
  }
}
