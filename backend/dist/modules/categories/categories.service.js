var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../../database/db.service.js';
let CategoriesService = class CategoriesService {
    dbService;
    collection = 'categories';
    constructor(dbService) {
        this.dbService = dbService;
    }
    async findAll(query) {
        const categories = await this.dbService.getData(this.collection);
        if (query?.search && query.search.trim().length > 0) {
            const searchKey = query.search.trim().toLowerCase();
            return categories.filter((c) => c.tenDanhMuc.toLowerCase().includes(searchKey));
        }
        return categories;
    }
    async findOne(id) {
        const categories = await this.dbService.getData(this.collection);
        const category = categories.find((c) => c.id === id);
        if (!category) {
            throw new NotFoundException(`Không tìm thấy danh mục với ID "${id}"`);
        }
        return category;
    }
    async create(dto) {
        const categories = await this.dbService.getData(this.collection);
        const now = new Date().toISOString();
        const newCategory = {
            id: `CAT${Date.now()}`,
            tenDanhMuc: dto.tenDanhMuc.trim(),
            moTa: dto.moTa?.trim() || '',
            createdAt: now,
            updatedAt: now,
        };
        categories.push(newCategory);
        await this.dbService.saveData(this.collection, categories);
        return newCategory;
    }
    async update(id, dto) {
        const categories = await this.dbService.getData(this.collection);
        const index = categories.findIndex((c) => c.id === id);
        if (index === -1) {
            throw new NotFoundException(`Không tìm thấy danh mục với ID "${id}" để cập nhật`);
        }
        const current = categories[index];
        const updatedCategory = Object.assign({}, current, dto, {
            tenDanhMuc: dto.tenDanhMuc !== undefined ? dto.tenDanhMuc.trim() : current.tenDanhMuc,
            moTa: dto.moTa !== undefined ? dto.moTa.trim() : current.moTa,
            updatedAt: new Date().toISOString(),
        });
        categories[index] = updatedCategory;
        await this.dbService.saveData(this.collection, categories);
        return updatedCategory;
    }
    async remove(id) {
        const categories = await this.dbService.getData(this.collection);
        const index = categories.findIndex((c) => c.id === id);
        if (index === -1) {
            throw new NotFoundException(`Không tìm thấy danh mục với ID "${id}" để xóa`);
        }
        const [deleted] = categories.splice(index, 1);
        await this.dbService.saveData(this.collection, categories);
        return {
            success: true,
            message: `Đã xóa thành công danh mục với ID "${id}"`,
            deleted,
        };
    }
};
CategoriesService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [DbService])
], CategoriesService);
export { CategoriesService };
//# sourceMappingURL=categories.service.js.map