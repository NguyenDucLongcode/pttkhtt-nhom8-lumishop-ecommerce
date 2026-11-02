import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { CartDrawer } from '../cart/CartDrawer'
import { ChatbotWidget } from '../chatbot/ChatbotWidget'

export const StorefrontLayout: React.FC = () => {
  const location = useLocation()

  // Auto scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-neutral-900 selection:bg-[#c59b27]/20">
      <Header />
      <main key={location.pathname} className="flex-1 animate-page-enter">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <ChatbotWidget />
    </div>
  )
}
