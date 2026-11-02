var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
export class RegisterDto {
    hoTen;
    email;
    sdt;
    tenDangNhap;
    matKhau;
}
__decorate([
    ApiProperty({
        example: 'Nguyễn Văn A',
        description: 'Họ và tên người đăng ký',
    }),
    IsString({ message: 'hoTen phải là chuỗi ký tự' }),
    IsNotEmpty({ message: 'hoTen không được để trống' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "hoTen", void 0);
__decorate([
    ApiProperty({
        example: 'user@lumishop.vn',
        description: 'Địa chỉ email người dùng',
    }),
    IsEmail({}, { message: 'email phải đúng định dạng email hợp lệ' }),
    IsNotEmpty({ message: 'email không được để trống' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    ApiProperty({
        example: '0988776655',
        description: 'Số điện thoại liên hệ',
    }),
    IsString({ message: 'sdt phải là chuỗi ký tự' }),
    IsNotEmpty({ message: 'sdt không được để trống' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "sdt", void 0);
__decorate([
    ApiProperty({
        example: 'nguyenvana',
        description: 'Tên đăng nhập (duy nhất)',
    }),
    IsString({ message: 'tenDangNhap phải là chuỗi ký tự' }),
    IsNotEmpty({ message: 'tenDangNhap không được để trống' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "tenDangNhap", void 0);
__decorate([
    ApiProperty({
        example: '123456',
        description: 'Mật khẩu tài khoản (tối thiểu 6 ký tự)',
    }),
    IsString({ message: 'matKhau phải là chuỗi ký tự' }),
    IsNotEmpty({ message: 'matKhau không được để trống' }),
    MinLength(6, { message: 'matKhau phải có ít nhất 6 ký tự' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "matKhau", void 0);
//# sourceMappingURL=register.dto.js.map