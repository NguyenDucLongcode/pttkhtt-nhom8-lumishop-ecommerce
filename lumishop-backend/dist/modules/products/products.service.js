var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ProductsService_1;
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DbService } from '../../database/db.service.js';
let ProductsService = ProductsService_1 = class ProductsService {
    dbService;
    logger = new Logger(ProductsService_1.name);
    constructor(dbService) {
        this.dbService = dbService;
    }
    async findAll(query = {}) {
        const products = await this.dbService.getData('products');
        const page = query.page && Number(query.page) > 0 ? Number(query.page) : 1;
        const limit = query.limit && Number(query.limit) > 0 ? Number(query.limit) : 10;
        let filtered = [...products];
        if (query.search && query.search.trim().length > 0) {
            const searchKey = query.search.trim().toLowerCase();
            filtered = filtered.filter((p) => (p.tenSP || '').toLowerCase().includes(searchKey) ||
                (p.moTa || '').toLowerCase().includes(searchKey) ||
                (p.id || '').toLowerCase().includes(searchKey));
        }
        if (query.categoryId && query.categoryId.trim().length > 0) {
            const categoryId = query.categoryId.trim();
            filtered = filtered.filter((p) => p.categoryId === categoryId);
        }
        const total = filtered.length;
        const startIndex = (page - 1) * limit;
        const data = filtered.slice(startIndex, startIndex + limit);
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async findOne(id) {
        const products = await this.dbService.getData('products');
        const product = products.find((p) => p.id === id);
        if (!product) {
            throw new NotFoundException(`Không tìm thấy sản phẩm với mã: ${id}`);
        }
        return product;
    }
    async getRecommendations(productId) {
        const products = await this.dbService.getData('products');
        const current = products.find((p) => p.id === productId);
        if (!current) {
            throw new NotFoundException(`Không tìm thấy sản phẩm với mã: ${productId}`);
        }
        const selling = products.filter((p) => p.id !== productId && p.trangThai === 'DangBan');
        const sameCategory = current.categoryId
            ? selling.filter((p) => p.categoryId === current.categoryId)
            : [];
        if (sameCategory.length > 0) {
            return sameCategory.slice(0, 4);
        }
        return this.shuffle(selling).slice(0, 4);
    }
    async create(dto) {
        const products = await this.dbService.getData('products');
        const now = new Date().toISOString();
        const newProduct = {
            id: this.nextProductId(products),
            tenSP: dto.tenSP,
            moTa: dto.moTa,
            giaBan: dto.giaBan,
            soLuongTon: dto.soLuongTon,
            hinhAnh: dto.hinhAnh || '',
            categoryId: dto.categoryId || '',
            trangThai: dto.trangThai || 'DangBan',
            createdAt: now,
            updatedAt: now,
        };
        products.push(newProduct);
        await this.dbService.saveData('products', products);
        this.logger.log(`Đã thêm sản phẩm mới: ${newProduct.tenSP} (${newProduct.id})`);
        return newProduct;
    }
    async update(id, dto) {
        const products = await this.dbService.getData('products');
        const index = products.findIndex((p) => p.id === id);
        if (index === -1) {
            throw new NotFoundException(`Không tìm thấy sản phẩm với mã: ${id}`);
        }
        const now = new Date().toISOString();
        if (dto.tenSP !== undefined)
            products[index].tenSP = dto.tenSP;
        if (dto.moTa !== undefined)
            products[index].moTa = dto.moTa;
        if (dto.giaBan !== undefined)
            products[index].giaBan = dto.giaBan;
        if (dto.soLuongTon !== undefined)
            products[index].soLuongTon = dto.soLuongTon;
        if (dto.hinhAnh !== undefined)
            products[index].hinhAnh = dto.hinhAnh;
        if (dto.categoryId !== undefined)
            products[index].categoryId = dto.categoryId;
        if (dto.trangThai !== undefined)
            products[index].trangThai = dto.trangThai;
        products[index].updatedAt = now;
        await this.dbService.saveData('products', products);
        this.logger.log(`Đã cập nhật sản phẩm: ${products[index].tenSP} (${id})`);
        return products[index];
    }
    async remove(id) {
        const products = await this.dbService.getData('products');
        const index = products.findIndex((p) => p.id === id);
        if (index === -1) {
            throw new NotFoundException(`Không tìm thấy sản phẩm với mã: ${id}`);
        }
        const removedName = products[index].tenSP;
        products.splice(index, 1);
        await this.dbService.saveData('products', products);
        this.logger.log(`Đã xóa sản phẩm: ${removedName} (${id})`);
        return {
            success: true,
            message: `Đã xóa sản phẩm "${removedName}" (${id}) thành công`,
        };
    }
    shuffle(items) {
        const copy = [...items];
        for (let i = copy.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }
    nextProductId(products) {
        let maxNum = 0;
        for (const product of products) {
            const match = /^SP(\d+)$/i.exec(product.id || '');
            if (match) {
                const num = Number(match[1]);
                if (num > maxNum)
                    maxNum = num;
            }
        }
        return `SP${String(maxNum + 1).padStart(3, '0')}`;
    }
};
ProductsService = ProductsService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [DbService])
], ProductsService);
export { ProductsService };
//# sourceMappingURL=products.service.js.map