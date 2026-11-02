# 📘 LumiShop Frontend - Tài Liệu Kiến Trúc & Kỹ Thuật

> Tài liệu kỹ thuật chi tiết dành cho lập trình viên và nhóm phát triển phân hệ **Frontend** dự án LumiShop (React 19 + Vite 8).

---

## 1. Tổng Quan Kiến Trúc & Công Nghệ

Frontend LumiShop là ứng dụng Single Page Application (SPA) xây dựng trên nền tảng **React 19** và bộ công cụ **Vite 8**, hướng đến trải nghiệm người dùng mượt mà, tốc độ tải trang tức thì và giao diện thương mại điện tử chuẩn Haravan / Muji / Apple style.

| Thành phần | Công nghệ / Thư viện | Vai trò |
|---|---|---|
| **Core Framework** | React 19 + React DOM | Giao diện người dùng hướng thành phần (Component-driven) |
| **Build Tool & Bundler** | Vite 8 + Rolldown/ESBuild | Môi trường phát triển HMR cực nhanh và đóng gói tối ưu |
| **Ngôn ngữ** | TypeScript 6 | Định kiểu tĩnh toàn diện, phát hiện lỗi sớm tại thời điểm biên dịch |
| **Styling & CSS** | Tailwind CSS v4 | Thiết kế tiện ích (Utility-first CSS) thế hệ mới |
| **Quản lý Server State** | TanStack Query (React Query v5) | Caching, deduplication, re-fetch dữ liệu API thông minh |
| **Điều hướng (Routing)** | React Router DOM v7 | Quản lý định tuyến Storefront, Protected Route và Admin Panel |
| **Quản lý Form & Validation** | React Hook Form + Zod | Xử lý Form hiệu năng cao, validate schema chặt chẽ |
| **HTTP Client** | Axios | Giao tiếp RESTful API, tự động gắn Bearer Token và Interceptor |
| **Hệ thống Icon** | Lucide React | Bộ biểu tượng vector tối giản, sắc nét và nhẹ |

---

## 2. Cấu Trúc Thư Mục Chi Tiết (`frontend/src/`)

```text
frontend/src/
├── App.tsx                     # Component gốc chứa Router Provider & Query Client
├── index.css                   # Định nghĩa CSS toàn cục & style tùy biến thanh cuộn Chatbot
├── main.tsx                    # Điểm nạp ứng dụng React vào DOM
│
├── api/                        # Tầng kết nối và gọi API Backend (Axios Client)
│   ├── client.ts               # Instance Axios với Interceptors đính kèm JWT Token
│   ├── auth.api.ts             # Đăng nhập, đăng ký, refresh token, hồ sơ cá nhân
│   ├── cart.api.ts             # Gọi API Giỏ hàng Backend (/carts)
│   ├── categories.api.ts       # Lấy danh sách danh mục sản phẩm
│   ├── chatbot.api.ts          # Kết nối SSE stream /chat/stream và lịch sử chat
│   ├── customers.api.ts        # Quản lý khách hàng (Admin)
│   ├── dashboard.api.ts        # Thống kê doanh thu, đơn hàng (Admin)
│   ├── orders.api.ts           # Tạo đơn, tra cứu lịch sử, cập nhật trạng thái đơn
│   ├── products.api.ts         # Tìm kiếm, lọc, chi tiết sản phẩm, CRUD
│   └── vouchers.api.ts         # Tra cứu và kiểm tra mã giảm giá
│
├── components/                 # Các thành phần giao diện tái sử dụng
│   ├── cart/                   # Component Giỏ hàng: CartDrawer (ngăn kéo trượt)
│   ├── chatbot/                # Component AI: ChatbotWidget (cửa sổ chat nổi thông minh)
│   ├── common/                 # UI cơ bản: Button, Input, Modal, Badge, Toast...
│   ├── layout/                 # Khung trang: Header, Footer, AdminLayout
│   └── products/               # Khối sản phẩm: ProductCard, ProductGrid
│
├── context/                    # Quản lý Global State thông qua React Context
│   ├── AuthContext.tsx         # Lưu trữ Access Token, thông tin người dùng và quyền hạn
│   └── CartContext.tsx         # Đồng bộ dữ liệu Giỏ hàng trực tiếp với Backend API
│
├── pages/                      # Các trang màn hình chính của ứng dụng
│   ├── storefront/             # Phân hệ Cửa hàng dành cho Khách mua hàng
│   │   ├── HomePage.tsx        # Trang chủ giới thiệu, banner, sản phẩm nổi bật
│   │   ├── ProductsPage.tsx    # Trang danh sách sản phẩm, bộ lọc danh mục và tìm kiếm
│   │   ├── ProductDetailPage.tsx # Trang xem chi tiết sản phẩm và chọn số lượng
│   │   ├── CheckoutPage.tsx    # Trang thanh toán, chọn địa chỉ và áp mã Voucher
│   │   ├── OrderHistoryPage.tsx# Trang xem lịch sử đơn hàng và theo dõi trạng thái
│   │   ├── LoginPage.tsx       # Trang đăng nhập tài khoản
│   │   └── RegisterPage.tsx    # Trang đăng ký tài khoản mới
│   │
│   └── admin/                  # Phân hệ Quản trị dành cho Admin
│       ├── DashboardPage.tsx   # Tổng quan doanh thu, biểu đồ và số liệu quan trọng
│       ├── AdminProductsPage.tsx # Quản lý danh sách sản phẩm, thêm/sửa/xóa
│       ├── AdminCategoriesPage.tsx # Quản lý danh mục hàng hóa
│       ├── AdminOrdersPage.tsx # Duyệt đơn, cập nhật trạng thái đơn hàng
│       ├── AdminCustomersPage.tsx # Danh sách khách hàng và phân quyền
│       └── AdminVouchersPage.tsx # Tạo và quản lý mã khuyến mãi
│
├── routes/                     # Phân chia Route theo quyền hạn
│   └── index.tsx               # Public Routes, Protected Routes (User), Admin Routes
│
├── types/                      # Định nghĩa kiểu dữ liệu TypeScript dùng chung
│   ├── auth.types.ts           # Kiểu thông tin đăng nhập, token, User
│   ├── cart.types.ts           # Kiểu giỏ hàng và Cart Item
│   ├── chat.types.ts           # Kiểu tin nhắn Chatbot, ProductCard stream, metadata
│   ├── order.types.ts          # Kiểu Đơn hàng, Chi tiết đơn, Trạng thái
│   └── product.types.ts        # Kiểu Sản phẩm, Danh mục, Tồn kho
│
└── utils/                      # Hàm tiện ích dùng chung
    ├── format.ts               # Định dạng tiền tệ (550.000₫), định dạng ngày tháng
    └── error.ts                # Xử lý chuẩn hóa thông báo lỗi từ Backend
```

