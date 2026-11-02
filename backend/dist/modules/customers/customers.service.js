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
import * as crypto from 'crypto';
import { DbService } from '../../database/db.service.js';
let CustomersService = class CustomersService {
    dbService;
    collection = 'customers';
    constructor(dbService) {
        this.dbService = dbService;
    }
    hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex');
    }
    sanitize(customer) {
        const { matKhau: _, ...safeCustomer } = customer;
        return safeCustomer;
    }
    async findAll(query) {
        const customers = await this.dbService.getData(this.collection);
        if (query?.search && query.search.trim().length > 0) {
            const searchKey = query.search.trim().toLowerCase();
            const filtered = customers.filter((c) => c.hoTen.toLowerCase().includes(searchKey) ||
                c.sdt.toLowerCase().includes(searchKey));
            return filtered.map((c) => this.sanitize(c));
        }
        return customers.map((c) => this.sanitize(c));
    }
    async findOne(id) {
        const customers = await this.dbService.getData(this.collection);
        const customer = customers.find((c) => c.id === id);
        if (!customer) {
            throw new NotFoundException(`Không tìm thấy khách hàng với ID "${id}"`);
        }
        return this.sanitize(customer);
    }
    async create(dto) {
        const customers = await this.dbService.getData(this.collection);
        const normalizedUsername = dto.tenDangNhap.trim().toLowerCase();
        const normalizedEmail = dto.email.trim().toLowerCase();
        if (customers.some((c) => c.tenDangNhap.toLowerCase() === normalizedUsername)) {
            throw new ConflictException(`Tên đăng nhập "${dto.tenDangNhap}" đã tồn tại`);
        }
        if (customers.some((c) => c.email.toLowerCase() === normalizedEmail)) {
            throw new ConflictException(`Email "${dto.email}" đã được đăng ký`);
        }
        const now = new Date().toISOString();
        const newCustomer = {
            id: `KH${Date.now()}`,
            hoTen: dto.hoTen.trim(),
            sdt: dto.sdt.trim(),
            email: normalizedEmail,
            diaChi: dto.diaChi?.trim() || '',
            tenDangNhap: dto.tenDangNhap.trim(),
            matKhau: this.hashPassword(dto.matKhau),
            role: 'user',
            createdAt: now,
            updatedAt: now,
        };
        customers.push(newCustomer);
        await this.dbService.saveData(this.collection, customers);
        return this.sanitize(newCustomer);
    }
    async update(id, dto) {
        const customers = await this.dbService.getData(this.collection);
        const index = customers.findIndex((c) => c.id === id);
        if (index === -1) {
            throw new NotFoundException(`Không tìm thấy khách hàng với ID "${id}" để cập nhật`);
        }
        if (dto.email) {
            const normalizedEmail = dto.email.trim().toLowerCase();
            const emailExists = customers.some((c, i) => i !== index && c.email.toLowerCase() === normalizedEmail);
            if (emailExists) {
                throw new ConflictException(`Email "${dto.email}" đã được sử dụng bởi khách hàng khác`);
            }
        }
        const current = customers[index];
        const updatedCustomer = Object.assign({}, current, dto, {
            hoTen: dto.hoTen !== undefined ? dto.hoTen.trim() : current.hoTen,
            sdt: dto.sdt !== undefined ? dto.sdt.trim() : current.sdt,
            email: dto.email !== undefined ? dto.email.trim().toLowerCase() : current.email,
            diaChi: dto.diaChi !== undefined ? dto.diaChi.trim() : current.diaChi,
            updatedAt: new Date().toISOString(),
        });
        customers[index] = updatedCustomer;
        await this.dbService.saveData(this.collection, customers);
        return this.sanitize(updatedCustomer);
    }
    async remove(id) {
        const customers = await this.dbService.getData(this.collection);
        const index = customers.findIndex((c) => c.id === id);
        if (index === -1) {
            throw new NotFoundException(`Không tìm thấy khách hàng với ID "${id}" để xóa`);
        }
        const [deleted] = customers.splice(index, 1);
        await this.dbService.saveData(this.collection, customers);
        return {
            success: true,
            message: `Đã xóa thành công khách hàng với ID "${id}"`,
            deleted: this.sanitize(deleted),
        };
    }
};
CustomersService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [DbService])
], CustomersService);
export { CustomersService };
//# sourceMappingURL=customers.service.js.map