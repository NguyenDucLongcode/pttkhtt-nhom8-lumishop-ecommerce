# 🚀 LumiShop Backend (NestJS)

Chào mừng các thành viên nhóm 8 đến với Repository Backend của dự án **LumiShop** (Hệ thống bán hàng online tích hợp Chatbot AI & Gợi ý sản phẩm). 

Dự án này được xây dựng bằng framework **NestJS**, cung cấp toàn bộ API cho Frontend (User & Admin) hoạt động.

---

## 🛠️ Công nghệ sử dụng
- **Framework:** NestJS (Node.js/TypeScript)
- **Database:** Mock Data (JSON files) thông qua `DbService` (Sẵn sàng nâng cấp lên MySQL/PostgreSQL).
- **Bảo mật:** JWT (Access Token & Refresh Token), Passport, Bcrypt, RBAC (Phân quyền Admin/User).
- **AI Chatbot:** Ollama (Qwen3:4b-instruct) tích hợp kỹ thuật RAG (Truy xuất dữ liệu thật từ Database).
- **Tài liệu API:** Swagger UI.

---

## 📂 Cấu trúc thư mục dự án
```text
lumishop-backend/
├── src/
│   ├── common/          # Chứa Guards (JWT, Roles), Interceptors (Format response), Decorators
│   ├── data/            # Chứa toàn bộ dữ liệu mẫu (db.products.json, db.orders.json...)
│   ├── database/        # DbService (Đọc/ghi file JSON)
│   ├── modules/         # Nơi chứa các phân hệ nghiệp vụ chính
│   │   ├── ai-chatbot/  # Xử lý Chatbot AI (RAG, Stream SSE)
│   │   ├── auth/        # Đăng nhập, Đăng ký, Refresh Token
│   │   ├── categories/  # Quản lý Danh mục
│   │   ├── customers/   # Quản lý Khách hàng
│   │   ├── orders/      # Quản lý Đơn hàng, Checkout, Báo cáo doanh thu
│   │   ├── products/    # Quản lý Sản phẩm
│   │   └── vouchers/    # Quản lý Mã giảm giá
│   ├── app.module.ts    # Module gốc
│   └── main.ts          # File khởi chạy server
├── test-sse.html        # File test giao diện Chatbot (Dành cho Frontend/Backend test)
├── .env                 # Cấu hình biến môi trường
└── package.json
```


💻 HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY (Dành cho Backend/Tester)
1. Yêu cầu hệ thống
Đã cài đặt Node.js (phiên bản 18 trở lên).

Đã cài đặt Ollama (để chạy AI Local).

2. Cài đặt các gói phụ thuộc
Mở terminal tại thư mục gốc của dự án và chạy:

bash
npm install
3. Khởi động Ollama và tải Model AI
Mở một cửa sổ Terminal/PowerShell khác và chạy lệnh sau (chỉ cần chạy lần đầu):

```
bash
ollama run qwen3:4b-instruct
(Lưu ý: Giữ cửa sổ này chạy ngầm trong suốt quá trình test).
```

4. Khởi động Server Backend
Tại thư mục dự án, chạy:

```
bash
npm run start:dev
Server sẽ chạy tại: http://localhost:
```


🔗 BÀN GIAO API CHO FRONTEND (Quan trọng)
1. Tài liệu API (Swagger)
Truy cập đường dẫn sau để xem toàn bộ danh sách API và test trực tiếp:
👉 http://localhost:8080/api/docs

2. Tài khoản Test (Mock Data)
Hệ thống đã có sẵn dữ liệu mẫu. Sử dụng các tài khoản sau để đăng nhập:

Quyền Admin (Quản lý sản phẩm, duyệt đơn, xem doanh thu):

Tên đăng nhập: admin | Mật khẩu: 123

Quyền User (Khách mua hàng, chat):

Tên đăng nhập: user1, user2, user3, user4 | Mật khẩu: 123

3. Hướng dẫn xác thực (JWT Token) trên Swagger
Vào mục Auth -> Gọi POST /auth/login.

Copy chuỗi access_token nhận được.

Bấm nút Authorize (Ổ khóa màu xanh) ở góc trên bên phải Swagger.

Dán token vào và bấm Authorize. Bây giờ bạn có thể gọi các API cần quyền Admin.

🤖 HƯỚNG DẪN TÍCH HỢP CHATBOT (Dành riêng cho bạn Khang - Frontend)
API Chatbot sử dụng công nghệ Server-Sent Events (SSE) để trả về chữ từ từ (giống ChatGPT). Endpoint:
GET /chat/stream?message={câu_hỏi}&token={jwt_token}

Cách xử lý dữ liệu trả về từ API /chat/stream:
Dữ liệu sẽ trả về 2 loại type khác nhau. Frontend phải dùng EventSource để hứng và xử lý:

javascript
const eventSource = new EventSource('/chat/stream?message=...&token=...');

eventSource.onmessage = (event) => {
    const parsed = JSON.parse(event.data);

    // Loại 1: Trả về Thẻ sản phẩm (Product Cards)
    if (parsed.type === 'products') {
        // parsed.content là một mảng các sản phẩm. 
        // Hãy render ra các thẻ HTML (ảnh, tên, giá, nút thêm vào giỏ).
    }

    // Loại 2: Trả về Text (Hiệu ứng gõ chữ)
    if (parsed.type === 'text') {
        // parsed.content là một đoạn chữ ngắn.
        // Hãy nối (append) chữ này vào khung chat để tạo hiệu ứng gõ chữ.
    }

    // Loại 3: Tín hiệu kết thúc
    if (parsed.type === 'done') {
        eventSource.close(); // Đóng kết nối khi AI nói xong
    }
};
Các API khác liên quan đến Chat:

GET /chat/history: Lấy lịch sử chat (Yêu cầu gửi kèm Bearer Token trong Header). Chỉ hoạt động khi đã đăng nhập.

🧪 Kiểm thử (Testing)
Dự án đã được viết Unit Test và E2E Test đầy đủ. Để chạy test:

bash
# Chạy unit test
npm run test

# Chạy e2e test
npm run test:e2e
Chúc nhóm 8 hoàn thành xuất sắc đồ án! Nếu có lỗi API, hãy liên hệ Long (Backend) để fix gấp.

text

---

### 💡 Lưu ý cho bạn:
- File `README.md` này được viết bằng Markdown (định dạng `#` là tiêu đề, ` ``` ` là khối code). Bạn dán vào file là nó sẽ tự động hiển thị đẹp trên GitHub hoặc VS Code.
- Khi bạn gửi link GitHub cho 2 bạn Frontend, họ chỉ cần mở file `README.md` này ra là sẽ biết **mọi thứ** từ cách chạy, tài khoản test, cho đến cách code giao diện Chatbot. Bạn sẽ không phải giải thích dài dòng nữa.
