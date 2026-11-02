export declare class CreateVoucherDto {
    code: string;
    description: string;
    discountType: 'PERCENT' | 'FIXED';
    discountValue: number;
    minOrderValue?: number;
    maxDiscountAmount?: number;
    startDate: string;
    endDate: string;
    usageLimit?: number;
    isActive?: boolean;
}
