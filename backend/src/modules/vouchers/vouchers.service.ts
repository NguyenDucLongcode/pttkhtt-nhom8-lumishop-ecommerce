import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from '../../database/db.service.js';
import { CreateVoucherDto } from './dto/create-voucher.dto.js';
import { QueryVoucherDto } from './dto/query-voucher.dto.js';
import { UpdateVoucherDto } from './dto/update-voucher.dto.js';

export interface Voucher {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedVouchersResult {
  data: Voucher[];
  total: number;
  page: number;
  limit: number;
}

export interface CheckVoucherResult {
  isValid: boolean;
  message: string;
  voucher: Voucher;
}

@Injectable()
export class VouchersService {
  private readonly collection = 'vouchers';

  constructor(private readonly dbService: DbService) {}

  /**
   * Lấy danh sách voucher có hỗ trợ lọc và phân trang
   * @param query QueryVoucherDto { page, limit, isActive, code }
   * @returns { data: [], total, page, limit }
   */
  async findAll(query: QueryVoucherDto): Promise<PaginatedVouchersResult> {
    const vouchers = await this.dbService.getData<Voucher>(this.collection);

    const page = query.page && Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = query.limit && Number(query.limit) > 0 ? Number(query.limit) : 10;

    let filtered = [...vouchers];

    // Lọc theo isActive (boolean)
    if (query.isActive !== undefined) {
      filtered = filtered.filter((v) => v.isActive === query.isActive);
    }

    // Lọc tìm kiếm gần đúng theo mã code (không phân biệt hoa/thường)
    if (query.code && query.code.trim().length > 0) {
      const searchCode = query.code.trim().toLowerCase();
      filtered = filtered.filter((v) => v.code.toLowerCase().includes(searchCode));
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
   * Lấy chi tiết 1 voucher theo ID
   * @param id Mã định danh voucher
   * @throws NotFoundException nếu không tìm thấy
   */
  async findOne(id: string): Promise<Voucher> {
    const vouchers = await this.dbService.getData<Voucher>(this.collection);
    const voucher = vouchers.find((v) => v.id === id);

    if (!voucher) {
      throw new NotFoundException(`Voucher với ID "${id}" không tồn tại`);
    }

    return voucher;
  }

  /**
   * Tạo mới một voucher
   * @param dto CreateVoucherDto
   * @throws ConflictException nếu mã code đã tồn tại
   */
  async create(dto: CreateVoucherDto): Promise<Voucher> {
    const vouchers = await this.dbService.getData<Voucher>(this.collection);
    const normalizedCode = dto.code.trim().toUpperCase();

    const exists = vouchers.some(
      (v) => v.code.toUpperCase() === normalizedCode,
    );
    if (exists) {
      throw new ConflictException(`Mã voucher "${normalizedCode}" đã tồn tại`);
    }

    const newId = `VC${String(vouchers.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newVoucher: Voucher = {
      id: newId,
      code: normalizedCode,
      description: dto.description.trim(),
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      minOrderValue: dto.minOrderValue ?? 0,
      maxDiscountAmount: dto.maxDiscountAmount,
      startDate: dto.startDate,
      endDate: dto.endDate,
      usageLimit: dto.usageLimit,
      usedCount: 0,
      isActive: dto.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    vouchers.push(newVoucher);
    await this.dbService.saveData(this.collection, vouchers);

    return newVoucher;
  }

  /**
   * Cập nhật thông tin voucher
   * @param id Mã định danh voucher
   * @param dto UpdateVoucherDto
   * @throws NotFoundException nếu không tìm thấy ID
   * @throws ConflictException nếu mã code mới trùng với voucher khác
   */
  async update(id: string, dto: UpdateVoucherDto): Promise<Voucher> {
    const vouchers = await this.dbService.getData<Voucher>(this.collection);
    const index = vouchers.findIndex((v) => v.id === id);

    if (index === -1) {
      throw new NotFoundException(`Không tìm thấy voucher với ID "${id}" để cập nhật`);
    }

    // Nếu đổi mã code, kiểm tra trùng lặp với voucher khác
    if (dto.code) {
      const normalizedCode = dto.code.trim().toUpperCase();
      const codeExists = vouchers.some(
        (v, i) => i !== index && v.code.toUpperCase() === normalizedCode,
      );
      if (codeExists) {
        throw new ConflictException(`Mã voucher "${normalizedCode}" đã tồn tại trên voucher khác`);
      }
    }

    const current = vouchers[index];
    const updatedVoucher: Voucher = Object.assign({}, current, dto, {
      code: dto.code ? dto.code.trim().toUpperCase() : current.code,
      description: dto.description ? dto.description.trim() : current.description,
      updatedAt: new Date().toISOString(),
    });

    vouchers[index] = updatedVoucher;
    await this.dbService.saveData(this.collection, vouchers);

    return updatedVoucher;
  }

  /**
   * Xóa voucher khỏi database
   * @param id Mã định danh voucher
   * @throws NotFoundException nếu không tìm thấy ID
   */
  async remove(id: string): Promise<{ success: boolean; message: string; deleted: Voucher }> {
    const vouchers = await this.dbService.getData<Voucher>(this.collection);
    const index = vouchers.findIndex((v) => v.id === id);

    if (index === -1) {
      throw new NotFoundException(`Không tìm thấy voucher với ID "${id}" để xóa`);
    }

    const [deleted] = vouchers.splice(index, 1);
    await this.dbService.saveData(this.collection, vouchers);

    return {
      success: true,
      message: `Đã xóa thành công voucher với ID "${id}"`,
      deleted,
    };
  }

  /**
   * Kiểm tra tính hợp lệ của mã giảm giá
   * @param code Mã giảm giá cần kiểm tra
   * @throws NotFoundException nếu mã voucher không tồn tại
   * @returns CheckVoucherResult { isValid, message, voucher }
   */
  async checkVoucher(code: string): Promise<CheckVoucherResult> {
    const vouchers = await this.dbService.getData<Voucher>(this.collection);
    const cleanCode = code.trim().toUpperCase();

    const voucher = vouchers.find(
      (v) => v.code.toUpperCase() === cleanCode,
    );

    if (!voucher) {
      throw new NotFoundException(`Voucher với mã "${code}" không tồn tại`);
    }

    const now = new Date();

    if (!voucher.isActive) {
      return {
        isValid: false,
        message: 'Voucher hiện tại đang ngưng áp dụng',
        voucher,
      };
    }

    if (new Date(voucher.startDate) > now) {
      return {
        isValid: false,
        message: 'Voucher chưa đến thời gian áp dụng',
        voucher,
      };
    }

    if (new Date(voucher.endDate) < now) {
      return {
        isValid: false,
        message: 'Voucher đã hết hạn sử dụng',
        voucher,
      };
    }

    if (
      voucher.usageLimit !== undefined &&
      voucher.usedCount >= voucher.usageLimit
    ) {
      return {
        isValid: false,
        message: 'Voucher đã hết lượt sử dụng',
        voucher,
      };
    }

    return {
      isValid: true,
      message: 'Mã voucher hợp lệ và có thể sử dụng',
      voucher,
    };
  }
}
