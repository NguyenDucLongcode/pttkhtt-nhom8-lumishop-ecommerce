import { CreateVoucherDto } from './dto/create-voucher.dto.js';
import { QueryVoucherDto } from './dto/query-voucher.dto.js';
import { UpdateVoucherDto } from './dto/update-voucher.dto.js';
import { CheckVoucherResult, PaginatedVouchersResult, Voucher, VouchersService } from './vouchers.service.js';
export declare class VouchersController {
    private readonly vouchersService;
    constructor(vouchersService: VouchersService);
    findAll(query: QueryVoucherDto): Promise<PaginatedVouchersResult>;
    checkVoucher(code: string): Promise<CheckVoucherResult>;
    findOne(id: string): Promise<Voucher>;
    create(createVoucherDto: CreateVoucherDto): Promise<Voucher>;
    update(id: string, updateVoucherDto: UpdateVoucherDto): Promise<Voucher>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
        deleted: Voucher;
    }>;
}
