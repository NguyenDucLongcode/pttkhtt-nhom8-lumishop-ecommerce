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
import { Body, Controller, Get, Param, Patch, Post, Query, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags, } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { QueryOrderDto } from './dto/query-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { OrdersService, } from './orders.service.js';
let OrdersController = class OrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async checkout(createOrderDto) {
        return this.ordersService.checkout(createOrderDto);
    }
    async findAll(query) {
        return this.ordersService.findAll(query);
    }
    async getRevenue() {
        return this.ordersService.getRevenueReport();
    }
    async getOrderHistory(maKH) {
        return this.ordersService.getOrderHistory(maKH);
    }
    async updateStatus(id, dto) {
        return this.ordersService.updateStatus(id, dto.trangThai);
    }
    async findOne(id) {
        return this.ordersService.findOne(id);
    }
};
__decorate([
    Post('checkout'),
    ApiOperation({
        summary: 'Xử lý đặt hàng (Checkout) & Tính toán hóa đơn',
        description: 'Thực hiện tuần tự 8 bước: kiểm tra khách hàng, tồn kho sản phẩm, tính tiền hàng, áp voucher, tính tổng thanh toán, tạo đơn hàng, trừ tồn kho và tạo bản ghi thanh toán.',
    }),
    ApiResponse({
        status: 201,
        description: 'Đặt hàng thành công và hóa đơn đã được khởi tạo.',
    }),
    ApiResponse({
        status: 400,
        description: 'Thông tin không hợp lệ: khách hàng không tồn tại, sản phẩm thiếu tồn kho, voucher không hợp lệ.',
    }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "checkout", null);
__decorate([
    Get(),
    ApiOperation({
        summary: 'Lấy danh sách đơn hàng',
        description: 'Hỗ trợ lọc đơn hàng theo trạng thái (trangThai).',
    }),
    ApiQuery({
        name: 'trangThai',
        required: false,
        description: 'Lọc theo trạng thái đơn hàng (ví dụ: ChoXacNhan, DangGiao, DaGiao, DaHuy)',
        example: 'ChoXacNhan',
    }),
    ApiResponse({
        status: 200,
        description: 'Danh sách đơn hàng.',
    }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [QueryOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findAll", null);
__decorate([
    Roles('admin'),
    Get('revenue'),
    ApiOperation({
        summary: 'Báo cáo doanh thu (Dành cho Admin)',
        description: 'Tổng hợp doanh thu từ các đơn hàng có trạng thái "DaGiao", số lượng đơn và chi tiết doanh thu theo từng ngày để vẽ biểu đồ.',
    }),
    ApiResponse({
        status: 200,
        description: 'Báo cáo doanh thu gồm totalRevenue, totalOrders và dailyRevenue theo từng ngày.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getRevenue", null);
__decorate([
    Get('history/:maKH'),
    ApiOperation({
        summary: 'Xem lịch sử đơn hàng của khách hàng',
        description: 'Lấy danh sách các đơn hàng đã đặt của một khách hàng dựa vào mã khách hàng (maKH), sắp xếp theo ngày đặt mới nhất.',
    }),
    ApiParam({
        name: 'maKH',
        description: 'Mã khách hàng cần xem lịch sử',
        example: 'KH001',
    }),
    ApiResponse({
        status: 200,
        description: 'Danh sách đơn hàng của khách hàng sắp xếp mới nhất trước.',
    }),
    __param(0, Param('maKH')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderHistory", null);
__decorate([
    Roles('admin'),
    Patch(':id/status'),
    ApiOperation({
        summary: 'Cập nhật trạng thái đơn hàng (Dành cho Admin)',
        description: 'Cập nhật trạng thái đơn hàng sang ChoXacNhan, DangGiao, DaGiao hoặc DaHuy. Khi chuyển sang DaHuy sẽ tự động hoàn lại tồn kho cho các sản phẩm.',
    }),
    ApiParam({
        name: 'id',
        description: 'Mã định danh đơn hàng cần cập nhật',
        example: 'DH1729350000000',
    }),
    ApiResponse({
        status: 200,
        description: 'Cập nhật trạng thái đơn hàng thành công.',
    }),
    ApiResponse({
        status: 400,
        description: 'Trạng thái không hợp lệ.',
    }),
    ApiResponse({
        status: 404,
        description: 'Không tìm thấy đơn hàng với ID tương ứng.',
    }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateOrderStatusDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateStatus", null);
__decorate([
    Get(':id'),
    ApiOperation({
        summary: 'Xem chi tiết một đơn hàng',
        description: 'Lấy thông tin chi tiết đơn hàng theo mã đơn (ID).',
    }),
    ApiParam({
        name: 'id',
        description: 'Mã đơn hàng (ví dụ: DH1729350000000 hoặc DH001)',
        example: 'DH001',
    }),
    ApiResponse({
        status: 200,
        description: 'Chi tiết đơn hàng tìm thấy.',
    }),
    ApiResponse({
        status: 404,
        description: 'Không tìm thấy đơn hàng với ID tương ứng.',
    }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findOne", null);
OrdersController = __decorate([
    ApiTags('Orders'),
    ApiBearerAuth('JWT-auth'),
    Controller('orders'),
    __metadata("design:paramtypes", [OrdersService])
], OrdersController);
export { OrdersController };
//# sourceMappingURL=orders.controller.js.map