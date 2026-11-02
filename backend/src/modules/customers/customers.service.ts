import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
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

@Injectable()
export class CustomersService {
  private readonly collection = 'customers';

  constructor(private readonly dbService: DbService) {}

  /**
   * Mã hóa mật khẩu cơ bản bằng SHA-256
   */
  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  /**
   * Lọc bỏ mật khẩu trước khi trả về client để bảo mật
   */
  private sanitize(customer: Customer): SafeCustomer {
    const { matKhau: _, ...safeCustomer } = customer;
    return safeCustomer;
  }

  /**
   * Lấy danh sách khách hàng (hỗ trợ tìm kiếm theo Họ tên hoặc Số điện thoại)
   */
  async findAll(query?: QueryCustomerDto): Promise<SafeCustomer[]> {
    const customers = await this.dbService.getData<Customer>(this.collection);

    if (query?.search && query.search.trim().length > 0) {
      const searchKey = query.search.trim().toLowerCase();
      const filtered = customers.filter(
        (c) =>
          c.hoTen.toLowerCase().includes(searchKey) ||
          c.sdt.toLowerCase().includes(searchKey),
      );
      return filtered.map((c) => this.sanitize(c));
    }

    return customers.map((c) => this.sanitize(c));
  }

  /**
   * Lấy thông tin chi tiết 1 khách hàng theo ID
   */
  async findOne(id: string): Promise<SafeCustomer> {
    const customers = await this.dbService.getData<Customer>(this.collection);
    const customer = customers.find((c) => c.id === id);

    if (!customer) {
      throw new NotFoundException(`Không tìm thấy khách hàng với ID "${id}"`);
    }

    return this.sanitize(customer);
  }

  /**
   * Tạo mới một khách hàng (tự sinh ID dạng KH + timestamp)
   */
  async create(dto: CreateCustomerDto): Promise<SafeCustomer> {
    const customers = await this.dbService.getData<Customer>(this.collection);
    const normalizedUsername = dto.tenDangNhap.trim().toLowerCase();
    const normalizedEmail = dto.email.trim().toLowerCase();

    // Kiểm tra trùng lặp tên đăng nhập
    if (customers.some((c) => c.tenDangNhap.toLowerCase() === normalizedUsername)) {
      throw new ConflictException(`Tên đăng nhập "${dto.tenDangNhap}" đã tồn tại`);
    }

    // Kiểm tra trùng lặp email
    if (customers.some((c) => c.email.toLowerCase() === normalizedEmail)) {
      throw new ConflictException(`Email "${dto.email}" đã được đăng ký`);
    }

    const now = new Date().toISOString();
    const newCustomer: Customer = {
      id: `KH${Date.now()}`,
      hoTen: dto.hoTen.trim(),
      sdt: dto.sdt.trim(),
      email: normalizedEmail,
      diaChi: dto.diaChi?.trim() || '',
      tenDangNhap: dto.tenDangNhap.trim(),
      matKhau: this.hashPassword(dto.matKhau),
      role: 'user',
      createdAt: now,
      updatedAt: now,
    };

    customers.push(newCustomer);
    await this.dbService.saveData(this.collection, customers);

    return this.sanitize(newCustomer);
  }

  /**
   * Cập nhật thông tin cá nhân khách hàng (không đổi tenDangNhap và matKhau)
   */
  async update(id: string, dto: UpdateCustomerDto): Promise<SafeCustomer> {
    const customers = await this.dbService.getData<Customer>(this.collection);
    const index = customers.findIndex((c) => c.id === id);

    if (index === -1) {
      throw new NotFoundException(`Không tìm thấy khách hàng với ID "${id}" để cập nhật`);
    }

    // Nếu cập nhật email, kiểm tra trùng với khách hàng khác
    if (dto.email) {
      const normalizedEmail = dto.email.trim().toLowerCase();
      const emailExists = customers.some(
        (c, i) => i !== index && c.email.toLowerCase() === normalizedEmail,
      );
      if (emailExists) {
        throw new ConflictException(`Email "${dto.email}" đã được sử dụng bởi khách hàng khác`);
      }
    }

    const current = customers[index];
    const updatedCustomer: Customer = Object.assign({}, current, dto, {
      hoTen: dto.hoTen !== undefined ? dto.hoTen.trim() : current.hoTen,
      sdt: dto.sdt !== undefined ? dto.sdt.trim() : current.sdt,
      email: dto.email !== undefined ? dto.email.trim().toLowerCase() : current.email,
      diaChi: dto.diaChi !== undefined ? dto.diaChi.trim() : current.diaChi,
      updatedAt: new Date().toISOString(),
    });

    customers[index] = updatedCustomer;
    await this.dbService.saveData(this.collection, customers);

    return this.sanitize(updatedCustomer);
  }

  /**
   * Xóa khách hàng khỏi file db.customers.json
   */
  async remove(id: string): Promise<{ success: boolean; message: string; deleted: SafeCustomer }> {
    const customers = await this.dbService.getData<Customer>(this.collection);
    const index = customers.findIndex((c) => c.id === id);

    if (index === -1) {
      throw new NotFoundException(`Không tìm thấy khách hàng với ID "${id}" để xóa`);
    }

    const [deleted] = customers.splice(index, 1);
    await this.dbService.saveData(this.collection, customers);

    return {
      success: true,
      message: `Đã xóa thành công khách hàng với ID "${id}"`,
      deleted: this.sanitize(deleted),
    };
  }
}
