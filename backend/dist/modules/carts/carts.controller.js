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
import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UnauthorizedException, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, } from '@nestjs/swagger';
import { CartsService } from './carts.service.js';
import { AddToCartDto } from './dto/add-to-cart.dto.js';
import { UpdateCartQuantityDto } from './dto/update-cart-quantity.dto.js';
let CartsController = class CartsController {
    cartsService;
    constructor(cartsService) {
        this.cartsService = cartsService;
    }
    extractUserId(req) {
        const userId = req.user?.sub || req.user?.userId;
        if (!userId) {
            throw new UnauthorizedException('Vui lòng đăng nhập để thực hiện thao tác giỏ hàng');
        }
        return userId;
    }
    async getCart(req) {
        const maKH = this.extractUserId(req);
        return this.cartsService.getCart(maKH);
    }
    async addToCart(req, dto) {
        const maKH = this.extractUserId(req);
        return this.cartsService.addToCart(maKH, dto);
    }
    async updateQuantity(req, dto) {
        const maKH = this.extractUserId(req);
        return this.cartsService.updateQuantity(maKH, dto.maSP, dto.soLuong);
    }
    async removeFromCart(req, maSP) {
        const maKH = this.extractUserId(req);
        return this.cartsService.removeFromCart(maKH, maSP);
    }
    async clearCart(req) {
        const maKH = this.extractUserId(req);
        return this.cartsService.clearCart(maKH);
    }
};
__decorate([
    Get(),
    ApiOperation({
        summary: 'Lấy giỏ hàng hiện tại',
        description: 'Lấy danh sách các sản phẩm đang có trong giỏ hàng của người dùng hiện tại kèm theo thông tin chi tiết từng sản phẩm.',
    }),
    ApiResponse({
        status: 200,
        description: 'Danh sách sản phẩm trong giỏ hàng.',
    }),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "getCart", null);
__decorate([
    Post('add'),
    ApiOperation({
        summary: 'Thêm sản phẩm vào giỏ hàng',
        description: 'Thêm một sản phẩm vào giỏ hàng. Nếu sản phẩm đã có thì tự động cộng dồn số lượng. Kiểm tra tồn kho trước khi thêm.',
    }),
    ApiResponse({
        status: 200,
        description: 'Thêm vào giỏ hàng thành công, trả về danh sách giỏ hàng mới nhất.',
    }),
    ApiResponse({
        status: 400,
        description: 'Sản phẩm đã hết hàng hoặc ngừng kinh doanh.',
    }),
    ApiResponse({
        status: 404,
        description: 'Sản phẩm không tồn tại.',
    }),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, AddToCartDto]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "addToCart", null);
__decorate([
    Patch('update'),
    ApiOperation({
        summary: 'Cập nhật số lượng sản phẩm trong giỏ',
        description: 'Cập nhật số lượng mới của một món đồ trong giỏ hàng. Nếu số lượng <= 0 sẽ tự động xóa khỏi giỏ.',
    }),
    ApiResponse({
        status: 200,
        description: 'Cập nhật thành công, trả về danh sách giỏ hàng mới nhất.',
    }),
    ApiResponse({
        status: 404,
        description: 'Không tìm thấy giỏ hàng hoặc sản phẩm trong giỏ.',
    }),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateCartQuantityDto]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "updateQuantity", null);
__decorate([
    Delete('remove/:maSP'),
    ApiOperation({
        summary: 'Xóa 1 sản phẩm khỏi giỏ hàng',
        description: 'Xóa một sản phẩm cụ thể theo mã sản phẩm (maSP) khỏi giỏ hàng.',
    }),
    ApiParam({
        name: 'maSP',
        description: 'Mã sản phẩm muốn xóa',
        example: 'SP001',
    }),
    ApiResponse({
        status: 200,
        description: 'Xóa sản phẩm thành công, trả về danh sách giỏ hàng cập nhật.',
    }),
    __param(0, Req()),
    __param(1, Param('maSP')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "removeFromCart", null);
__decorate([
    Delete('clear'),
    ApiOperation({
        summary: 'Xóa toàn bộ giỏ hàng',
        description: 'Làm trống toàn bộ giỏ hàng của người dùng (thường gọi sau khi hoàn tất đặt hàng).',
    }),
    ApiResponse({
        status: 200,
        description: 'Đã xóa sạch giỏ hàng.',
    }),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "clearCart", null);
CartsController = __decorate([
    ApiTags('Carts'),
    ApiBearerAuth('JWT-auth'),
    Controller('carts'),
    __metadata("design:paramtypes", [CartsService])
], CartsController);
export { CartsController };
//# sourceMappingURL=carts.controller.js.map