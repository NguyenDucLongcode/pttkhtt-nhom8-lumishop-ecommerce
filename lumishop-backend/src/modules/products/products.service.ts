import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DbService } from '../../database/db.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { QueryProductDto } from './dto/query-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

export interface Product {
  id: string;
  tenSP: string;
  moTa: string;
  giaBan: number;
  soLuongTon: number;
  hinhAnh: string;
  categoryId?: string;
  trangThai: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface PaginatedProductsResult {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly dbService: DbService) {}

  /**
   * GET /products — Danh sách sản phẩm có phân trang và tìm kiếm
   */
  async findAll(query: QueryProductDto = {}): Promise<PaginatedProductsResult> {
    const products = await this.dbService.getData<Product>('products');

    const page = query.page && Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = query.limit && Number(query.limit) > 0 ? Number(query.limit) : 10;

    let filtered = [...products];

    if (query.search && query.search.trim().length > 0) {
      const searchKey = query.search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.tenSP || '').toLowerCase().includes(searchKey) ||
          (p.moTa || '').toLowerCase().includes(searchKey) ||
          (p.id || '').toLowerCase().includes(searchKey),
      );
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

  /**
   * GET /products/:id — Xem chi tiết một sản phẩm
   */
  async findOne(id: string): Promise<Product> {
    const products = await this.dbService.getData<Product>('products');
    const product = products.find((p) => p.id === id);

    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với mã: ${id}`);
    }

    return product;
  }

  /**
   * GET /products/:id/recommendations — Gợi ý tối đa 4 sản phẩm cùng danh mục đang bán
   */
  async getRecommendations(productId: string): Promise<Product[]> {
    const products = await this.dbService.getData<Product>('products');
    const current = products.find((p) => p.id === productId);

    if (!current) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với mã: ${productId}`);
    }

    const selling = products.filter(
      (p) => p.id !== productId && p.trangThai === 'DangBan',
    );

    const sameCategory = current.categoryId
      ? selling.filter((p) => p.categoryId === current.categoryId)
      : [];

    if (sameCategory.length > 0) {
      return sameCategory.slice(0, 4);
    }

    return this.shuffle(selling).slice(0, 4);
  }

  /**
   * POST /products — Thêm sản phẩm mới (Admin)
   */
  async create(dto: CreateProductDto): Promise<Product> {
    const products = await this.dbService.getData<Product>('products');
    const now = new Date().toISOString();

    const newProduct: Product = {
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

  /**
   * PATCH /products/:id — Cập nhật sản phẩm (Admin)
   */
  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const products = await this.dbService.getData<Product>('products');
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với mã: ${id}`);
    }

    const now = new Date().toISOString();

    if (dto.tenSP !== undefined) products[index].tenSP = dto.tenSP;
    if (dto.moTa !== undefined) products[index].moTa = dto.moTa;
    if (dto.giaBan !== undefined) products[index].giaBan = dto.giaBan;
    if (dto.soLuongTon !== undefined) products[index].soLuongTon = dto.soLuongTon;
    if (dto.hinhAnh !== undefined) products[index].hinhAnh = dto.hinhAnh;
    if (dto.categoryId !== undefined) products[index].categoryId = dto.categoryId;
    if (dto.trangThai !== undefined) products[index].trangThai = dto.trangThai;
    products[index].updatedAt = now;

    await this.dbService.saveData('products', products);
    this.logger.log(`Đã cập nhật sản phẩm: ${products[index].tenSP} (${id})`);

    return products[index];
  }

  /**
   * DELETE /products/:id — Xóa sản phẩm (Admin)
   */
  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const products = await this.dbService.getData<Product>('products');
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

  private shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  private nextProductId(products: Product[]): string {
    let maxNum = 0;
    for (const product of products) {
      const match = /^SP(\d+)$/i.exec(product.id || '');
      if (match) {
        const num = Number(match[1]);
        if (num > maxNum) maxNum = num;
      }
    }
    return `SP${String(maxNum + 1).padStart(3, '0')}`;
  }
}
