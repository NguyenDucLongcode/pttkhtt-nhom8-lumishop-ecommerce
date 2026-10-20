import { CreateOrderDto } from './dto/create-order.dto.js';
import { QueryOrderDto } from './dto/query-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { Order, OrdersService, RevenueReportResult } from './orders.service.js';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    checkout(createOrderDto: CreateOrderDto): Promise<Order>;
    findAll(query: QueryOrderDto): Promise<Order[]>;
    getRevenue(): Promise<RevenueReportResult>;
    getOrderHistory(maKH: string): Promise<Order[]>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order>;
    findOne(id: string): Promise<Order>;
}
