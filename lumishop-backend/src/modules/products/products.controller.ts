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
import { CreateProductDto } from './dto/create-product.dto.js';
import { ProductDto } from './dto/product.dto.js';
import { QueryProductDto } from './dto/query-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import {
  PaginatedProductsResult,
  Product,
  ProductsService,
} from './products.service.js';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * GET /products — Lấy danh sách sản phẩm (Public, có phân trang & tìm kiếm)
   */
  @Public()
  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách sản phẩm (phân trang, tìm kiếm, lọc danh mục)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sản phẩm kèm phân trang { data, total, page, limit }',
    type: [ProductDto],
  })
  async findAll(@Query() query: QueryProductDto): Promise<PaginatedProductsResult> {
    return this.productsService.findAll(query);
  }

  /**
   * GET /products/:id — Xem chi tiết sản phẩm (Public)
   */
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết một sản phẩm' })
  @ApiParam({ name: 'id', description: 'Mã sản phẩm', example: 'SP001' })
  @ApiResponse({ status: 200, description: 'Chi tiết sản phẩm.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm.' })
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  /**
   * POST /products — Thêm sản phẩm mới (Admin only)
   */
  @Roles('admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Thêm sản phẩm mới (Admin)' })
  @ApiResponse({ status: 201, description: 'Tạo sản phẩm thành công.' })
  async create(@Body() dto: CreateProductDto): Promise<Product> {
    return this.productsService.create(dto);
  }

  /**
   * PATCH /products/:id — Cập nhật sản phẩm (Admin only)
   */
  @Roles('admin')
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cập nhật sản phẩm (Admin)' })
  @ApiParam({ name: 'id', description: 'Mã sản phẩm cần cập nhật', example: 'SP001' })
  @ApiResponse({ status: 200, description: 'Cập nhật sản phẩm thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, dto);
  }

  /**
   * DELETE /products/:id — Xóa sản phẩm (Admin only)
   */
  @Roles('admin')
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Xóa sản phẩm (Admin)' })
  @ApiParam({ name: 'id', description: 'Mã sản phẩm cần xóa', example: 'SP001' })
  @ApiResponse({ status: 200, description: 'Xóa sản phẩm thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm.' })
  async remove(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.productsService.remove(id);
  }
}
