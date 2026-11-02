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
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { QueryCategoryDto } from './dto/query-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
let CategoriesController = class CategoriesController {
    categoriesService;
    constructor(categoriesService) {
        this.categoriesService = categoriesService;
    }
    async findAll(query) {
        return this.categoriesService.findAll(query);
    }
    async findOne(id) {
        return this.categoriesService.findOne(id);
    }
    async create(createCategoryDto) {
        return this.categoriesService.create(createCategoryDto);
    }
    async update(id, updateCategoryDto) {
        return this.categoriesService.update(id, updateCategoryDto);
    }
    async remove(id) {
        return this.categoriesService.remove(id);
    }
};
__decorate([
    Public(),
    Get(),
    ApiOperation({ summary: 'Lấy danh sách toàn bộ danh mục sản phẩm (có tìm kiếm theo tên)' }),
    ApiResponse({
        status: 200,
        description: 'Danh sách các danh mục sản phẩm',
    }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [QueryCategoryDto]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "findAll", null);
__decorate([
    Public(),
    Get(':id'),
    ApiOperation({ summary: 'Lấy thông tin chi tiết 1 danh mục theo ID' }),
    ApiParam({ name: 'id', example: 'CAT1234567890', description: 'Mã định danh danh mục' }),
    ApiResponse({ status: 200, description: 'Chi tiết danh mục sản phẩm' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "findOne", null);
__decorate([
    Roles('admin'),
    Post(),
    HttpCode(HttpStatus.CREATED),
    ApiOperation({ summary: 'Tạo mới một danh mục sản phẩm' }),
    ApiResponse({ status: 201, description: 'Danh mục được tạo thành công' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateCategoryDto]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "create", null);
__decorate([
    Roles('admin'),
    Patch(':id'),
    ApiOperation({ summary: 'Cập nhật thông tin danh mục theo ID' }),
    ApiParam({ name: 'id', example: 'CAT1234567890', description: 'Mã định danh danh mục' }),
    ApiResponse({ status: 200, description: 'Cập nhật thành công' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateCategoryDto]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "update", null);
__decorate([
    Roles('admin'),
    Delete(':id'),
    ApiOperation({ summary: 'Xóa danh mục theo ID' }),
    ApiParam({ name: 'id', example: 'CAT1234567890', description: 'Mã định danh danh mục' }),
    ApiResponse({ status: 200, description: 'Xóa thành công' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "remove", null);
CategoriesController = __decorate([
    ApiTags('Categories'),
    ApiBearerAuth('JWT-auth'),
    Controller('categories'),
    __metadata("design:paramtypes", [CategoriesService])
], CategoriesController);
export { CategoriesController };
//# sourceMappingURL=categories.controller.js.map