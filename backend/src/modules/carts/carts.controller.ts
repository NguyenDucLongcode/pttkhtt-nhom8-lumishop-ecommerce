import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CartPopulatedItem, CartsService } from './carts.service.js';
import { AddToCartDto } from './dto/add-to-cart.dto.js';
import { UpdateCartQuantityDto } from './dto/update-cart-quantity.dto.js';

@ApiTags('Carts')
@ApiBearerAuth('JWT-auth')
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  private extractUserId(req: any): string {
    const userId = req.user?.sub || req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException(
        'Vui lòng đăng nhập để thực hiện thao tác giỏ hàng',
      );
    }
    return userId;
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy giỏ hàng hiện tại',
    description:
      'Lấy danh sách các sản phẩm đang có trong giỏ hàng của người dùng hiện tại kèm theo thông tin chi tiết từng sản phẩm.',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sản phẩm trong giỏ hàng.',
  })
  async getCart(@Req() req: any): Promise<CartPopulatedItem[]> {
    const maKH = this.extractUserId(req);
    return this.cartsService.getCart(maKH);
  }

  @Post('add')
  @ApiOperation({
    summary: 'Thêm sản phẩm vào giỏ hàng',
    description:
      'Thêm một sản phẩm vào giỏ hàng. Nếu sản phẩm đã có thì tự động cộng dồn số lượng. Kiểm tra tồn kho trước khi thêm.',
  })
  @ApiResponse({
    status: 200,
    description: 'Thêm vào giỏ hàng thành công, trả về danh sách giỏ hàng mới nhất.',
  })
  @ApiResponse({
    status: 400,
    description: 'Sản phẩm đã hết hàng hoặc ngừng kinh doanh.',
  })
  @ApiResponse({
    status: 404,
    description: 'Sản phẩm không tồn tại.',
  })
  async addToCart(
    @Req() req: any,
    @Body() dto: AddToCartDto,
  ): Promise<CartPopulatedItem[]> {
    const maKH = this.extractUserId(req);
    return this.cartsService.addToCart(maKH, dto);
  }

  @Patch('update')
  @ApiOperation({
    summary: 'Cập nhật số lượng sản phẩm trong giỏ',
    description:
      'Cập nhật số lượng mới của một món đồ trong giỏ hàng. Nếu số lượng <= 0 sẽ tự động xóa khỏi giỏ.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công, trả về danh sách giỏ hàng mới nhất.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy giỏ hàng hoặc sản phẩm trong giỏ.',
  })
  async updateQuantity(
    @Req() req: any,
    @Body() dto: UpdateCartQuantityDto,
  ): Promise<CartPopulatedItem[]> {
    const maKH = this.extractUserId(req);
    return this.cartsService.updateQuantity(maKH, dto.maSP, dto.soLuong);
  }

  @Delete('remove/:maSP')
  @ApiOperation({
    summary: 'Xóa 1 sản phẩm khỏi giỏ hàng',
    description: 'Xóa một sản phẩm cụ thể theo mã sản phẩm (maSP) khỏi giỏ hàng.',
  })
  @ApiParam({
    name: 'maSP',
    description: 'Mã sản phẩm muốn xóa',
    example: 'SP001',
  })
  @ApiResponse({
    status: 200,
    description: 'Xóa sản phẩm thành công, trả về danh sách giỏ hàng cập nhật.',
  })
  async removeFromCart(
    @Req() req: any,
    @Param('maSP') maSP: string,
  ): Promise<CartPopulatedItem[]> {
    const maKH = this.extractUserId(req);
    return this.cartsService.removeFromCart(maKH, maSP);
  }

  @Delete('clear')
  @ApiOperation({
    summary: 'Xóa toàn bộ giỏ hàng',
    description:
      'Làm trống toàn bộ giỏ hàng của người dùng (thường gọi sau khi hoàn tất đặt hàng).',
  })
  @ApiResponse({
    status: 200,
    description: 'Đã xóa sạch giỏ hàng.',
  })
  async clearCart(@Req() req: any): Promise<CartPopulatedItem[]> {
    const maKH = this.extractUserId(req);
    return this.cartsService.clearCart(maKH);
  }
}
