# 📘 LumiShop Backend - Tài Liệu Kiến Trúc & Kỹ Thuật

> Tài liệu kỹ thuật chi tiết dành cho lập trình viên và nhóm phát triển phân hệ **Backend** dự án LumiShop (NestJS).

---

## 1. Tổng Quan Kiến Trúc & Công Nghệ

Backend LumiShop được xây dựng dựa trên kiến trúc **Modular Architecture** của NestJS, tuân thủ nguyên lý Dependency Injection, tính module hóa cao và dễ mở rộng.

| Thành phần | Công nghệ / Thư viện | Vai trò |
|---|---|---|
| **Core Framework** | NestJS 12 (Express Engine) | Khung làm việc chính, xử lý Routing, Middleware, DI Container |
| **Ngôn ngữ** | TypeScript 6 (ES Modules) | Định kiểu tĩnh an toàn, hỗ trợ cú pháp hiện đại |
| **Cơ sở dữ liệu** | Mock JSON Database (`DbService`) | Lưu trữ dữ liệu dạng JSON, hỗ trợ atomic read/write chuẩn bị sẵn cho MySQL/PostgreSQL |
| **Xác thực & Phân quyền** | Passport.js, JWT, Bcrypt | Quản lý Access Token (15m), Refresh Token (7d), RBAC (`ADMIN`, `USER`) |
| **Trí tuệ nhân tạo (AI)** | Ollama Engine (Qwen3:4b-instruct) | Mô hình ngôn ngữ lớn (LLM) chạy offline cục bộ |
| **Giao tiếp Real-time** | Server-Sent Events (SSE / RxJS) | Truyền luồng dữ liệu văn bản và sự kiện thời gian thực từ AI về Frontend |
| **Tài liệu API** | Swagger UI (`@nestjs/swagger`) | Tự động sinh tài liệu API tương tác tại `/api/docs` |
| **Kiểm thử (Testing)** | Vitest 4 + Supertest | Bộ kiểm thử hiệu năng cao (100 unit tests đã kiểm chứng) |
| **Linter & Code Style** | Oxlint + Prettier | Kiểm soát chất lượng mã nguồn với tốc độ siêu nhanh |

---

## 2. Cấu Trúc Thư Mục Chi Tiết (`backend/src/`)

```text
backend/src/
├── app.controller.spec.ts      # Unit test cho Controller gốc
├── app.controller.ts           # Endpoint kiểm tra trạng thái sức khỏe (Health Check)
├── app.module.ts               # Root Module tổng hợp toàn bộ các phân hệ
├── main.ts                     # Điểm khởi chạy server, cấu hình Swagger, CORS, ValidationPipe
│
├── common/                     # Các thành phần dùng chung toàn hệ thống
│   ├── decorators/             # Custom Decorators: @Roles(), @CurrentUser()
│   ├── guards/                 # Guards bảo vệ route: JwtAuthGuard, RolesGuard
│   └── interceptors/           # Interceptors định dạng phản hồi chuẩn hóa API
│
├── database/                   # Lớp truy xuất dữ liệu trừu tượng
│   ├── db.service.ts           # Dịch vụ đọc/ghi file JSON đồng bộ, an toàn dữ liệu
│   └── database.module.ts      # Cung cấp DbService ở phạm vi toàn cục
│
├── data/                       # Chứa 9 tệp tin cơ sở dữ liệu mẫu dạng JSON
│   ├── db.carts.json           # Dữ liệu giỏ hàng người dùng
│   ├── db.categories.json     # Dữ liệu danh mục sản phẩm
│   ├── db.chatbots.json       # Lịch sử hội thoại của Chatbot AI
│   ├── db.customers.json      # Danh sách tài khoản người dùng và quản trị viên
│   ├── db.orders.json         # Danh sách đơn hàng và trạng thái vận chuyển
│   ├── db.payments.json       # Lịch sử giao dịch thanh toán
│   ├── db.products.json       # Danh mục sản phẩm, giá bán, tồn kho, hình ảnh
│   ├── db.refresh_tokens.json # Token xoay vòng (Refresh Token rotation)
│   └── db.vouchers.json       # Mã giảm giá, điều kiện áp dụng
│
└── modules/                    # Các phân hệ nghiệp vụ chính
    ├── ai-chatbot/             # Phân hệ Trợ lý ảo AI & Gợi ý sản phẩm
    ├── auth/                   # Phân hệ Xác thực tài khoản & Phân quyền
    ├── carts/                  # Phân hệ Quản lý giỏ hàng tập trung Backend
    ├── categories/             # Phân hệ Quản lý danh mục
    ├── customers/              # Phân hệ Quản lý hồ sơ khách hàng
    ├── orders/                 # Phân hệ Đơn hàng, Thanh toán, Báo cáo doanh thu
    ├── products/               # Phân hệ Quản lý sản phẩm & Tìm kiếm
    └── vouchers/               # Phân hệ Quản lý mã khuyến mãi
```

---

## 3. Danh Sách Phân Hệ Nghiệp Vụ (Modules)

### 3.1. Phân hệ `ai-chatbot`
- **Controller**: `ai-chatbot.controller.ts`
  - `GET /chat/stream`: Endpoint SSE phục vụ chat trực tiếp.
  - `GET /chat/history`: Lấy lịch sử tư vấn theo mã khách hàng.
  - `POST /chat/history`: Lưu lại phiên hội thoại.