---

## 3. Danh Sách Các Màn Hình Chính (Pages)

### 3.1. Phân hệ Cửa hàng (Storefront)
1. **Trang Chủ (`HomePage.tsx`)**: Hero banner ấn tượng, thanh danh mục trực quan, hiển thị sản phẩm mới nhất và các ưu đãi hiện hành.
2. **Trang Sản Phẩm (`ProductsPage.tsx`)**: Hiển thị lưới sản phẩm, hỗ trợ tìm kiếm từ khóa, phân loại theo danh mục có đếm số lượng sản phẩm thực tế, lọc theo mức giá.
3. **Trang Chi Tiết Sản Phẩm (`ProductDetailPage.tsx`)**: Xem hình ảnh lớn, thông số chi tiết, tình trạng tồn kho và nút thêm vào giỏ / mua ngay.
4. **Ngăn Kéo Giỏ Hàng (`CartDrawer.tsx`)**: Trượt từ mép phải màn hình, hỗ trợ tăng giảm số lượng tức thời (đồng bộ Backend), tính tổng tiền và chuyển nhanh đến thanh toán.
5. **Trang Thanh Toán (`CheckoutPage.tsx`)**: Nhập thông tin giao hàng, áp dụng mã giảm giá (Voucher) có tính toán trừ tiền tự động và xác nhận đặt hàng.
6. **Trang Lịch Sử Đơn Hàng (`OrderHistoryPage.tsx`)**: Theo dõi các đơn đã đặt, xem chi tiết sản phẩm trong đơn, trạng thái xử lý và tùy chọn hủy đơn khi còn ở trạng thái chờ.

