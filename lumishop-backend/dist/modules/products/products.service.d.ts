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
export declare class ProductsService {
    private readonly dbService;
    private readonly logger;
    constructor(dbService: DbService);
    findAll(query?: QueryProductDto): Promise<PaginatedProductsResult>;
    findOne(id: string): Promise<Product>;
    create(dto: CreateProductDto): Promise<Product>;
    update(id: string, dto: UpdateProductDto): Promise<Product>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private nextProductId;
}
