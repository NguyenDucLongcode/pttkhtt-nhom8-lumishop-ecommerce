import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class CategoriesService {
  private readonly collection = 'categories';

  constructor(private readonly dbService: DbService) {}

  /**
   * Lấy danh sách danh mục (có hỗ trợ tìm kiếm theo tên)
   */
  async findAll(query?: QueryCategoryDto): Promise<Category[]> {
    const categories = await this.dbService.getData<Category>(this.collection);

    if (query?.search && query.search.trim().length > 0) {
      const searchKey = query.search.trim().toLowerCase();
      return categories.filter((c) =>
        c.tenDanhMuc.toLowerCase().includes(searchKey),
      );
    }

    return categories;
  }

  /**
   * Lấy thông tin chi tiết 1 danh mục theo ID
   */
  async findOne(id: string): Promise<Category> {
    const categories = await this.dbService.getData<Category>(this.collection);
    const category = categories.find((c) => c.id === id);

    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục với ID "${id}"`);
    }

    return category;
  }

  /**
   * Tạo mới một danh mục (tự sinh ID dạng CAT + timestamp)
   */
  async create(dto: CreateCategoryDto): Promise<Category> {
    const categories = await this.dbService.getData<Category>(this.collection);
    const now = new Date().toISOString();

    const newCategory: Category = {
      id: `CAT${Date.now()}`,
      tenDanhMuc: dto.tenDanhMuc.trim(),
      moTa: dto.moTa?.trim() || '',
      createdAt: now,
      updatedAt: now,
    };

    categories.push(newCategory);
    await this.dbService.saveData(this.collection, categories);

    return newCategory;
  }

  /**
   * Cập nhật thông tin danh mục theo ID
   */
  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const categories = await this.dbService.getData<Category>(this.collection);
    const index = categories.findIndex((c) => c.id === id);

    if (index === -1) {
      throw new NotFoundException(`Không tìm thấy danh mục với ID "${id}" để cập nhật`);
    }

    const current = categories[index];
    const updatedCategory: Category = Object.assign({}, current, dto, {
      tenDanhMuc: dto.tenDanhMuc !== undefined ? dto.tenDanhMuc.trim() : current.tenDanhMuc,
      moTa: dto.moTa !== undefined ? dto.moTa.trim() : current.moTa,
      updatedAt: new Date().toISOString(),
    });

    categories[index] = updatedCategory;
    await this.dbService.saveData(this.collection, categories);

    return updatedCategory;
  }

  /**
   * Xóa danh mục khỏi file db.categories.json
   */
  async remove(id: string): Promise<{ success: boolean; message: string; deleted: Category }> {
    const categories = await this.dbService.getData<Category>(this.collection);
    const index = categories.findIndex((c) => c.id === id);

    if (index === -1) {
      throw new NotFoundException(`Không tìm thấy danh mục với ID "${id}" để xóa`);
    }

    const [deleted] = categories.splice(index, 1);
    await this.dbService.saveData(this.collection, categories);

    return {
      success: true,
      message: `Đã xóa thành công danh mục với ID "${id}"`,
      deleted,
    };
  }
}
