import { createBrowserRouter, Navigate } from 'react-router-dom'
import { StorefrontLayout } from '../components/layout/StorefrontLayout'
import { AdminLayout } from '../components/layout/AdminLayout'
import { ProtectedRoute } from './ProtectedRoute'

// Storefront pages
import { HomePage } from '../pages/storefront/HomePage'
import { ProductsPage } from '../pages/storefront/ProductsPage'
import { ProductDetailPage } from '../pages/storefront/ProductDetailPage'
import { CheckoutPage } from '../pages/storefront/CheckoutPage'
import { OrderHistoryPage } from '../pages/storefront/OrderHistoryPage'
import { LoginPage } from '../pages/storefront/LoginPage'
import { RegisterPage } from '../pages/storefront/RegisterPage'

// Admin pages
import { DashboardPage } from '../pages/admin/DashboardPage'
import { AdminProductsPage } from '../pages/admin/AdminProductsPage'
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage'
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage'
import { AdminVouchersPage } from '../pages/admin/AdminVouchersPage'
import { AdminCustomersPage } from '../pages/admin/AdminCustomersPage'

export const router = createBrowserRouter([
  // Storefront Routes
  {
    path: '/',
    element: <StorefrontLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'products/:id',
        element: <ProductDetailPage />,
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders/history',
        element: (
          <ProtectedRoute>
            <OrderHistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
    ],
  },

  // Admin Routes (Protected by Admin Role)
  {
    path: '/admin',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'products',
        element: <AdminProductsPage />,
      },
      {
        path: 'categories',
        element: <AdminCategoriesPage />,
      },
      {
        path: 'orders',
        element: <AdminOrdersPage />,
      },
      {
        path: 'vouchers',
        element: <AdminVouchersPage />,
      },
      {
        path: 'customers',
        element: <AdminCustomersPage />,
      },
    ],
  },

  // Fallback
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
