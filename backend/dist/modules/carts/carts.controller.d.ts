import { CartPopulatedItem, CartsService } from './carts.service.js';
import { AddToCartDto } from './dto/add-to-cart.dto.js';
import { UpdateCartQuantityDto } from './dto/update-cart-quantity.dto.js';
export declare class CartsController {
    private readonly cartsService;
    constructor(cartsService: CartsService);
    private extractUserId;
    getCart(req: any): Promise<CartPopulatedItem[]>;
    addToCart(req: any, dto: AddToCartDto): Promise<CartPopulatedItem[]>;
    updateQuantity(req: any, dto: UpdateCartQuantityDto): Promise<CartPopulatedItem[]>;
    removeFromCart(req: any, maSP: string): Promise<CartPopulatedItem[]>;
    clearCart(req: any): Promise<CartPopulatedItem[]>;
}
