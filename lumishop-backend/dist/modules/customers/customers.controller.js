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
import { ApiOperation, ApiParam, ApiResponse, ApiTags, } from '@nestjs/swagger';
import { CustomersService } from './customers.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { QueryCustomerDto } from './dto/query-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
let CustomersController = class CustomersController {
    customersService;
    constructor(customersService) {
        this.customersService = customersService;
    }
    async findAll(query) {
        return this.customersService.findAll(query);
    }
    async findOne(id) {
        return this.customersService.findOne(id);
    }
    async create(createCustomerDto) {
        return this.customersService.create(createCustomerDto);
    }
    async update(id, updateCustomerDto) {
        return this.customersService.update(id, updateCustomerDto);
    }
    async remove(id) {
        return this.customersService.remove(id);
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'Lấy danh sách khách hàng (tìm kiếm theo Tên hoặc Số điện thoại)' }),
    ApiResponse({ status: 200, description: 'Danh sách khách hàng' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [QueryCustomerDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'Lấy thông tin chi tiết 1 khách hàng theo ID' }),
    ApiParam({ name: 'id', example: 'KH001', description: 'Mã định danh khách hàng' }),
    ApiResponse({ status: 200, description: 'Chi tiết khách hàng' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy khách hàng' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "findOne", null);
__decorate([
    Post(),
    HttpCode(HttpStatus.CREATED),
    ApiOperation({ summary: 'Đăng ký / Tạo mới một khách hàng' }),
    ApiResponse({ status: 201, description: 'Khách hàng tạo mới thành công' }),
    ApiResponse({ status: 409, description: 'Tên đăng nhập hoặc Email đã tồn tại' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateCustomerDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "create", null);
__decorate([
    Patch(':id'),
    ApiOperation({ summary: 'Cập nhật thông tin cá nhân khách hàng theo ID (không đổi tài khoản/mật khẩu)' }),
    ApiParam({ name: 'id', example: 'KH001', description: 'Mã định danh khách hàng' }),
    ApiResponse({ status: 200, description: 'Cập nhật thành công' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy khách hàng' }),
    ApiResponse({ status: 409, description: 'Email mới đã được sử dụng' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateCustomerDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "update", null);
__decorate([
    Delete(':id'),
    ApiOperation({ summary: 'Xóa khách hàng theo ID' }),
    ApiParam({ name: 'id', example: 'KH001', description: 'Mã định danh khách hàng' }),
    ApiResponse({ status: 200, description: 'Xóa thành công' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy khách hàng' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "remove", null);
CustomersController = __decorate([
    ApiTags('Customers'),
    Controller('customers'),
    __metadata("design:paramtypes", [CustomersService])
], CustomersController);
export { CustomersController };
//# sourceMappingURL=customers.controller.js.map