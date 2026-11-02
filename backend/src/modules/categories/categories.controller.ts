import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CategoriesService, Category } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { QueryCategoryDto } from './dto/query-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@ApiTags('Categories')
@ApiBearerAuth('JWT-auth')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách toàn bộ danh mục sản phẩm (có tìm kiếm theo tên)' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách các danh mục sản phẩm',
  })
  async findAll(@Query() query: QueryCategoryDto): Promise<Category[]> {
    return this.categoriesService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết 1 danh mục theo ID' })
  @ApiParam({ name: 'id', example: 'CAT1234567890', description: 'Mã định danh danh mục' })
  @ApiResponse({ status: 200, description: 'Chi tiết danh mục sản phẩm' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
  async findOne(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  @Roles('admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo mới một danh mục sản phẩm' })
  @ApiResponse({ status: 201, description: 'Danh mục được tạo thành công' })
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Roles('admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin danh mục theo ID' })
  @ApiParam({ name: 'id', example: 'CAT1234567890', description: 'Mã định danh danh mục' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa danh mục theo ID' })
  @ApiParam({ name: 'id', example: 'CAT1234567890', description: 'Mã định danh danh mục' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
  async remove(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string; deleted: Category }> {
    return this.categoriesService.remove(id);
  }
}
