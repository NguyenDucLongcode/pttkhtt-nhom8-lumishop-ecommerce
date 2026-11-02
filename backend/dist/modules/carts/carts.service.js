var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CartsService_1;
import { BadRequestException, Injectable, Logger, NotFoundException, } from '@nestjs/common';
import { DbService } from '../../database/db.service.js';
let CartsService = CartsService_1 = class CartsService {
    dbService;
    logger = new Logger(CartsService_1.name);
    constructor(dbService) {
        this.dbService = dbService;
    }
    async getCart(maKH) {
        const carts = await this.dbService.getData('carts');
        const userCart = carts.find((c) => c.maKH === maKH);
        if (!userCart || !Array.isArray(userCart.items) || userCart.items.length === 0) {
            return [];
        }
        const products = await this.dbService.getData('products');
        const productMap = new Map();
        for (const p of products) {
            productMap.set(p.id, p);
        }
        const populatedItems = [];
        for (const item of userCart.items) {
            const product = productMap.get(item.maSP);
            if (product) {
                populatedItems.push({
                    maSP: item.maSP,
                    soLuong: item.soLuong,
                    product,
                });
            }
        }
        return populatedItems;
    }
    async addToCart(maKH, dto) {
        const products = await this.dbService.getData('products');
        const product = products.find((p) => p.id === dto.maSP);
        if (!product) {
            throw new NotFoundException(`Không tìm thấy sản phẩm với mã "${dto.maSP}" trong hệ thống`);
        }
        if (product.soLuongTon <= 0 || product.trangThai === 'NgungBan') {
            throw new BadRequestException(`Sản phẩm "${product.tenSP}" hiện đã hết hàng hoặc ngừng kinh doanh`);
        }
        const carts = await this.dbService.getData('carts');
        let userCart = carts.find((c) => c.maKH === maKH);
        if (!userCart) {
            userCart = {
                id: `CART_${maKH}`,
                maKH,
                items: [],
            };
            carts.push(userCart);
        }
        if (!Array.isArray(userCart.items)) {
            userCart.items = [];
        }
        const existingItem = userCart.items.find((it) => it.maSP === dto.maSP);
        if (existingItem) {
            const totalRequested = existingItem.soLuong + dto.soLuong;
            existingItem.soLuong = Math.min(totalRequested, product.soLuongTon);
        }
        else {
            userCart.items.push({
                maSP: dto.maSP,
                soLuong: Math.min(dto.soLuong, product.soLuongTon),
            });
        }
        userCart.updatedAt = new Date().toISOString();
        await this.dbService.saveData('carts', carts);
        this.logger.log(`🛒 Khách hàng ${maKH} đã thêm SP ${dto.maSP} (SL: ${dto.soLuong}) vào giỏ hàng`);
        return this.getCart(maKH);
    }
    async updateQuantity(maKH, maSP, soLuong) {
        const carts = await this.dbService.getData('carts');
        const userCart = carts.find((c) => c.maKH === maKH);
        if (!userCart || !Array.isArray(userCart.items)) {
            throw new NotFoundException('Chưa tìm thấy giỏ hàng của người dùng');
        }
        if (soLuong <= 0) {
            userCart.items = userCart.items.filter((it) => it.maSP !== maSP);
        }
        else {
            const existingItem = userCart.items.find((it) => it.maSP === maSP);
            if (!existingItem) {
                throw new NotFoundException(`Sản phẩm với mã "${maSP}" không có trong giỏ hàng`);
            }
            const products = await this.dbService.getData('products');
            const product = products.find((p) => p.id === maSP);
            const maxStock = product ? product.soLuongTon : 999;
            existingItem.soLuong = Math.min(soLuong, maxStock);
        }
        userCart.updatedAt = new Date().toISOString();
        await this.dbService.saveData('carts', carts);
        this.logger.log(`🛒 Khách hàng ${maKH} đã cập nhật số lượng SP ${maSP} thành ${soLuong}`);
        return this.getCart(maKH);
    }
    async removeFromCart(maKH, maSP) {
        const carts = await this.dbService.getData('carts');
        const userCart = carts.find((c) => c.maKH === maKH);
        if (userCart && Array.isArray(userCart.items)) {
            userCart.items = userCart.items.filter((it) => it.maSP !== maSP);
            userCart.updatedAt = new Date().toISOString();
            await this.dbService.saveData('carts', carts);
            this.logger.log(`🛒 Khách hàng ${maKH} đã xóa SP ${maSP} khỏi giỏ hàng`);
        }
        return this.getCart(maKH);
    }
    async clearCart(maKH) {
        const carts = await this.dbService.getData('carts');
        const userCart = carts.find((c) => c.maKH === maKH);
        if (userCart) {
            userCart.items = [];
            userCart.updatedAt = new Date().toISOString();
            await this.dbService.saveData('carts', carts);
            this.logger.log(`🛒 Đã dọn sạch toàn bộ giỏ hàng của khách hàng ${maKH}`);
        }
        return [];
    }
};
CartsService = CartsService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [DbService])
], CartsService);
export { CartsService };
//# sourceMappingURL=carts.service.js.map