export interface ProductCard {
  id: string
  tenSP: string
  giaBan: number
  hinhAnh: string
}

export interface ChatbotEntry {
  id: string
  maKH?: string
  cauHoi: string
  cauTraLoi: string
  timestamp: string
  nguCanh?: string
  trangThai?: string
}

export interface ChatMessage {
  id?: string
  role?: 'user' | 'assistant'
  sender?: 'user' | 'bot'
  content?: string
  text?: string
  timestamp?: string
  products?: ProductCard[]
  productCards?: ProductCard[]
  searchKeyword?: string
  totalFound?: number
  isError?: boolean
}
