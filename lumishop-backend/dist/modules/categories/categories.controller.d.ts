import { CategoriesService, Category } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { QueryCategoryDto } from './dto/query-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(query: QueryCategoryDto): Promise<Category[]>;
    findOne(id: string): Promise<Category>;
    create(createCategoryDto: CreateCategoryDto): Promise<Category>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
        deleted: Category;
    }>;
}
