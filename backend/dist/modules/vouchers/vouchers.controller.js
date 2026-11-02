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
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CreateVoucherDto } from './dto/create-voucher.dto.js';
import { QueryVoucherDto } from './dto/query-voucher.dto.js';
import { UpdateVoucherDto } from './dto/update-voucher.dto.js';
import { VouchersService, } from './vouchers.service.js';
let VouchersController = class VouchersController {
    vouchersService;
    constructor(vouchersService) {
        this.vouchersService = vouchersService;
    }
    async findAll(query) {
        return this.vouchersService.findAll(query);
    }
    async checkVoucher(code) {
        return this.vouchersService.checkVoucher(code);
    }
    async findOne(id) {
        return this.vouchersService.findOne(id);
    }
    async create(createVoucherDto) {
        return this.vouchersService.create(createVoucherDto);
    }
    async update(id, updateVoucherDto) {
        return this.vouchersService.update(id, updateVoucherDto);
    }
    async remove(id) {
        return this.vouchersService.remove(id);
    }
};
__decorate([
    Public(),
    Get(),
    ApiOperation({
        summary: 'Lấy danh sách voucher (có phân trang & lọc theo isActive, code)',
    }),
    ApiResponse({
        status: 200,
        description: 'Danh sách voucher kèm thông tin phân trang { data, total, page, limit }',
    }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [QueryVoucherDto]),
    __metadata("design:returntype", Promise)
], VouchersController.prototype, "findAll", null);
__decorate([
    Public(),
    Get('check/:code'),
    ApiOperation({
        summary: 'Kiểm tra tính hợp lệ của mã giảm giá (check hạn dùng, trạng thái, lượt dùng)',
    }),
    ApiParam({
        name: 'code',
        example: 'LUMI10',
        description: 'Mã voucher cần kiểm tra',
    }),
    ApiResponse({
        status: 200,
        description: 'Kết quả kiểm tra mã voucher { isValid, message, voucher }',
    }),
    ApiResponse({
        status: 404,
        description: 'Không tìm thấy voucher với mã đã cho',
    }),
    __param(0, Param('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VouchersController.prototype, "checkVoucher", null);
__decorate([
    Public(),
    Get(':id'),
    ApiOperation({
        summary: 'Lấy thông tin chi tiết 1 voucher theo ID',
    }),
    ApiParam({
        name: 'id',
        example: 'VC001',
        description: 'Mã định danh voucher',
    }),
    ApiResponse({
        status: 200,
        description: 'Thông tin chi tiết voucher',
    }),
    ApiResponse({
        status: 404,
        description: 'Không tìm thấy voucher theo ID',
    }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VouchersController.prototype, "findOne", null);
__decorate([
    Roles('admin'),
    Post(),
    HttpCode(HttpStatus.CREATED),
    ApiOperation({
        summary: 'Tạo mới một voucher khuyến mãi',
    }),
    ApiResponse({
        status: 201,
        description: 'Voucher mới được tạo thành công',
    }),
    ApiResponse({
        status: 409,
        description: 'Mã voucher đã tồn tại',
    }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateVoucherDto]),
    __metadata("design:returntype", Promise)
], VouchersController.prototype, "create", null);
__decorate([
    Roles('admin'),
    Patch(':id'),
    ApiOperation({
        summary: 'Cập nhật một phần thông tin voucher theo ID',
    }),
    ApiParam({
        name: 'id',
        example: 'VC001',
        description: 'Mã định danh voucher cần cập nhật',
    }),
    ApiResponse({
        status: 200,
        description: 'Voucher đã được cập nhật thành công',
    }),
    ApiResponse({
        status: 404,
        description: 'Không tìm thấy voucher theo ID',
    }),
    ApiResponse({
        status: 409,
        description: 'Mã voucher mới bị trùng với voucher khác',
    }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateVoucherDto]),
    __metadata("design:returntype", Promise)
], VouchersController.prototype, "update", null);
__decorate([
    Roles('admin'),
    Delete(':id'),
    ApiOperation({
        summary: 'Xóa voucher khỏi hệ thống theo ID',
    }),
    ApiParam({
        name: 'id',
        example: 'VC001',
        description: 'Mã định danh voucher cần xóa',
    }),
    ApiResponse({
        status: 200,
        description: 'Voucher đã được xóa thành công',
    }),
    ApiResponse({
        status: 404,
        description: 'Không tìm thấy voucher theo ID',
    }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VouchersController.prototype, "remove", null);
VouchersController = __decorate([
    ApiTags('Vouchers'),
    ApiBearerAuth('JWT-auth'),
    Controller('vouchers'),
    __metadata("design:paramtypes", [VouchersService])
], VouchersController);
export { VouchersController };
//# sourceMappingURL=vouchers.controller.js.map