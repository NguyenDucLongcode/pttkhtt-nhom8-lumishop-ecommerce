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
export declare class VouchersService {
    private readonly dbService;
    private readonly collection;
    constructor(dbService: DbService);
    findAll(query: QueryVoucherDto): Promise<PaginatedVouchersResult>;
    findOne(id: string): Promise<Voucher>;
    create(dto: CreateVoucherDto): Promise<Voucher>;
    update(id: string, dto: UpdateVoucherDto): Promise<Voucher>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
        deleted: Voucher;
    }>;
    checkVoucher(code: string): Promise<CheckVoucherResult>;
}
