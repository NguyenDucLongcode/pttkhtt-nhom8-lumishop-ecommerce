import { DbService } from '../../database/db.service.js';
import { AddToCartDto } from './dto/add-to-cart.dto.js';
export interface CartItemRecord {
    maSP: string;
    soLuong: number;
}
export interface CartRecord {
    id: string;
    maKH: string;
    items: CartItemRecord[];
    updatedAt?: string;
}
export interface CartPopulatedItem {
    maSP: string;
    soLuong: number;
    product: any;
}
export declare class CartsService {
    private readonly dbService;
    private readonly logger;
    constructor(dbService: DbService);
    getCart(maKH: string): Promise<CartPopulatedItem[]>;
    addToCart(maKH: string, dto: AddToCartDto): Promise<CartPopulatedItem[]>;
    updateQuantity(maKH: string, maSP: string, soLuong: number): Promise<CartPopulatedItem[]>;
    removeFromCart(maKH: string, maSP: string): Promise<CartPopulatedItem[]>;
    clearCart(maKH: string): Promise<CartPopulatedItem[]>;
}
