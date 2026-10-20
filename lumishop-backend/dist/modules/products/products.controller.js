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
import { CreateProductDto } from './dto/create-product.dto.js';
import { ProductDto } from './dto/product.dto.js';
import { QueryProductDto } from './dto/query-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ProductsService, } from './products.service.js';
let ProductsController = class ProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    async findAll(query) {
        return this.productsService.findAll(query);
    }
    async findOne(id) {
        return this.productsService.findOne(id);
    }
    async create(dto) {
        return this.productsService.create(dto);
    }
    async update(id, dto) {
        return this.productsService.update(id, dto);
    }
    async remove(id) {
        return this.productsService.remove(id);
    }
};
__decorate([
    Public(),
    Get(),
    ApiOperation({
        summary: 'Lấy danh sách sản phẩm (phân trang, tìm kiếm, lọc danh mục)',
    }),
    ApiResponse({
        status: 200,
        description: 'Danh sách sản phẩm kèm phân trang { data, total, page, limit }',
        type: [ProductDto],
    }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [QueryProductDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findAll", null);
__decorate([
    Public(),
    Get(':id'),
    ApiOperation({ summary: 'Xem chi tiết một sản phẩm' }),
    ApiParam({ name: 'id', description: 'Mã sản phẩm', example: 'SP001' }),
    ApiResponse({ status: 200, description: 'Chi tiết sản phẩm.' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm.' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findOne", null);
__decorate([
    Roles('admin'),
    Post(),
    HttpCode(HttpStatus.CREATED),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Thêm sản phẩm mới (Admin)' }),
    ApiResponse({ status: 201, description: 'Tạo sản phẩm thành công.' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateProductDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "create", null);
__decorate([
    Roles('admin'),
    Patch(':id'),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Cập nhật sản phẩm (Admin)' }),
    ApiParam({ name: 'id', description: 'Mã sản phẩm cần cập nhật', example: 'SP001' }),
    ApiResponse({ status: 200, description: 'Cập nhật sản phẩm thành công.' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm.' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateProductDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "update", null);
__decorate([
    Roles('admin'),
    Delete(':id'),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Xóa sản phẩm (Admin)' }),
    ApiParam({ name: 'id', description: 'Mã sản phẩm cần xóa', example: 'SP001' }),
    ApiResponse({ status: 200, description: 'Xóa sản phẩm thành công.' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm.' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "remove", null);
ProductsController = __decorate([
    ApiTags('Products'),
    Controller('products'),
    __metadata("design:paramtypes", [ProductsService])
], ProductsController);
export { ProductsController };
//# sourceMappingURL=products.controller.js.map