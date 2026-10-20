var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class CreateCustomerDto {
    hoTen;
    sdt;
    email;
    diaChi;
    tenDangNhap;
    matKhau;
}
__decorate([
    ApiProperty({
        example: 'Nguyễn Văn An',
        description: 'Họ và tên khách hàng (bắt buộc)',
    }),
    IsString({ message: 'hoTen phải là chuỗi ký tự' }),
    IsNotEmpty({ message: 'hoTen không được để trống' }),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "hoTen", void 0);
__decorate([
    ApiProperty({
        example: '0987654321',
        description: 'Số điện thoại liên hệ (bắt buộc)',
    }),
    IsString({ message: 'sdt phải là chuỗi ký tự' }),
    IsNotEmpty({ message: 'sdt không được để trống' }),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "sdt", void 0);
__decorate([
    ApiProperty({
        example: 'vanan.nguyen@gmail.com',
        description: 'Địa chỉ email (phải đúng định dạng email)',
    }),
    IsEmail({}, { message: 'email phải đúng định dạng email hợp lệ' }),
    IsNotEmpty({ message: 'email không được để trống' }),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "email", void 0);
__decorate([
    ApiPropertyOptional({
        example: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
        description: 'Địa chỉ giao hàng',
    }),
    IsOptional(),
    IsString({ message: 'diaChi phải là chuỗi ký tự' }),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "diaChi", void 0);
__decorate([
    ApiProperty({
        example: 'vanan99',
        description: 'Tên đăng nhập tài khoản (bắt buộc, duy nhất)',
    }),
    IsString({ message: 'tenDangNhap phải là chuỗi ký tự' }),
    IsNotEmpty({ message: 'tenDangNhap không được để trống' }),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "tenDangNhap", void 0);
__decorate([
    ApiProperty({
        example: 'P@ssword123',
        description: 'Mật khẩu tài khoản (bắt buộc)',
    }),
    IsString({ message: 'matKhau phải là chuỗi ký tự' }),
    IsNotEmpty({ message: 'matKhau không được để trống' }),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "matKhau", void 0);
//# sourceMappingURL=create-customer.dto.js.map