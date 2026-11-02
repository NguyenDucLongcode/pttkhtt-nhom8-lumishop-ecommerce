export interface SafeUser {
  id: string
  hoTen: string
  email: string
  sdt: string
  diaChi?: string
  tenDangNhap: string
  role: 'user' | 'admin'
  createdAt?: string
  updatedAt?: string
}

export type SafeCustomer = SafeUser

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: SafeUser
}

export interface LoginDto {
  tenDangNhap: string
  matKhau: string
}

export interface RegisterDto {
  hoTen: string
  email: string
  sdt: string
  tenDangNhap: string
  matKhau: string
}

export interface CreateCustomerDto extends RegisterDto {
  diaChi?: string
}

export interface UpdateCustomerDto {
  hoTen?: string
  sdt?: string
  email?: string
  diaChi?: string
}
