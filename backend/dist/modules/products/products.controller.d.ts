import { CreateProductDto } from './dto/create-product.dto.js';
import { QueryProductDto } from './dto/query-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { PaginatedProductsResult, Product, ProductsService } from './products.service.js';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(query: QueryProductDto): Promise<PaginatedProductsResult>;
    getRecommendations(id: string): Promise<Product[]>;
    findOne(id: string): Promise<Product>;
    create(dto: CreateProductDto): Promise<Product>;
    update(id: string, dto: UpdateProductDto): Promise<Product>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
