import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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

interface ProductRecord {
  id: string;
  tenSP: string;
  giaBan: number;
  soLuongTon: number;
  trangThai: string;
  hinhAnh?: string;
  [key: string]: any;
}

@Injectable()
export class CartsService {
  private readonly logger = new Logger(CartsService.name);

  constructor(private readonly dbService: DbService) {}

  /**
   * Lấy giỏ hàng của user kèm thông tin chi tiết từng sản phẩm
   */
  async getCart(maKH: string): Promise<CartPopulatedItem[]> {
    const carts = await this.dbService.getData<CartRecord>('carts');
    const userCart = carts.find((c) => c.maKH === maKH);

    if (!userCart || !Array.isArray(userCart.items) || userCart.items.length === 0) {
      return [];
    }

    const products = await this.dbService.getData<ProductRecord>('products');
    const productMap = new Map<string, ProductRecord>();
    for (const p of products) {
      productMap.set(p.id, p);
    }

    const populatedItems: CartPopulatedItem[] = [];
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

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  async addToCart(
    maKH: string,
    dto: AddToCartDto,
  ): Promise<CartPopulatedItem[]> {
    const products = await this.dbService.getData<ProductRecord>('products');
    const product = products.find((p) => p.id === dto.maSP);

    if (!product) {
      throw new NotFoundException(
        `Không tìm thấy sản phẩm với mã "${dto.maSP}" trong hệ thống`,
      );
    }

    if (product.soLuongTon <= 0 || product.trangThai === 'NgungBan') {
      throw new BadRequestException(
        `Sản phẩm "${product.tenSP}" hiện đã hết hàng hoặc ngừng kinh doanh`,
      );
    }

    const carts = await this.dbService.getData<CartRecord>('carts');
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
    } else {
      userCart.items.push({
        maSP: dto.maSP,
        soLuong: Math.min(dto.soLuong, product.soLuongTon),
      });
    }

    userCart.updatedAt = new Date().toISOString();
    await this.dbService.saveData('carts', carts);
    this.logger.log(
      `🛒 Khách hàng ${maKH} đã thêm SP ${dto.maSP} (SL: ${dto.soLuong}) vào giỏ hàng`,
    );

    return this.getCart(maKH);
  }

  /**
   * Cập nhật số lượng của một món đồ trong giỏ hàng
   */
  async updateQuantity(
    maKH: string,
    maSP: string,
    soLuong: number,
  ): Promise<CartPopulatedItem[]> {
    const carts = await this.dbService.getData<CartRecord>('carts');
    const userCart = carts.find((c) => c.maKH === maKH);

    if (!userCart || !Array.isArray(userCart.items)) {
      throw new NotFoundException('Chưa tìm thấy giỏ hàng của người dùng');
    }

    if (soLuong <= 0) {
      userCart.items = userCart.items.filter((it) => it.maSP !== maSP);
    } else {
      const existingItem = userCart.items.find((it) => it.maSP === maSP);
      if (!existingItem) {
        throw new NotFoundException(
          `Sản phẩm với mã "${maSP}" không có trong giỏ hàng`,
        );
      }

      const products = await this.dbService.getData<ProductRecord>('products');
      const product = products.find((p) => p.id === maSP);
      const maxStock = product ? product.soLuongTon : 999;
      existingItem.soLuong = Math.min(soLuong, maxStock);
    }

    userCart.updatedAt = new Date().toISOString();
    await this.dbService.saveData('carts', carts);
    this.logger.log(
      `🛒 Khách hàng ${maKH} đã cập nhật số lượng SP ${maSP} thành ${soLuong}`,
    );

    return this.getCart(maKH);
  }

  /**
   * Xóa một món đồ khỏi giỏ hàng
   */
  async removeFromCart(
    maKH: string,
    maSP: string,
  ): Promise<CartPopulatedItem[]> {
    const carts = await this.dbService.getData<CartRecord>('carts');
    const userCart = carts.find((c) => c.maKH === maKH);

    if (userCart && Array.isArray(userCart.items)) {
      userCart.items = userCart.items.filter((it) => it.maSP !== maSP);
      userCart.updatedAt = new Date().toISOString();
      await this.dbService.saveData('carts', carts);
      this.logger.log(`🛒 Khách hàng ${maKH} đã xóa SP ${maSP} khỏi giỏ hàng`);
    }

    return this.getCart(maKH);
  }

  /**
   * Xóa toàn bộ giỏ hàng (sau khi checkout thành công)
   */
  async clearCart(maKH: string): Promise<CartPopulatedItem[]> {
    const carts = await this.dbService.getData<CartRecord>('carts');
    const userCart = carts.find((c) => c.maKH === maKH);

    if (userCart) {
      userCart.items = [];
      userCart.updatedAt = new Date().toISOString();
      await this.dbService.saveData('carts', carts);
      this.logger.log(`🛒 Đã dọn sạch toàn bộ giỏ hàng của khách hàng ${maKH}`);
    }

    return [];
  }
}
