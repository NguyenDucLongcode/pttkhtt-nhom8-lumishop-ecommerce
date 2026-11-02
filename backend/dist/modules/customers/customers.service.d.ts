import { DbService } from '../../database/db.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { QueryCustomerDto } from './dto/query-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
export interface Customer {
    id: string;
    hoTen: string;
    sdt: string;
    email: string;
    diaChi?: string;
    tenDangNhap: string;
    matKhau: string;
    role?: string;
    createdAt?: string;
    updatedAt?: string;
}
export type SafeCustomer = Omit<Customer, 'matKhau'>;
export declare class CustomersService {
    private readonly dbService;
    private readonly collection;
    constructor(dbService: DbService);
    private hashPassword;
    private sanitize;
    findAll(query?: QueryCustomerDto): Promise<SafeCustomer[]>;
    findOne(id: string): Promise<SafeCustomer>;
    create(dto: CreateCustomerDto): Promise<SafeCustomer>;
    update(id: string, dto: UpdateCustomerDto): Promise<SafeCustomer>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
        deleted: SafeCustomer;
    }>;
}
