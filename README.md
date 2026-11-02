# 🌟 LumiShop - Hệ Thống Bán Hàng Online Tích Hợp AI Chatbot & Gợi Ý Sản Phẩm

> Đồ án môn **Phân tích & Thiết kế Hệ thống Thông tin (Nhóm 8)** — Trường Đại học Công nghệ Đồng Nai (DNTU).

---

## 📖 Giới Thiệu Dự Án

**LumiShop** là giải pháp thương mại điện tử hiện đại, đa ngành hàng (đồ gia dụng, thiết bị ngoại vi, thiết bị thông minh, phụ kiện đời sống...), được thiết kế chuẩn mực theo mô hình Client - Server phân tách rõ ràng giữa **Backend (NestJS)** và **Frontend (React/Vite)**.

Điểm đột phá của hệ thống là tích hợp **AI Chatbot tư vấn bán hàng thông minh** chạy trên nền tảng **Ollama (Model Qwen3:4b-instruct)**, áp dụng cơ chế **In-Context Learning (RAG)**, truyền dữ liệu thời gian thực qua **Server-Sent Events (SSE)**, hiển thị thẻ sản phẩm tương tác trực tiếp và hỗ trợ **bộ nhớ ngữ cảnh ngắn hạn (Conversation Memory)**.

---

## 🏗️ Cấu Trúc Thư Mục Dự Án

```text
Sp_Phan_Tich_Thiet_Ke/
├── backend/            # Mã nguồn Backend xây dựng bằng NestJS (REST API + SSE)
│   ├── src/            # Core modules, Database JSON, Auth, AI Chatbot, Carts...
│   ├── INFO.md         # 📘 Tài liệu kiến trúc kỹ thuật & API chi tiết của Backend
│   └── package.json
├── frontend/           # Mã nguồn Frontend xây dựng bằng React 19 + Vite 8
│   ├── src/            # Pages, Components, Hooks, Context, ChatbotWidget...
│   ├── INFO.md         # 📘 Tài liệu kiến trúc kỹ thuật & Giao diện của Frontend
│   └── package.json
├── docs/               # Tài liệu thiết kế hệ thống, phân tích nghiệp vụ & UI-API mapping
└── README.md           # Tài liệu tổng quan toàn bộ dự án (File này)
```

> 💡 **Chi tiết kỹ thuật chuyên sâu:**
> - Xem tài liệu chi tiết phía máy chủ tại [backend/INFO.md](backend/INFO.md).
> - Xem tài liệu chi tiết phía giao diện tại [frontend/INFO.md](frontend/INFO.md).

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Yêu cầu môi trường
- **Node.js**: Phiên bản 18.x trở lên (khuyên dùng Node 20 LTS hoặc 24).
- **Ollama**: Đã cài đặt trên máy tính (để phục vụ tính năng AI Chatbot Local).

---

### 2. Khởi động AI Engine (Ollama)
Trước khi khởi động Backend, mở Terminal/PowerShell và tải/chạy mô hình AI:
```powershell
ollama run qwen3:4b-instruct
```
*(Giữ cửa sổ này hoạt động hoặc để Ollama chạy nền tại cổng mặc định `http://localhost:11434`).*

---

### 3. Khởi động Backend (NestJS Server - Cổng 8080)
Mở một cửa sổ Terminal mới:
```powershell
cd backend
npm install
npm run start:dev
```
- **API Server**: `http://localhost:8080`
- **Tài liệu Swagger UI**: `http://localhost:8080/api/docs`
- **File Test SSE Chatbot độc lập**: `http://localhost:8080/test-sse.html`

---

### 4. Khởi động Frontend (React / Vite - Cổng 3000)
Mở một cửa sổ Terminal mới:
```powershell
cd frontend
npm install
npm run dev
```
- **Ứng dụng Web Storefront**: `http://localhost:3000`

---

## 🔑 Tài Khoản Thử Nghiệm (Test Accounts)

Hệ thống được nạp sẵn Mock Database đa dạng. Bạn có thể sử dụng các tài khoản sau để kiểm thử:

