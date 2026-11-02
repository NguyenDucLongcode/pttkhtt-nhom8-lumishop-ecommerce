import { apiClient } from './client'
import type { ChatbotEntry, ProductCard } from '../types/chat.types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export interface StreamChatHandlers {
  onProducts?: (products: ProductCard[]) => void
  onTextChunk?: (chunk: string) => void
  onDone?: () => void
  onError?: (errorText: string) => void
}

export const chatbotApi = {
  getHistory: (): Promise<ChatbotEntry[]> => {
    return apiClient.get('/chat/history')
  },

  streamChat: (message: string, handlers: StreamChatHandlers): (() => void) => {
    const token = localStorage.getItem('lumishop_access_token')
    let url = `${API_BASE_URL}/chat/stream?message=${encodeURIComponent(message)}`
    if (token) {
      url += `&token=${encodeURIComponent(token)}`
    }

    const eventSource = new EventSource(url)

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)

        if (parsed.error || parsed.type === 'error') {
          handlers.onError?.(
            parsed.error || parsed.content || 'Lỗi không xác định từ máy chủ AI'
          )
          eventSource.close()
          return
        }

        if (parsed.type === 'done' || parsed.content === '[DONE]') {
          handlers.onDone?.()
          eventSource.close()
          return
        }

        if (parsed.type === 'products' && Array.isArray(parsed.content)) {
          handlers.onProducts?.(parsed.content)
        }

        if (parsed.type === 'text' || parsed.text) {
          const chunk =
            parsed.content !== undefined ? parsed.content : parsed.text
          handlers.onTextChunk?.(chunk)
        }
      } catch (err) {
        console.warn('Lỗi parse SSE:', event.data, err)
      }
    }

    eventSource.onerror = (err) => {
      console.warn('EventSource error:', err)
      handlers.onError?.(
        'Không thể kết nối với dịch vụ trợ lý ảo LumiBot. Vui lòng kiểm tra server NestJS và mô hình Ollama.'
      )
      eventSource.close()
    }

    // Trả về hàm hủy để cho phép người dùng ấn nút "Dừng phản hồi"
    return () => {
      eventSource.close()
    }
  },
}
