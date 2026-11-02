import React, { createContext, useContext, useEffect, useState } from 'react'
import type { SafeUser } from '../types/customer.types'
import { authApi } from '../api/auth.api'

interface AuthContextType {
  user: SafeUser | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  login: (access_token: string, refresh_token: string, user: SafeUser) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<SafeUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('lumishop_access_token')
      const storedUser = localStorage.getItem('lumishop_user')
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
    } catch (e) {
      console.warn('Lỗi đọc auth storage:', e)
    } finally {
      setIsLoading(false)
    }

    const handleAuthExpired = () => {
      setUser(null)
      setToken(null)
    }

    window.addEventListener('lumishop_auth_expired', handleAuthExpired)
    return () => {
      window.removeEventListener('lumishop_auth_expired', handleAuthExpired)
    }
  }, [])

  const login = (
    access_token: string,
    refresh_token: string,
    userData: SafeUser
  ) => {
    localStorage.setItem('lumishop_access_token', access_token)
    localStorage.setItem('lumishop_refresh_token', refresh_token)
    localStorage.setItem('lumishop_user', JSON.stringify(userData))
    setToken(access_token)
    setUser(userData)
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('lumishop_refresh_token')
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch (err) {
        console.warn('Lỗi gọi logout backend:', err)
      }
    }
    localStorage.removeItem('lumishop_access_token')
    localStorage.removeItem('lumishop_refresh_token')
    localStorage.removeItem('lumishop_user')
    setToken(null)
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