- **Service**: `ai-chatbot.service.ts`
  - Tích hợp Ollama qua REST API `http://localhost:11434/api/chat`.
  - Triển khai **In-Context Learning (RAG)**: Nạp toàn bộ kho sản phẩm vào System Prompt.
  - Hỗ trợ **Conversation Memory**: Gửi 4-6 lượt hội thoại trước đó để duy trì ngữ cảnh.
  - Tự động trích xuất từ khóa tìm kiếm (`extractSearchKeyword`) và phát sinh sự kiện sản phẩm kèm theo.

### 3.2. Phân hệ `auth`
- Đăng ký tài khoản (`POST /auth/register`), đăng nhập bảo mật bằng bcrypt (`POST /auth/login`).
- Cấp cặp Token: Access Token (thời hạn ngắn) và Refresh Token (lưu mã hash trong `db.refresh_tokens.json`).
- Hỗ trợ xoay Refresh Token (`POST /auth/refresh`) chống replay attack và Đăng xuất an toàn (`POST /auth/logout`).

### 3.3. Phân hệ `carts` (Mới nâng cấp)
- Quản lý giỏ hàng tập trung trên cơ sở dữ liệu thay vì LocalStorage của trình duyệt.
- API:
  - `GET /carts`: Lấy giỏ hàng của khách hàng hiện tại (kèm đầy đủ thông tin chi tiết tên, giá, ảnh của sản phẩm).
  - `POST /carts/items`: Thêm sản phẩm vào giỏ hàng (cộng dồn nếu đã tồn tại).
  - `PUT /carts/items/:maSP`: Cập nhật số lượng sản phẩm (tự động xóa nếu số lượng = 0).
  - `DELETE /carts/items/:maSP`: Xóa một món hàng khỏi giỏ.
  - `DELETE /carts`: Xóa sạch giỏ hàng (sau khi đặt hàng thành công).

### 3.4. Phân hệ `products` & `categories`
- Quản lý danh mục (`DM001`, `DM002`...) và kho sản phẩm đa dạng.
- Hỗ trợ phân trang, lọc theo danh mục, tìm kiếm theo tên/mô tả sản phẩm.
- Đầy đủ tính năng CRUD cho Quản trị viên (`ADMIN`).

### 3.5. Phân hệ `orders` & `vouchers`
- Quy trình tạo đơn hàng: Kiểm tra tồn kho sản phẩm, tính toán giảm giá từ Voucher hợp lệ, trừ tồn kho tức thì.
- Quản lý vòng đời đơn hàng: `ChoXacNhan` (Chờ xác nhận) ➔ `DangGiao` (Đang giao) ➔ `DaGiao` (Đã giao) hoặc `DaHuy` (Đã hủy).
- Tự động **hoàn lại số lượng tồn kho** khi đơn hàng chuyển sang trạng thái `DaHuy`.
- Cung cấp API báo cáo tổng doanh thu và tỷ lệ đơn hàng theo trạng thái cho Admin Dashboard.

---

## 4. Chi Tiết Cơ Chế Hoạt Động AI Chatbot (SSE + Ollama)

```
[Client (Frontend / test-sse.html)]
          │
          │ 1. GET /chat/stream?message=...&token=...&history=[...]
          ▼
   [AiChatbotController]
          │
          │ 2. Gọi streamChat(message, maKH, history)
          ▼
    [AiChatbotService]
          │
          ├──> Đọc toàn bộ danh sách SP từ DbService
          ├──> Tạo productContext & System Prompt
          ├──> Gộp history (4-6 câu trước) + user message
          ├──> POST stream tới Ollama (http://localhost:11434/api/chat)
          │
          ├──> (Event 1): SSE event 'text' (từng từ khóa sinh ra)
          ├──> (Event 2): SSE event 'products' (Card sản phẩm gợi ý kèm metadata)
          └──> (Event 3): SSE event 'done' (Hoàn tất stream, ghi log vào db.chatbots.json)
```

### Cấu trúc các Event SSE gửi về:
1. **Event `text`**:
   ```json
   { "type": "text", "content": "Dạ, shop có mẫu đèn bàn..." }
   ```
2. **Event `products`**:
   ```json
   {
     "type": "products",
     "products": [
       { "id": "SP001", "tenSP": "Đèn Bàn Chống Cận", "giaBan": 450000, "hinhAnh": "https://..." }
     ],
     "searchKeyword": "đèn bàn",
     "totalFound": 5
   }
   ```
3. **Event `done`**:
   ```json
   { "type": "done" }
   ```

---

## 5. Các Lệnh Thông Dụng (CLI Commands)

```powershell
# 1. Cài đặt các gói thư viện
npm install

# 2. Chạy môi trường phát triển (Development Watch Mode)
npm run start:dev

# 3. Biên dịch mã nguồn sang JavaScript production
npm run build

# 4. Chạy ứng dụng sau khi đã biên dịch
npm run start:prod

# 5. Chạy bộ kiểm thử tự động (Unit Tests)
npm test

# 6. Chạy kiểm thử End-to-End
npm run test:e2e

# 7. Kiểm tra lỗi cú pháp và định dạng mã nguồn
npm run lint
npm run format
```
