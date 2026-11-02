var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ConflictException, Injectable, NotFoundException, } from '@nestjs/common';
import { DbService } from '../../database/db.service.js';
let VouchersService = class VouchersService {
    dbService;
    collection = 'vouchers';
    constructor(dbService) {
        this.dbService = dbService;
    }
    async findAll(query) {
        const vouchers = await this.dbService.getData(this.collection);
        const page = query.page && Number(query.page) > 0 ? Number(query.page) : 1;
        const limit = query.limit && Number(query.limit) > 0 ? Number(query.limit) : 10;
        let filtered = [...vouchers];
        if (query.isActive !== undefined) {
            filtered = filtered.filter((v) => v.isActive === query.isActive);
        }
        if (query.code && query.code.trim().length > 0) {
            const searchCode = query.code.trim().toLowerCase();
            filtered = filtered.filter((v) => v.code.toLowerCase().includes(searchCode));
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
        const vouchers = await this.dbService.getData(this.collection);
        const voucher = vouchers.find((v) => v.id === id);
        if (!voucher) {
            throw new NotFoundException(`Voucher với ID "${id}" không tồn tại`);
        }
        return voucher;
    }
    async create(dto) {
        const vouchers = await this.dbService.getData(this.collection);
        const normalizedCode = dto.code.trim().toUpperCase();
        const exists = vouchers.some((v) => v.code.toUpperCase() === normalizedCode);
        if (exists) {
            throw new ConflictException(`Mã voucher "${normalizedCode}" đã tồn tại`);
        }
        const newId = `VC${String(vouchers.length + 1).padStart(3, '0')}`;
        const now = new Date().toISOString();
        const newVoucher = {
            id: newId,
            code: normalizedCode,
            description: dto.description.trim(),
            discountType: dto.discountType,
            discountValue: dto.discountValue,
            minOrderValue: dto.minOrderValue ?? 0,
            maxDiscountAmount: dto.maxDiscountAmount,
            startDate: dto.startDate,
            endDate: dto.endDate,
            usageLimit: dto.usageLimit,
            usedCount: 0,
            isActive: dto.isActive ?? true,
            createdAt: now,
            updatedAt: now,
        };
        vouchers.push(newVoucher);
        await this.dbService.saveData(this.collection, vouchers);
        return newVoucher;
    }
    async update(id, dto) {
        const vouchers = await this.dbService.getData(this.collection);
        const index = vouchers.findIndex((v) => v.id === id);
        if (index === -1) {
            throw new NotFoundException(`Không tìm thấy voucher với ID "${id}" để cập nhật`);
        }
        if (dto.code) {
            const normalizedCode = dto.code.trim().toUpperCase();
            const codeExists = vouchers.some((v, i) => i !== index && v.code.toUpperCase() === normalizedCode);
            if (codeExists) {
                throw new ConflictException(`Mã voucher "${normalizedCode}" đã tồn tại trên voucher khác`);
            }
        }
        const current = vouchers[index];
        const updatedVoucher = Object.assign({}, current, dto, {
            code: dto.code ? dto.code.trim().toUpperCase() : current.code,
            description: dto.description ? dto.description.trim() : current.description,
            updatedAt: new Date().toISOString(),
        });
        vouchers[index] = updatedVoucher;
        await this.dbService.saveData(this.collection, vouchers);
        return updatedVoucher;
    }
    async remove(id) {
        const vouchers = await this.dbService.getData(this.collection);
        const index = vouchers.findIndex((v) => v.id === id);
        if (index === -1) {
            throw new NotFoundException(`Không tìm thấy voucher với ID "${id}" để xóa`);
        }
        const [deleted] = vouchers.splice(index, 1);
        await this.dbService.saveData(this.collection, vouchers);
        return {
            success: true,
            message: `Đã xóa thành công voucher với ID "${id}"`,
            deleted,
        };
    }
    async checkVoucher(code) {
        const vouchers = await this.dbService.getData(this.collection);
        const cleanCode = code.trim().toUpperCase();
        const voucher = vouchers.find((v) => v.code.toUpperCase() === cleanCode);
        if (!voucher) {
            throw new NotFoundException(`Voucher với mã "${code}" không tồn tại`);
        }
        const now = new Date();
        if (!voucher.isActive) {
            return {
                isValid: false,
                message: 'Voucher hiện tại đang ngưng áp dụng',
                voucher,
            };
        }
        if (new Date(voucher.startDate) > now) {
            return {
                isValid: false,
                message: 'Voucher chưa đến thời gian áp dụng',
                voucher,
            };
        }
        if (new Date(voucher.endDate) < now) {
            return {
                isValid: false,
                message: 'Voucher đã hết hạn sử dụng',
                voucher,
            };
        }
        if (voucher.usageLimit !== undefined &&
            voucher.usedCount >= voucher.usageLimit) {
            return {
                isValid: false,
                message: 'Voucher đã hết lượt sử dụng',
                voucher,
            };
        }
        return {
            isValid: true,
            message: 'Mã voucher hợp lệ và có thể sử dụng',
            voucher,
        };
    }
};
VouchersService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [DbService])
], VouchersService);
export { VouchersService };
//# sourceMappingURL=vouchers.service.js.map