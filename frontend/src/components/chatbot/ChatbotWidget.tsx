import React, { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Sparkles, StopCircle, ShoppingBag, Bot } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { formatCurrency } from '../../utils/format'
import { Link } from 'react-router-dom'
import type { ChatMessage, ProductCard as ProductCardType } from '../../types/chat.types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Chào bạn! Tôi là trợ lý AI tư vấn LumiShop. Bạn đang tìm đèn bàn học sinh, đèn làm việc chống cận hay phụ kiện gì, hãy nhắn tôi nhé!',
      products: [],
    },
  ])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<(() => void) | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { addToCart } = useCart()

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isStreaming) return

    setInput('')
    const userMsg: ChatMessage = { role: 'user', content: text, products: [] }
    setMessages((prev) => [...prev, userMsg])

    const assistantMsg: ChatMessage = { role: 'assistant', content: '', products: [] }
    setMessages((prev) => [...prev, assistantMsg])
    setIsStreaming(true)

    const token = localStorage.getItem('lumishop_access_token')
    const params = new URLSearchParams({ message: text })
    if (token) params.set('token', token)

    const eventSource = new EventSource(`${API_BASE_URL}/chat/stream?${params.toString()}`)
    abortRef.current = () => eventSource.close()

    let collectedCards: ProductCardType[] = []

    eventSource.addEventListener('products', (e) => {
      try {
        const data = JSON.parse(e.data)
        if (Array.isArray(data)) collectedCards = data
      } catch {}
    })

    eventSource.onmessage = (e) => {
      if (e.data === '[DONE]') {
        eventSource.close()
        setIsStreaming(false)
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last.role === 'assistant') last.products = collectedCards
          return updated
        })
        return
      }
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last.role === 'assistant') last.content += e.data
        return [...updated]
      })
    }

    eventSource.onerror = () => {
      eventSource.close()
      setIsStreaming(false)
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last.role === 'assistant' && !last.content) {
          last.content = 'Xin lỗi, trợ lý AI hiện đang bảo trì hoặc chưa kết nối được dịch vụ mô hình ngôn ngữ (Ollama). Vui lòng thử lại sau!'
        }
        return [...updated]
      })
    }
  }

  const handleStop = () => {
    abortRef.current?.()
    setIsStreaming(false)
  }

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-13 h-13 rounded-full bg-[#121212] hover:bg-[#c59b27] text-white hover:text-black shadow-xl flex items-center justify-center transition-all duration-200 cursor-pointer border border-[#c59b27]/30 group hover:scale-105"
        title="Tư vấn đèn bàn cùng Lumi AI"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-5 h-5 stroke-[2]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#c59b27] rounded-full border-2 border-[#121212]"></span>
          </div>
        )}
      </button>

      {/* Chat Panel Box */}
      {isOpen && (
        <div className="fixed bottom-22 right-6 z-40 w-[92vw] sm:w-[380px] h-[520px] max-h-[80vh] bg-white rounded-xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
          {/* Header */}
          <div className="bg-[#121212] text-white px-4 py-3.5 flex items-center justify-between border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#c59b27] text-black flex items-center justify-center font-bold text-xs shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5 leading-none">
                  Lumi AI Assistant
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </h3>
                <p className="text-[10px] text-neutral-400 mt-0.5">Tư vấn thông số kỹ thuật & gợi ý đèn</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-white p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-neutral-50/50 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-neutral-900 text-[#c59b27] flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                    <Sparkles className="w-3 h-3" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-lg p-3 leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-neutral-900 text-white font-medium rounded-br-none shadow-xs'
                      : 'bg-white text-neutral-800 border border-neutral-200/80 rounded-bl-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>

                  {/* Product Cards Attachment */}
                  {m.products && m.products.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-neutral-100 space-y-2">
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                        Sản phẩm gợi ý phù hợp:
                      </p>
                      {m.products.map((p) => (
                        <div
                          key={p.id}
                          className="bg-neutral-50 border border-neutral-200/80 rounded p-2 flex items-center justify-between gap-2.5 hover:border-[#c59b27]/60 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={p.hinhAnh}
                              alt={p.tenSP}
                              className="w-10 h-10 rounded object-cover bg-neutral-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <Link
                                to={`/products/${p.id}`}
                                onClick={() => setIsOpen(false)}
                                className="font-semibold text-neutral-900 hover:text-[#c59b27] truncate block text-[11px]"
                              >
                                {p.tenSP}
                              </Link>
                              <span className="text-[11px] font-bold text-neutral-900">
                                {formatCurrency(p.giaBan)}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => addToCart(p as any, 1)}
                            className="p-1.5 rounded bg-white hover:bg-neutral-900 hover:text-white border border-neutral-200 transition-all shrink-0 cursor-pointer"
                            title="Thêm vào giỏ"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-neutral-200">
            {isStreaming && (
              <div className="flex items-center justify-between mb-2 px-1 text-[11px] text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c59b27] animate-pulse"></span>
                  Lumi AI đang soạn phản hồi...
                </span>
                <button
                  onClick={handleStop}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                >
                  <StopCircle className="w-3.5 h-3.5" /> Dừng
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage()
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Hỏi về đèn bàn, độ rọi lux, chuẩn CRI..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isStreaming}
                className="flex-1 h-9 px-3 text-xs bg-neutral-100/90 border border-transparent rounded-md focus:bg-white focus:border-[#c59b27] focus:ring-1 focus:ring-[#c59b27]/30 focus:outline-none transition-all placeholder:text-neutral-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="w-9 h-9 rounded-md bg-neutral-900 hover:bg-[#c59b27] text-white hover:text-black flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
