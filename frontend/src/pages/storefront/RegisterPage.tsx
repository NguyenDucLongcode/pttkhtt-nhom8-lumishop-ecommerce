import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '../../api/auth.api'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'

const registerSchema = z.object({
  hoTen: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  sdt: z.string().min(9, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Địa chỉ email không hợp lệ'),
  diaChi: z.string().optional(),
  tenDangNhap: z.string().min(4, 'Tên đăng nhập phải có ít nhất 4 ký tự'),
  matKhau: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

type RegisterForm = z.infer<typeof registerSchema>

export const RegisterPage: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    try {
      await authApi.register(data)
      // Tự động đăng nhập sau khi tạo tài khoản
      const loginRes = await authApi.login({
        tenDangNhap: data.tenDangNhap,
        matKhau: data.matKhau,
      })
      login(loginRes.access_token, loginRes.refresh_token, loginRes.user)
      navigate('/', { replace: true })
    } catch (err: any) {
      const msg = err.response?.data?.message
      setError('root', {
        type: 'manual',
        message: Array.isArray(msg)
          ? msg.join(', ')
          : msg || 'Đăng ký thất bại. Tên đăng nhập hoặc email có thể đã tồn tại.',
      }, { shouldFocus: true })
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#121212] text-[#c59b27] flex items-center justify-center font-bold text-sm">
              L
            </div>
            <span className="text-xl font-extrabold tracking-tight text-neutral-900">
              LUMI<span className="text-[#c59b27]">SHOP</span>
            </span>
          </Link>
          <h1 className="text-lg font-bold text-neutral-900">Tạo Tài Khoản Khách Hàng</h1>
          <p className="text-xs text-neutral-500">
            Đăng ký để hưởng các chính sách bảo hành và nhận mã giảm giá
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Họ và tên"
                placeholder="Nguyễn Văn A"
                required
                {...register('hoTen')}
                error={errors.hoTen?.message}
              />
              <Input
                label="Số điện thoại"
                placeholder="0987654321"
                required
                {...register('sdt')}
                error={errors.sdt?.message}
              />
            </div>

            <Input
              label="Địa chỉ Email"
              type="email"
              placeholder="nguyenvana@gmail.com"
              required
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label="Địa chỉ giao hàng"
              placeholder="Số nhà, đường, phường/xã, quận/huyện..."
              {...register('diaChi')}
              error={errors.diaChi?.message}
              hint="Không bắt buộc, có thể bổ sung khi mua hàng"
            />

            <div className="pt-2 border-t border-neutral-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Tên đăng nhập"
                  placeholder="nguyenvana99"
                  required
                  {...register('tenDangNhap')}
                  error={errors.tenDangNhap?.message}
                />
                <Input
                  label="Mật khẩu"
                  type="password"
                  placeholder="Ít nhất 6 ký tự"
                  required
                  {...register('matKhau')}
                  error={errors.matKhau?.message}
                />
              </div>
            </div>

            {errors.root && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-600 font-medium">
                {errors.root.message}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-neutral-950 hover:bg-[#c59b27] hover:text-black text-white font-semibold"
              size="md"
              isLoading={isSubmitting}
            >
              Đăng ký tài khoản
            </Button>
          </form>

          <div className="mt-4 text-center text-xs text-neutral-500">
            Đã có tài khoản LumiShop?{' '}
            <Link
              to="/login"
              className="text-[#c59b27] font-bold hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
