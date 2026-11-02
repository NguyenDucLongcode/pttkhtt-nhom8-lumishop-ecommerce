import React, { useState, useRef, useEffect } from 'react'
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  StopCircle,
  ShoppingBag,
  Bot,
  ChevronRight,
  RotateCcw,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { chatbotApi } from '../../api/chatbot.api'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { formatCurrency } from '../../utils/format'
import type { ChatMessage, ProductCard as ProductCardType } from '../../types/chat.types'

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    'Chào bạn! Tôi là trợ lý AI tư vấn LumiShop. Bạn đang tìm đồ gia dụng, thiết bị công nghệ hay sản phẩm gì, hãy nhắn tôi nhé!',
  products: [],
}

/**
 * Xử lý định dạng Markdown an toàn:
 * - Chuyển đổi **in đậm** thành thẻ <strong>
 * - Hỗ trợ gạch đầu dòng danh sách (- hoặc *)
 * - Giữ nguyên ngắt dòng tự nhiên
 */
function renderMarkdownContent(text: string): React.ReactNode {
  if (!text) return null

  const lines = text.split('\n')

  return lines.map((line, lineIdx) => {
    // Kiểm tra dòng dạng danh mục gạch đầu dòng
    const isBullet = /^\s*[-*•]\s+/.test(line)
    const cleanedLine = isBullet ? line.replace(/^\s*[-*•]\s+/, '') : line

    // Tách các đoạn **in đậm**
    const parts = cleanedLine.split(/(\*\*.*?\*\*)/g)
    const formattedParts = parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={pIdx} className="font-bold text-neutral-950">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })

    if (isBullet) {
      return (
        <div key={lineIdx} className="flex items-start gap-1.5 my-1 pl-1">
          <span className="text-[#c59b27] font-bold select-none leading-relaxed">•</span>
          <span className="flex-1 leading-relaxed">{formattedParts}</span>
        </div>
      )
    }

    return (
      <React.Fragment key={lineIdx}>
        {formattedParts}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    )
  })
}

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<(() => void) | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { isAuthenticated, token } = useAuth()
  const { addToCart, showToast } = useCart()
  const navigate = useNavigate()

  // Tự động cuộn xuống cuối khi có tin nhắn mới hoặc đang streaming
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isStreaming, isOpen])

  // Tải lịch sử chat khi user đã đăng nhập
  useEffect(() => {
    let active = true
    if (isAuthenticated && token) {
      chatbotApi
        .getHistory()
        .then((history) => {
          if (!active) return
          if (Array.isArray(history) && history.length > 0) {
            const restored: ChatMessage[] = []
            history.forEach((h) => {
              if (h.cauHoi) {
                restored.push({
                  role: 'user',
                  content: h.cauHoi,
                  timestamp: h.timestamp,
                })
              }
              if (h.cauTraLoi) {
                restored.push({
                  role: 'assistant',
                  content: h.cauTraLoi,
                  timestamp: h.timestamp,
                })
              }
            })
            if (restored.length > 0) {
              setMessages(restored)
            }
          }
        })
        .catch((err) => {
          console.warn('Không thể tải lịch sử chat cũ:', err)
        })
    }
    return () => {
      active = false
    }
  }, [isAuthenticated, token])

  const sendMessage = () => {
    const text = input.trim()
    if (!text || isStreaming) return

    setInput('')

    // Thu thập 4-6 tin nhắn gần nhất làm Conversation Memory
    const recentHistory = messages
      .filter((m) => m.content && m.content.trim())
      .slice(-6)
      .map((m) => ({
        role: m.role || 'user',
        content: m.content || '',
      }))

    // 1. Thêm tin nhắn user
    const userMsg: ChatMessage = { role: 'user', content: text, products: [] }
    // 2. Thêm bong bóng assistant ban đầu
    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: '',
      products: [],
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setIsStreaming(true)

    // Khởi tạo SSE stream với streaming realtime từng ký tự
    const cancelStream = chatbotApi.streamChat(
      text,
      {
        onTextChunk: (chunk: string) => {
          setMessages((prev) => {
            const next = [...prev]
            const lastIdx = next.length - 1
            if (lastIdx >= 0 && next[lastIdx].role === 'assistant') {
              next[lastIdx] = {
                ...next[lastIdx],
                content: (next[lastIdx].content || '') + chunk,
              }
            }
            return next
          })
        },

        onProducts: (
          products: ProductCardType[],
          searchKeyword?: string,
          totalFound?: number
        ) => {
          setMessages((prev) => {
            const next = [...prev]
            const lastIdx = next.length - 1
            if (lastIdx >= 0 && next[lastIdx].role === 'assistant') {
              next[lastIdx] = {
                ...next[lastIdx],
                products,
                searchKeyword,
                totalFound,
              }
            }
            return next
          })
        },

        onDone: () => {
          setIsStreaming(false)
          abortRef.current = null
        },

        onError: (errText: string) => {
          setIsStreaming(false)
          abortRef.current = null
          setMessages((prev) => {
            const next = [...prev]
            const lastIdx = next.length - 1
            if (lastIdx >= 0 && next[lastIdx].role === 'assistant') {
              if (!next[lastIdx].content) {
                next[lastIdx] = {
                  ...next[lastIdx],
                  content: errText,
                  isError: true,
                }
              }
            }
            return next
          })
        },
      },
      recentHistory
    )

    abortRef.current = cancelStream
  }

  const handleStop = () => {
    abortRef.current?.()
    abortRef.current = null
    setIsStreaming(false)
  }

  const handleClearConversation = () => {
    handleStop()
    setMessages([WELCOME_MESSAGE])
  }

  const handleAddProductToCart = async (prod: ProductCardType) => {
    if (!isAuthenticated || !token) {
      showToast('Vui lòng đăng nhập để thêm sản phẩm', 'warning')
      setTimeout(() => {
        const currentPath = window.location.pathname + window.location.search
        navigate(`/login?redirect=${encodeURIComponent(currentPath)}`)
      }, 1200)
      return
    }

    await addToCart(
      {
        id: prod.id,
        tenSP: prod.tenSP,
        giaBan: prod.giaBan,
        hinhAnh: prod.hinhAnh,
        soLuongTon: 99,
        trangThai: 'DangBan',
        moTa: '',
      },
      1
    )
  }

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-13 h-13 rounded-full bg-[#121212] hover:bg-[#c59b27] text-white hover:text-black shadow-xl flex items-center justify-center transition-all duration-200 cursor-pointer border border-[#c59b27]/30 group hover:scale-105 active:scale-95"
        title="Tư vấn mua sắm cùng Lumi AI"
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

      {/* Chat Panel Box: Kích thước mở rộng (520-550px rộng, 750px cao) kèm chế độ Phóng to Maximize */}
      {isOpen && (
        <div
          className={`bg-white shadow-2xl border border-neutral-200 flex flex-col overflow-hidden transition-all duration-300 z-50 ${
            isMaximized
              ? 'fixed inset-2 sm:inset-6 md:inset-8 w-auto h-auto rounded-2xl'
              : 'fixed bottom-22 right-3 sm:right-6 w-[94vw] sm:w-[500px] md:w-[540px] max-w-[calc(100vw-24px)] h-[750px] max-h-[86vh] rounded-2xl animate-in fade-in slide-in-from-bottom-3 duration-200'
          }`}
        >
          {/* Header */}
          <div className="bg-[#121212] text-white px-4 py-3.5 flex items-center justify-between border-b border-neutral-800 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#c59b27] text-black flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5 leading-none">
                  Lumi AI Assistant
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </h3>
                <p className="text-[10px] text-neutral-400 mt-0.5 truncate">
                  Tư vấn sản phẩm thông minh & đa ngành hàng
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleClearConversation}
                className="text-neutral-400 hover:text-white p-1.5 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Làm mới đoạn hội thoại"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="text-neutral-400 hover:text-white p-1.5 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                title={isMaximized ? 'Thu nhỏ khung chat' : 'Phóng to khung chat'}
              >
                {isMaximized ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-white p-1.5 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Đóng khung chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-neutral-50/60 text-xs min-h-0">
            {messages.map((m, idx) => {
              const isAssistant = m.role === 'assistant'
              const isWaiting =
                isAssistant && isStreaming && idx === messages.length - 1 && !m.content

              return (
                <div
                  key={idx}
                  className={`flex gap-2.5 w-full min-w-0 ${
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {isAssistant && (
                    <div className="w-6 h-6 rounded-full bg-neutral-900 text-[#c59b27] flex items-center justify-center shrink-0 mt-0.5 text-[10px] shadow-2xs">
                      <Sparkles className="w-3 h-3" />
                    </div>
                  )}

                  {/* Message Bubble Container: min-w-0 và max-w đảm bảo không bị tràn mép */}
                  <div
                    className={`min-w-0 max-w-[90%] sm:max-w-[85%] rounded-2xl p-3.5 leading-relaxed transition-all ${
                      m.role === 'user'
                        ? 'bg-neutral-900 text-white font-medium rounded-br-none shadow-xs'
                        : m.isError
                        ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-none shadow-xs'
                        : 'bg-white text-neutral-800 border border-neutral-200/80 rounded-bl-none shadow-xs'
                    }`}
                  >
                    {/* Trạng thái đang chuẩn bị trả lời */}
                    {isWaiting ? (
                      <div className="flex items-center gap-2 text-neutral-500 italic py-0.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-[#c59b27] animate-ping"></span>
                        <span>Lumi AI đang suy nghĩ và chuẩn bị tư vấn...</span>
                      </div>
                    ) : (
                      <div className="leading-relaxed break-words">
                        {renderMarkdownContent(m.content || '')}
                        {/* Con trỏ nhấp nháy gõ chữ realtime giống ChatGPT */}
                        {isStreaming &&
                          idx === messages.length - 1 &&
                          isAssistant && (
                            <span className="inline-block w-1.5 h-3 ml-1 bg-[#c59b27] animate-pulse align-middle"></span>
                          )}
                      </div>
                    )}

                    {/* Thẻ sản phẩm (Product Cards) dạng thanh cuộn ngang mượt mà, không bị tràn */}
                    {m.products && m.products.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-neutral-100 min-w-0 max-w-full overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#c59b27]" />
                            Sản phẩm gợi ý ({m.products.length}):
                          </span>
                        </div>

                        {/* Thanh cuộn ngang Horizontal Cards Track */}
                        <div className="product-cards-scroll w-full max-w-full min-w-0">
                          {m.products.map((p) => (
                            <div
                              key={p.id}
                              className="w-[180px] min-w-[180px] max-w-[180px] bg-white border border-neutral-200/90 rounded-xl p-2.5 flex flex-col justify-between shadow-xs hover:border-[#c59b27] hover:shadow-md transition-all shrink-0 select-none"
                            >
                              <Link
                                to={`/products/${p.id}`}
                                onClick={() => setIsOpen(false)}
                                className="block aspect-square w-full rounded-lg overflow-hidden bg-neutral-100 mb-2 group relative"
                              >
                                <img
                                  src={p.hinhAnh}
                                  alt={p.tenSP}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    ;(e.target as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&auto=format&fit=crop&q=80'
                                  }}
                                />
                              </Link>

                              <div className="flex-1 flex flex-col justify-between gap-1.5">
                                <Link
                                  to={`/products/${p.id}`}
                                  onClick={() => setIsOpen(false)}
                                  title={p.tenSP}
                                  className="text-[11px] font-bold text-neutral-900 hover:text-[#c59b27] line-clamp-2 leading-tight transition-colors"
                                >
                                  {p.tenSP}
                                </Link>

                                <div className="pt-0.5">
                                  <p className="text-xs font-extrabold text-neutral-950">
                                    {formatCurrency(p.giaBan)}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleAddProductToCart(p)}
                                  className="mt-1 w-full py-1.5 px-2 bg-neutral-900 hover:bg-[#c59b27] text-white hover:text-black rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                                  title="Thêm sản phẩm này vào giỏ hàng"
                                >
                                  <ShoppingBag className="w-3 h-3" />
                                  <span>Thêm vào giỏ</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Nút 'Xem tất cả' nếu Backend trả về totalFound > 3 */}
                        {m.totalFound !== undefined && m.totalFound > 3 && (
                          <div className="mt-2.5 pt-1 flex items-center">
                            <Link
                              to={`/products?search=${encodeURIComponent(
                                m.searchKeyword || ''
                              )}`}
                              onClick={() => setIsOpen(false)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#faf5e8] hover:bg-[#c59b27] text-[#8c6b16] hover:text-black border border-[#e6d3a3] text-[11px] font-bold transition-all group shadow-2xs"
                            >
                              <span>
                                Xem tất cả {m.totalFound} sản phẩm
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3.5 bg-white border-t border-neutral-200 shrink-0">
            {isStreaming && (
              <div className="flex items-center justify-between mb-2 px-1 text-[11px] text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c59b27] animate-pulse"></span>
                  Lumi AI đang phản hồi...
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
                placeholder="Hỏi về sản phẩm, đồ gia dụng, thiết bị công nghệ..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isStreaming}
                className="flex-1 h-10 px-3.5 text-xs bg-neutral-100/90 border border-transparent rounded-xl focus:bg-white focus:border-[#c59b27] focus:ring-1 focus:ring-[#c59b27]/30 focus:outline-none transition-all placeholder:text-neutral-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="w-10 h-10 rounded-xl bg-neutral-900 hover:bg-[#c59b27] text-white hover:text-black flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