| Vai trò | Tên đăng nhập | Mật khẩu | Phạm vi quyền hạn |
|---|---|---|---|
| **Quản trị viên (Admin)** | `admin` | `123` | Toàn quyền: Xem Dashboard doanh thu, quản lý Sản phẩm, Danh mục, Đơn hàng, Voucher, Khách hàng. |
| **Khách hàng (User)** | `user1` | `123` | Mua hàng, đồng bộ Giỏ hàng Backend, Chatbot AI, áp dụng Voucher, xem Lịch sử đơn hàng. |
| **Khách hàng phụ (User)** | `user2` / `user3` | `123` | Kiểm tra tính năng đa người dùng và phân tách giỏ hàng riêng biệt. |

---

## ✨ Tính Năng Nổi Bật

### 1. Trợ Lý AI Chatbot Thông Minh (Ollama + SSE)
- **Truy xuất thời gian thực**: Nạp danh mục và thông tin tồn kho vào System Prompt để AI tư vấn chuẩn xác 100% theo dữ liệu thật trong kho.
- **Phản hồi gõ chữ tự nhiên (Streaming)**: Dùng Server-Sent Events (SSE) để stream từng ký tự phản hồi từ LLM mượt mà tương tự ChatGPT.
- **Thẻ sản phẩm tương tác (Product Cards)**: Tự động trích xuất sản phẩm liên quan thành danh sách thẻ cuộn ngang với hình ảnh sắc nét, giá bán và nút "Thêm vào giỏ" tức thì.
- **Bộ nhớ hội thoại (Conversation Memory)**: Duy trì ngữ cảnh của 4-6 tin nhắn gần nhất giúp khách hàng hỏi nối tiếp tự nhiên (ví dụ: *"Tư vấn đèn bàn"* -> *"loại màu trắng á bạn"*).
- **Giao diện tiện lợi**: Khung chat rộng rãi (540px), hỗ trợ nút Phóng to toàn màn hình (Maximize) và render định dạng Markdown sinh động.

### 2. Quản Lý Giỏ Hàng Tập Trung (Backend Carts Module)
- Giỏ hàng được lưu trữ tập trung tại cơ sở dữ liệu Backend theo mã khách hàng (`maKH`).
- Đồng bộ tức thì giữa các thiết bị và phiên làm việc, không phụ thuộc LocalStorage.
- Tự động kiểm tra số lượng tồn kho và thông tin sản phẩm mới nhất khi tải giỏ.

### 3. Quy Trình Đặt Hàng & Quản Lý Đơn Hàng (Orders & Vouchers)
- Tự động áp dụng mã giảm giá (Voucher) theo phần trăm hoặc số tiền cố định với điều kiện đơn hàng tối thiểu.
- Khấu trừ tồn kho khi đặt hàng và tự động hoàn trả tồn kho nếu đơn hàng bị hủy.
- Khách hàng dễ dàng theo dõi hành trình đơn hàng qua trang Lịch sử đơn hàng.

### 4. Bảng Điều Khiển Quản Trị (Admin Dashboard)
- Biểu đồ thống kê doanh thu, số lượng đơn hàng theo từng trạng thái.
- Quản trị toàn diện: Thêm, sửa, xóa, tìm kiếm Sản phẩm, Danh mục, Khách hàng và Mã giảm giá.

### 5. Thiết Kế Giao Diện Tinh Tế (Haravan / Muji / Apple Style)
- Tối giản, hiện đại với tone màu Đen chủ đạo (`#121212`), Nền Trắng (`#ffffff`) và điểm nhấn Vàng Hoàng Gia (`#c59b27`).
- Chuẩn Typography `Plus Jakarta Sans`, hỗ trợ tiếng Việt sắc nét và tương thích Responsive mọi kích thước màn hình.

---

## 👥 Thành Viên Thực Hiện (Nhóm 8 - DNTU)
- **Đồ án**: Phân tích & Thiết kế Hệ thống Thông tin
- **Trường**: Đại học Công nghệ Đồng Nai (DNTU)