### 3.2. Phân hệ Quản Trị (Admin Panel)
1. **Dashboard (`DashboardPage.tsx`)**: Thống kê doanh thu thực tế, số lượng đơn hàng, số khách hàng mới và biểu đồ trực quan.
2. **Quản lý Sản phẩm (`AdminProductsPage.tsx`)**: Bảng dữ liệu sản phẩm, tìm kiếm, form thêm/sửa sản phẩm kèm kiểm tra tồn kho.
3. **Quản lý Danh mục (`AdminCategoriesPage.tsx`)**: Thêm, chỉnh sửa và quản lý các nhóm danh mục sản phẩm.
4. **Quản lý Đơn hàng (`AdminOrdersPage.tsx`)**: Duyệt đơn hàng (`ChoXacNhan` ➔ `DangGiao` ➔ `DaGiao`), hỗ trợ hủy đơn kèm tự động hoàn kho.
5. **Quản lý Voucher (`AdminVouchersPage.tsx`)**: Tạo mã giảm giá theo % hoặc tiền cố định, thời hạn sử dụng và số lượng phát hành.

---

## 4. Phân Tích Chuyên Sâu Khung Chat AI (`ChatbotWidget.tsx`)

Khung chat AI được đặt nổi ở góc dưới bên phải màn hình (`fixed bottom-6 right-6`), hỗ trợ các tính năng hiện đại hàng đầu:

### 4.1. Kích thước & Khả năng mở rộng (Maximize / Minimize)
- Mặc định: Kích thước rộng rãi **540px chiều ngang** và **750px chiều cao** (hoặc `85vh` trên màn hình nhỏ) giúp hiển thị đầy đủ văn bản tư vấn và danh sách sản phẩm gợi ý.
- Nút **Maximize**: Nằm cạnh nút đóng ở thanh tiêu đề, cho phép người dùng mở rộng khung chat ra toàn màn hình để theo dõi trải nghiệm tư vấn như một ứng dụng độc lập.

### 4.2. Xử lý luồng dữ liệu thời gian thực (Server-Sent Events)
- Kết nối tới API `GET /chat/stream` qua cơ chế stream reading của `fetch`.
- **Hiệu ứng gõ chữ (Typing Stream)**: Khi nhận sự kiện `type: 'text'`, nội dung trả lời được cập nhật liên tục vào bong bóng chat kèm con trỏ nhấp nháy tạo cảm giác AI đang suy nghĩ và gõ phím chân thực.
- **Render Markdown**: Tự động parse và hiển thị in đậm chữ `**nội dung**` và danh sách gạch đầu dòng `- mục` đẹp mắt.

### 4.3. Thẻ Sản Phẩm Cuộn Ngang (Product Cards Carousel)
- Khi nhận sự kiện `type: 'products'`, danh sách các sản phẩm gợi ý được hiển thị bên dưới câu trả lời thành một hàng thẻ cuộn ngang (`overflow-x: auto` với CSS `.product-cards-scroll`).
- Mỗi thẻ hiển thị: Ảnh minh họa sản phẩm, tên sản phẩm, giá tiền định dạng VNĐ và nút biểu tượng "Thêm vào giỏ" (`ShoppingCart`).
- **Nút "Xem tất cả N sản phẩm"**: Xuất hiện khi tổng số sản phẩm tìm thấy (`totalFound`) lớn hơn 3, giúp khách hàng bấm vào để chuyển thẳng đến trang tìm kiếm với từ khóa tương ứng.

### 4.4. Bộ Nhớ Ngữ Cảnh (Conversation Memory)
- Component lưu trữ danh sách tin nhắn trong phiên.
- Khi người dùng gửi câu hỏi mới, hệ thống tự động trích xuất **4-6 tin nhắn gần nhất** (cả của khách và bot) và mã hóa gửi kèm qua query param `&history=...`.
- Nhờ đó, AI duy trì được mạch nói chuyện liền mạch mà không bị mất ngữ cảnh giữa chừng.

### 4.5. Bảo Vệ Thao Tác Mua Hàng
- Khi người dùng bấm nút "Thêm vào giỏ" trên thẻ sản phẩm trong khung chat:
  - Nếu đã đăng nhập: Sản phẩm được gửi lên Backend API `/carts/items` và hiển thị thông báo thành công.
  - Nếu chưa đăng nhập: Hiển thị cảnh báo yêu cầu đăng nhập và chuyển hướng đến trang `/login`.

---

## 5. Các Lệnh Thông Dụng (CLI Commands)

```powershell
# 1. Cài đặt các gói thư viện
npm install

# 2. Khởi động môi trường phát triển (Local Dev Server tại port 3000)
npm run dev

# 3. Kiểm tra kiểu dữ liệu TypeScript và build gói tối ưu hóa cho Production
npm run build

# 4. Kiểm tra lỗi cú pháp và quy chuẩn mã nguồn với Oxlint
npm run lint

# 5. Xem trước bản build Production tại máy cục bộ
npm run preview
```
