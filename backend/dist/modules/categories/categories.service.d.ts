import { DbService } from '../../database/db.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { QueryCategoryDto } from './dto/query-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
export interface Category {
    id: string;
    tenDanhMuc: string;
    moTa?: string;
    createdAt?: string;
    updatedAt?: string;
}
export declare class CategoriesService {
    private readonly dbService;
    private readonly collection;
    constructor(dbService: DbService);
    findAll(query?: QueryCategoryDto): Promise<Category[]>;
    findOne(id: string): Promise<Category>;
    create(dto: CreateCategoryDto): Promise<Category>;
    update(id: string, dto: UpdateCategoryDto): Promise<Category>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
        deleted: Category;
    }>;
}
