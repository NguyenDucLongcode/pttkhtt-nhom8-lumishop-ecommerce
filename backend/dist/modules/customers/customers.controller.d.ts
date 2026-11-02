import { CustomersService, SafeCustomer } from './customers.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { QueryCustomerDto } from './dto/query-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    findAll(query: QueryCustomerDto): Promise<SafeCustomer[]>;
    findOne(id: string): Promise<SafeCustomer>;
    create(createCustomerDto: CreateCustomerDto): Promise<SafeCustomer>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<SafeCustomer>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
        deleted: SafeCustomer;
    }>;
}
