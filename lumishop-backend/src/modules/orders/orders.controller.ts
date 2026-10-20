import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { QueryOrderDto } from './dto/query-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import {
  Order,
  OrdersService,
  RevenueReportResult,
} from './orders.service.js';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @ApiOperation({
    summary: 'Xử lý đặt hàng (Checkout) & Tính toán hóa đơn',
    description:
      'Thực hiện tuần tự 8 bước: kiểm tra khách hàng, tồn kho sản phẩm, tính tiền hàng, áp voucher, tính tổng thanh toán, tạo đơn hàng, trừ tồn kho và tạo bản ghi thanh toán.',
  })
  @ApiResponse({
    status: 201,
    description: 'Đặt hàng thành công và hóa đơn đã được khởi tạo.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Thông tin không hợp lệ: khách hàng không tồn tại, sản phẩm thiếu tồn kho, voucher không hợp lệ.',
  })
  async checkout(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersService.checkout(createOrderDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách đơn hàng',
    description: 'Hỗ trợ lọc đơn hàng theo trạng thái (trangThai).',
  })
  @ApiQuery({
    name: 'trangThai',
    required: false,
    description:
      'Lọc theo trạng thái đơn hàng (ví dụ: ChoXacNhan, DangGiao, DaGiao, DaHuy)',
    example: 'ChoXacNhan',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách đơn hàng.',
  })
  async findAll(@Query() query: QueryOrderDto): Promise<Order[]> {
    return this.ordersService.findAll(query);
  }

  @Roles('admin')
  @Get('revenue')
  @ApiOperation({
    summary: 'Báo cáo doanh thu (Dành cho Admin)',
    description:
      'Tổng hợp doanh thu từ các đơn hàng có trạng thái "DaGiao", số lượng đơn và chi tiết doanh thu theo từng ngày để vẽ biểu đồ.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Báo cáo doanh thu gồm totalRevenue, totalOrders và dailyRevenue theo từng ngày.',
  })
  async getRevenue(): Promise<RevenueReportResult> {
    return this.ordersService.getRevenueReport();
  }

  @Get('history/:maKH')
  @ApiOperation({
    summary: 'Xem lịch sử đơn hàng của khách hàng',
    description:
      'Lấy danh sách các đơn hàng đã đặt của một khách hàng dựa vào mã khách hàng (maKH), sắp xếp theo ngày đặt mới nhất.',
  })
  @ApiParam({
    name: 'maKH',
    description: 'Mã khách hàng cần xem lịch sử',
    example: 'KH001',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách đơn hàng của khách hàng sắp xếp mới nhất trước.',
  })
  async getOrderHistory(@Param('maKH') maKH: string): Promise<Order[]> {
    return this.ordersService.getOrderHistory(maKH);
  }

  @Roles('admin')
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Cập nhật trạng thái đơn hàng (Dành cho Admin)',
    description:
      'Cập nhật trạng thái đơn hàng sang ChoXacNhan, DangGiao, DaGiao hoặc DaHuy. Khi chuyển sang DaHuy sẽ tự động hoàn lại tồn kho cho các sản phẩm.',
  })
  @ApiParam({
    name: 'id',
    description: 'Mã định danh đơn hàng cần cập nhật',
    example: 'DH1729350000000',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật trạng thái đơn hàng thành công.',
  })
  @ApiResponse({
    status: 400,
    description: 'Trạng thái không hợp lệ.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy đơn hàng với ID tương ứng.',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.ordersService.updateStatus(id, dto.trangThai);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Xem chi tiết một đơn hàng',
    description: 'Lấy thông tin chi tiết đơn hàng theo mã đơn (ID).',
  })
  @ApiParam({
    name: 'id',
    description: 'Mã đơn hàng (ví dụ: DH1729350000000 hoặc DH001)',
    example: 'DH001',
  })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết đơn hàng tìm thấy.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy đơn hàng với ID tương ứng.',
  })
  async findOne(@Param('id') id: string): Promise<Order> {
    return this.ordersService.findOne(id);
  }
}
