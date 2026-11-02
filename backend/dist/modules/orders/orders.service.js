var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OrdersService_1;
import { BadRequestException, Injectable, Logger, NotFoundException, } from '@nestjs/common';
import { DbService } from '../../database/db.service.js';
let OrdersService = OrdersService_1 = class OrdersService {
    dbService;
    logger = new Logger(OrdersService_1.name);
    constructor(dbService) {
        this.dbService = dbService;
    }
    async checkout(dto) {
        const now = new Date();
        const nowIso = now.toISOString();
        const customers = await this.dbService.getData('customers');
        const customer = customers.find((c) => c.id === dto.maKH);
        if (!customer) {
            throw new BadRequestException(`Khách hàng với mã "${dto.maKH}" không tồn tại`);
        }
        const products = await this.dbService.getData('products');
        const requestedQuantityMap = new Map();
        for (const item of dto.items) {
            const current = requestedQuantityMap.get(item.maSP) || 0;
            requestedQuantityMap.set(item.maSP, current + item.soLuong);
        }
        for (const [maSP, totalQty] of requestedQuantityMap.entries()) {
            const product = products.find((p) => p.id === maSP);
            if (!product) {
                throw new BadRequestException(`Sản phẩm với mã "${maSP}" không tồn tại`);
            }
            if (product.soLuongTon < totalQty) {
                throw new BadRequestException(`Sản phẩm ${product.tenSP || maSP} không đủ số lượng`);
            }
        }
        let tongTienHang = 0;
        const orderItems = dto.items.map((item) => {
            const product = products.find((p) => p.id === item.maSP);
            const giaBan = Number(product.giaBan) || 0;
            const thanhTien = giaBan * item.soLuong;
            tongTienHang += thanhTien;
            return {
                maSP: item.maSP,
                tenSP: product.tenSP,
                giaBan,
                soLuong: item.soLuong,
                thanhTien,
            };
        });
        let tienGiamGia = 0;
        let appliedVoucherCode = undefined;
        if (dto.voucherCode && dto.voucherCode.trim().length > 0) {
            const cleanCode = dto.voucherCode.trim().toUpperCase();
            const vouchers = await this.dbService.getData('vouchers');
            const voucher = vouchers.find((v) => v.code.toUpperCase() === cleanCode);
            if (!voucher) {
                throw new BadRequestException(`Voucher với mã "${dto.voucherCode}" không tồn tại`);
            }
            if (!voucher.isActive) {
                throw new BadRequestException('Voucher hiện tại đang ngưng áp dụng');
            }
            if (new Date(voucher.startDate) > now) {
                throw new BadRequestException('Voucher chưa đến thời gian áp dụng');
            }
            if (new Date(voucher.endDate) < now) {
                throw new BadRequestException('Voucher đã hết hạn sử dụng');
            }
            if (voucher.usageLimit !== undefined &&
                voucher.usedCount >= voucher.usageLimit) {
                throw new BadRequestException('Voucher đã hết lượt sử dụng');
            }
            if (voucher.minOrderValue !== undefined &&
                tongTienHang < voucher.minOrderValue) {
                throw new BadRequestException(`Đơn hàng chưa đạt giá trị tối thiểu (${voucher.minOrderValue}đ) để áp dụng voucher`);
            }
            if (voucher.discountType === 'PERCENT') {
                let discount = (tongTienHang * voucher.discountValue) / 100;
                if (voucher.maxDiscountAmount !== undefined &&
                    discount > voucher.maxDiscountAmount) {
                    discount = voucher.maxDiscountAmount;
                }
                tienGiamGia = discount;
            }
            else if (voucher.discountType === 'FIXED') {
                tienGiamGia = voucher.discountValue;
            }
            if (tienGiamGia > tongTienHang) {
                tienGiamGia = tongTienHang;
            }
            appliedVoucherCode = voucher.code;
            const vIndex = vouchers.findIndex((v) => v.id === voucher.id);
            if (vIndex !== -1) {
                vouchers[vIndex].usedCount = (vouchers[vIndex].usedCount || 0) + 1;
                vouchers[vIndex].updatedAt = nowIso;
                await this.dbService.saveData('vouchers', vouchers);
            }
        }
        const phiShip = Number(dto.phiShip) || 0;
        const tongTien = Math.max(0, tongTienHang - tienGiamGia + phiShip);
        const orderTimestamp = Date.now();
        const orderId = `DH${orderTimestamp}`;
        const paymentId = `TT${orderTimestamp}`;
        const newOrder = {
            id: orderId,
            maKH: dto.maKH,
            diaChiGiao: dto.diaChiGiao.trim(),
            phuongThucTT: dto.phuongThucTT,
            items: orderItems,
            tongTienHang,
            tienGiamGia,
            phiShip,
            tongTien,
            voucherCode: appliedVoucherCode,
            ngayDat: nowIso,
            trangThai: 'ChoXacNhan',
            paymentId,
            createdAt: nowIso,
            updatedAt: nowIso,
        };
        const orders = await this.dbService.getData('orders');
        orders.push(newOrder);
        await this.dbService.saveData('orders', orders);
        for (const [maSP, qtyToDeduct] of requestedQuantityMap.entries()) {
            const pIndex = products.findIndex((p) => p.id === maSP);
            if (pIndex !== -1) {
                products[pIndex].soLuongTon = Math.max(0, products[pIndex].soLuongTon - qtyToDeduct);
            }
        }
        await this.dbService.saveData('products', products);
        const newPayment = {
            id: paymentId,
            maDH: orderId,
            soTien: tongTien,
            phuongThuc: dto.phuongThucTT,
            thoiGian: nowIso,
            trangThai: dto.phuongThucTT === 'COD' ? 'ChoThanhToan' : 'ChoThanhToan',
        };
        const payments = await this.dbService.getData('payments');
        payments.push(newPayment);
        await this.dbService.saveData('payments', payments);
        this.logger.log(` Đơn hàng ${orderId} đã được tạo thành công cho khách hàng ${dto.maKH}. Tổng tiền: ${tongTien}đ`);
        return newOrder;
    }
    async findAll(query) {
        const orders = await this.dbService.getData('orders');
        if (query?.trangThai && query.trangThai.trim().length > 0) {
            const filterStatus = query.trangThai.trim().toLowerCase();
            return orders.filter((o) => o.trangThai && o.trangThai.toLowerCase() === filterStatus);
        }
        return orders;
    }
    async findOne(id) {
        const orders = await this.dbService.getData('orders');
        const order = orders.find((o) => o.id === id);
        if (!order) {
            throw new NotFoundException(`Không tìm thấy đơn hàng với ID "${id}"`);
        }
        return order;
    }
    async updateStatus(id, status) {
        const orders = await this.dbService.getData('orders');
        const index = orders.findIndex((o) => o.id === id);
        if (index === -1) {
            throw new NotFoundException(`Không tìm thấy đơn hàng với ID "${id}"`);
        }
        const currentOrder = orders[index];
        const oldStatus = currentOrder.trangThai;
        if (status === 'DaHuy' && oldStatus !== 'DaHuy') {
            const products = await this.dbService.getData('products');
            if (currentOrder.items && Array.isArray(currentOrder.items)) {
                for (const item of currentOrder.items) {
                    const pIndex = products.findIndex((p) => p.id === item.maSP);
                    if (pIndex !== -1) {
                        products[pIndex].soLuongTon += item.soLuong;
                    }
                }
                await this.dbService.saveData('products', products);
                this.logger.log(` Đã hoàn lại tồn kho cho các sản phẩm của đơn hàng bị hủy: ${id}`);
            }
        }
        const updatedOrder = {
            ...currentOrder,
            trangThai: status,
            updatedAt: new Date().toISOString(),
        };
        orders[index] = updatedOrder;
        await this.dbService.saveData('orders', orders);
        this.logger.log(` Cập nhật trạng thái đơn hàng ${id}: ${oldStatus} -> ${status}`);
        return updatedOrder;
    }
    async getRevenueReport() {
        const orders = await this.dbService.getData('orders');
        const deliveredOrders = orders.filter((o) => o.trangThai === 'DaGiao');
        const totalOrders = deliveredOrders.length;
        const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (Number(o.tongTien) || 0), 0);
        const dailyMap = new Map();
        for (const order of deliveredOrders) {
            const rawDate = order.ngayDat || order.createdAt || new Date().toISOString();
            const dateStr = rawDate.slice(0, 10);
            const current = dailyMap.get(dateStr) || 0;
            dailyMap.set(dateStr, current + (Number(order.tongTien) || 0));
        }
        const dailyRevenue = Array.from(dailyMap.entries())
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .map(([date, revenue]) => ({ date, revenue }));
        return {
            totalRevenue,
            totalOrders,
            dailyRevenue,
        };
    }
    async getOrderHistory(maKH) {
        const orders = await this.dbService.getData('orders');
        const customerOrders = orders.filter((o) => o.maKH === maKH);
        customerOrders.sort((a, b) => {
            const timeA = new Date(a.ngayDat || a.createdAt || 0).getTime();
            const timeB = new Date(b.ngayDat || b.createdAt || 0).getTime();
            return timeB - timeA;
        });
        return customerOrders;
    }
};
OrdersService = OrdersService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [DbService])
], OrdersService);
export { OrdersService };
//# sourceMappingURL=orders.service.js.map