# LumiShop — Hệ Thống Bán Hàng & Quản Trị Đèn Bàn Tích Hợp AI

Dự án đồ án môn **Phân tích & Thiết kế Hệ thống Thông tin (Nhóm 8)** — Trường Đại học Công nghệ Đồng Nai (DNTU).

---

## 🏗️ Cấu Trúc Dự Án

```
pttkhtt-nhom8-lumishop-ecommerce/
├── backend/            # NestJS Backend API (JWT, RBAC, SSE Ollama AI Chatbot)
│   ├── src/            # Mã nguồn TypeScript NestJS
│   ├── dist/           # Bản build production
│   └── package.json
├── frontend/           # React 19 + Vite + Tailwind CSS v4 + TanStack Query
│   ├── src/            # Storefront & Admin Dashboard components
│   └── package.json
└── docs/               # Tài liệu phân tích nghiệp vụ, API, Design System
```

---

## 🎨 Phong Cách Thiết Kế (Design System)
- **Định hướng**: Haravan / Muji / Apple style — tối giản, sang trọng, thực dụng, không màu mè hoặc mang dấu hiệu "AI-generated" lỗi thời.
- **Tone màu chủ đạo**: Đen (`#121212`) & Trắng (`#ffffff`) phối điểm nhấn Vàng Hoàng Gia (`#c59b27`).
- **Typography**: `Plus Jakarta Sans` chuẩn dấu tiếng Việt, hiển thị sắc nét trên mọi thiết bị.
- **Tiền tệ & Ngày tháng**: `550.000₫` (`Intl.NumberFormat('vi-VN')`), ngày định dạng `dd/MM/yyyy`.

---

## 🚀 Hướng Dẫn Chạy Dự Án

### 1. Khởi Động Backend (Port 8080)
```powershell
cd backend
npm install
npm run start:dev
# Hoặc chạy bản build sẵn:
node dist/main.js
```
- Swagger API Docs: `http://localhost:8080/api/docs`

### 2. Khởi Động Frontend (Port 3000)
```powershell
cd frontend
npm install
npm run dev
```
- Truy cập cửa hàng tại: `http://localhost:3000`

---

## 🔑 Tài Khoản Thử Nghiệm

| Vai trò | Tên đăng nhập | Mật khẩu | Mục đích |
|---|---|---|---|
| **Quản trị viên (Admin)** | `admin` | `123` | Quản lý sản phẩm, đơn hàng, doanh thu, voucher, khách hàng |
| **Khách hàng (User)** | `user1` | `123` | Mua sắm, áp voucher, xem lịch sử đơn hàng, chat AI |
