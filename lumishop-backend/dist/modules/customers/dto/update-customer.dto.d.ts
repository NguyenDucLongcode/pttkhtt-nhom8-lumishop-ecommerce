import { CreateCustomerDto } from './create-customer.dto.js';
declare const UpdateCustomerDto_base: import("@nestjs/common").Type<Partial<Omit<CreateCustomerDto, "tenDangNhap" | "matKhau">>>;
export declare class UpdateCustomerDto extends UpdateCustomerDto_base {
}
export {};
