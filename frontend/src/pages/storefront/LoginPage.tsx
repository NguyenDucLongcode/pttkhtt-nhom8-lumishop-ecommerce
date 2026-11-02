import React from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '../../api/auth.api'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'

const loginSchema = z.object({
  tenDangNhap: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
  matKhau: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

type LoginForm = z.infer<typeof loginSchema>

export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await authApi.login(data)
      login(res.access_token, res.refresh_token, res.user)
      navigate(redirect, { replace: true })
    } catch (err: any) {
      const msg = err.response?.data?.message
      setError('root', {
        type: 'manual',
        message: Array.isArray(msg)
          ? msg.join(', ')
          : msg || 'Tên đăng nhập hoặc mật khẩu không chính xác',
      }, { shouldFocus: true })
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#121212] text-[#c59b27] flex items-center justify-center font-bold text-sm">
              L
            </div>
            <span className="text-xl font-extrabold tracking-tight text-neutral-900">
              LUMI<span className="text-[#c59b27]">SHOP</span>
            </span>
          </Link>
          <h1 className="text-lg font-bold text-neutral-900">Đăng Nhập Tài Khoản</h1>
          <p className="text-xs text-neutral-500">
            Truy cập để quản lý đơn hàng và ưu đãi dành riêng cho bạn
          </p>
        </div>

        {/* Login form card */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Tên đăng nhập"
              placeholder="Nhập tên đăng nhập (vd: user1, admin)"
              autoComplete="username"
              {...register('tenDangNhap')}
              error={errors.tenDangNhap?.message}
            />

            <Input
              label="Mật khẩu"
              type="password"
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
              {...register('matKhau')}
              error={errors.matKhau?.message}
            />

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
              Đăng nhập
            </Button>
          </form>

          <div className="mt-4 text-center text-xs text-neutral-500">
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              className="text-[#c59b27] font-bold hover:underline"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>

        {/* Demo Accounts Helper */}
        <div className="bg-[#faf5e8] border border-[#e6d3a3] rounded-lg p-3.5 text-xs text-neutral-800 space-y-1">
          <p className="font-bold text-[11px] text-[#c59b27] uppercase tracking-wider">
            Tài khoản mẫu thử nghiệm:
          </p>
          <div className="flex justify-between items-center text-[11px] pt-1">
            <span>👤 Khách hàng:</span>
            <code className="bg-white px-1.5 py-0.5 rounded border border-[#e6d3a3] font-mono">user1 / 123</code>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span>🛡️ Quản trị viên:</span>
            <code className="bg-white px-1.5 py-0.5 rounded border border-[#e6d3a3] font-mono">admin / 123</code>
          </div>
        </div>
      </div>
    </div>
  )
}
