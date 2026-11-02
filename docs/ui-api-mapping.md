# Bảng Ánh Xạ UI <-> API Hệ Thống LumiShop

> **Tài liệu đặc tả liên kết Giao diện và Dữ liệu thật (UI to API Mapping)**  
> **Nguyên tắc cốt lõi**: Không bịa đặt trường dữ liệu backend không có (không có rating sao, không có "đã bán 1.2k", không có sort backend unsupported). Mọi trường trên giao diện đều có xuất xứ dữ liệu chính xác từ Backend.

---

## I. Phân Hệ Khách Hàng (Storefront)

### 1. Trang Chủ (`/`)
*Mục đích*: Giới thiệu thương hiệu đèn bàn & gia dụng LumiShop, các danh mục nổi bật, sản phẩm mới/bán chạy và banner ưu đãi.

| Thành phần UI | API Nguồn | Request Params | Field dữ liệu hiển thị thật | Xử lý Loading (Skeleton) | Xử lý Empty State | Xử lý Error State |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Header / Navbar** | `GET /categories` | Không | `tenDanhMuc`, `id` | Shimmer dạng pill ngang danh mục | Hiển thị menu mặc định ("Sản phẩm") | Nút bấm "Tải lại danh mục" |
| **Banner Khuyến Mãi** | `GET /vouchers` | `isActive=true&limit=3` | `code`, `description`, `discountValue`, `discountType` | Card banner skeleton | Ẩn banner voucher nếu không có | Ẩn khối banner |
| **Danh Mục Nổi Bật** | `GET /categories` | Không | `id`, `tenDanhMuc`, `moTa` | Grid 5 ô skeleton tròn/bo góc | Ẩn khối danh mục | Ẩn khối danh mục |
| **Sản Phẩm Đang Bán** | `GET /products` | `page=1&limit=8` | `id`, `tenSP`, `giaBan`, `hinhAnh`, `soLuongTon`, `trangThai` | Grid 8 card skeleton (ảnh + 2 dòng text + giá) | "Hiện chưa có sản phẩm nào" | Banner lỗi kèm nút "Thử lại" |
| **Khối Giới Thiệu Lumi** | Static Content | Không | Câu chuyện thương hiệu, cam kết đèn bảo vệ thị lực | Không | Không | Không |

---

### 2. Trang Danh Sách Sản Phẩm (`/products`)
*Mục đích*: Duyệt toàn bộ sản phẩm, tìm kiếm theo từ khóa, lọc theo danh mục, sắp xếp client-side, phân trang server-side.

| Thành phần UI | API Nguồn | Request Params | Field dữ liệu hiển thị thật | Xử lý Loading (Skeleton) | Xử lý Empty State | Xử lý Error State |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Thanh Tìm Kiếm & Lọc** | Nhận từ URL SearchParams | `search`, `categoryId` | Giá trị input tìm kiếm, danh mục đang chọn | Input disable nhẹ khi submit | Không | Không |
| **Bộ Lọc Danh Mục (Sidebar)** | `GET /categories` | Không | `id`, `tenDanhMuc` | Skeleton sidebar 5 dòng | Ẩn sidebar lọc danh mục | Báo lỗi tải danh mục |
| **Lưới Sản Phẩm** | `GET /products` | `page`, `limit=12`, `search`, `categoryId` | `id`, `tenSP`, `giaBan`, `soLuongTon`, `hinhAnh`, `trangThai`<br>*(Lưu ý: Nếu `soLuongTon === 0` hiển thị nhãn "Hết hàng" và disable nút mua)* | Grid 12 card skeleton | Minh họa Empty icon: "Không tìm thấy sản phẩm phù hợp với từ khóa/danh mục đã chọn" + Nút "Xóa bộ lọc" | Thông báo "Không thể tải danh sách sản phẩm. Vui lòng thử lại" + Nút Retry |
| **Thanh Sắp Xếp (Client-side)** | Dữ liệu trang hiện tại | Client state (`price-asc`, `price-desc`, `name-asc`) | Hiển thị dropdown: "Mặc định", "Giá tăng dần", "Giá giảm dần", "Tên A-Z" | Disabled khi đang fetch API | Ẩn thanh sắp xếp nếu danh sách rỗng | Không |
| **Thanh Phân Trang (Pagination)** | `GET /products` | Trả về từ response: `total`, `page`, `limit` | Tổng số sản phẩm (`total`), số trang = `Math.ceil(total / limit)` | Skeleton thanh phân trang | Ẩn phân trang nếu `total <= limit` | Ẩn |

---

### 3. Trang Chi Tiết Sản Phẩm (`/products/:id`)
*Mục đích*: Cung cấp đầy đủ thông tin kỹ thuật, mô tả, tồn kho thực tế, nút chọn số lượng, thêm vào giỏ, và gợi ý sản phẩm cùng danh mục.

| Thành phần UI | API Nguồn | Request Params | Field dữ liệu hiển thị thật | Xử lý Loading (Skeleton) | Xử lý Empty State | Xử lý Error State |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hình Ảnh Sản Phẩm** | `GET /products/:id` | `id` | `hinhAnh`, `tenSP` | Khối ảnh tỉ lệ 1:1 skeleton lớn | Ảnh fallback SVG "LumiShop Placeholder" | Ảnh fallback |
| **Thông Tin Chi Tiết** | `GET /products/:id` | `id` | - `tenSP`<br>- `giaBan` (format `550.000₫`)<br>- `soLuongTon` (hiển thị "Còn X sản phẩm")<br>- `trangThai` ("Đang kinh doanh" / "Ngừng kinh doanh")<br>- `moTa`<br>- `id` (Mã SP: SP001) | Skeleton title, skeleton price, skeleton 3 đoạn mô tả | Màn hình 404: "Sản phẩm không tồn tại hoặc đã bị xóa" + Nút quay về Cửa hàng | Alert báo lỗi kết nối |
| **Bộ Chọn Số Lượng & Nút Mua** | State nội bộ trang | Giới hạn: `1 <= qty <= soLuongTon` | Input số lượng, Nút "Thêm vào giỏ hàng", Nút "Mua ngay"<br>*(Disabled nếu `soLuongTon === 0` hoặc `trangThai !== 'DangBan'`)* | Button skeleton | Disabled nếu hết hàng | Không |
| **Gợi Ý Sản Phẩm Cùng Danh Mục** | `GET /products/:id/recommendations` | `id` | Danh sách 4 sản phẩm: `id`, `tenSP`, `giaBan`, `hinhAnh`, `soLuongTon` | 4 Card skeleton ngang | Ẩn khu vực gợi ý nếu danh mục không có SP khác | Ẩn khu vực gợi ý |

---

### 4. Giỏ Hàng (`/cart`) & Ngăn Kéo Giỏ Hàng (Mini Cart Drawer)
*Mục đích*: Quản lý danh sách sản phẩm dự định mua, tăng giảm số lượng, tính tạm tính trước khi vào checkout.

| Thành phần UI | API Nguồn | Request Params | Field dữ liệu hiển thị thật | Xử lý Loading (Skeleton) | Xử lý Empty State | Xử lý Error State |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Danh Sách Món Trong Giỏ** | `localStorage` (`lumishop_cart`) | Không | `id`, `tenSP`, `giaBan`, `hinhAnh`, `soLuong`, `soLuongTon` | Không (đọc instant từ storage) | Hình minh họa giỏ trống: "Giỏ hàng của bạn đang trống" + Nút "Khám phá sản phẩm ngay" | Không |
| **Bộ Tăng/Giảm Số Lượng** | State giỏ hàng | Chặn max không vượt quá `soLuongTon` | Số lượng từng món | Thao tác tức thì (Optimistic) | Tự xóa khỏi giỏ nếu giảm về 0 (có hỏi xác nhận) | Không |
| **Bảng Tạm Tính Tiền** | Tính toán Client | `sum(giaBan * soLuong)` | `tamTinh` (Tạm tính tiền hàng) | Không | Ẩn khi giỏ rỗng | Không |
| **Nút "Tiến Hành Thanh Toán"** | Chuyển hướng sang `/checkout` | Kiểm tra giỏ hàng có ít nhất 1 item | Nút bấm to, nổi bật | Không | Disabled khi giỏ rỗng | Bắt đăng nhập nếu chưa có token |

---

### 5. Trang Đặt Hàng & Thanh Toán (`/checkout`)
*Mục đích*: Nhập thông tin nhận hàng, chọn phương thức thanh toán thật, áp dụng voucher giảm giá và xác nhận tạo đơn hàng.

| Thành phần UI | API Nguồn | Request Params | Field dữ liệu hiển thị thật | Xử lý Loading (Skeleton) | Xử lý Empty State | Xử lý Error State |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Thông Tin Khách Hàng** | `GET /customers/:id` (hoặc lấy từ JWT User) | User ID đăng nhập | `hoTen`, `sdt`, `email`, `diaChi` (tự điền sẵn vào Form) | Skeleton form điền địa chỉ | Để form trống cho khách tự điền | Cho phép gõ thủ công |
| **Form Địa Chỉ Nhận Hàng** | User input form | `diaChiGiao` (bắt buộc) | Input text địa chỉ chi tiết | Form sẵn sàng | Báo lỗi form nếu để trống | Validate form bằng Zod |
| **Phương Thức Thanh Toán** | Enum backend | `phuongThucTT` | 3 lựa chọn thật:<br>1. Thanh toán khi nhận hàng (`COD`)<br>2. Chuyển khoản ngân hàng (`ChuyenKhoan`)<br>3. Ví điện tử (`ViDienTu`) | Không | Không | Không |
| **Ô Nhập & Kiểm Tra Voucher** | `GET /vouchers/check/:code` | `code` | Kết quả: `isValid`, `message`, `voucher.discountType`, `voucher.discountValue`, `voucher.minOrderValue` | Spinner nhỏ tại nút "Áp dụng" | Không | Thông báo đỏ: "Mã không hợp lệ hoặc đã hết hạn" |
| **Tóm Tắt Đơn Hàng & Tiền** | Tính toán client + Voucher data | Không | - Tổng tiền hàng (`tongTienHang`)<br>- Giảm giá voucher (`tienGiamGia`)<br>- Phí ship mặc định (`phiShip = 30000`)<br>- Tổng thanh toán (`tongTien`) | Cập nhật số tiền tức thì | Chuyển về `/cart` nếu giỏ rỗng | Không |
| **Nút "Đặt Hàng Ngay"** | `POST /orders/checkout` | `CreateOrderDto`<br>`{ maKH, diaChiGiao, phuongThucTT, items, voucherCode, phiShip }` | Nút submit có icon ổ khóa bảo mật | Nút chuyển sang trạng thái Loading ("Đang khởi tạo đơn hàng...") | Không | Popup lỗi từ backend: "Sản phẩm X không đủ số lượng tồn kho", hoặc lỗi voucher |
| **Modal VietQR / Thanh toán** | Hiển thị sau khi tạo đơn thành công nếu chọn `ChuyenKhoan` | `order.id`, `order.tongTien` | Mã QR VietQR kèm STK shop, số tiền `tongTien`, nội dung CK: `DH{order.id}` | Spinner tạo mã QR | Không | Không |

---

### 6. Trang Lịch Sử Đơn Hàng (`/orders/history`)
*Mục đích*: Khách hàng theo dõi tình trạng đơn đã mua, xem lại chi tiết sản phẩm, giá tiền và trạng thái giao hàng.

| Thành phần UI | API Nguồn | Request Params | Field dữ liệu hiển thị thật | Xử lý Loading (Skeleton) | Xử lý Empty State | Xử lý Error State |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Danh Sách Đơn Hàng** | `GET /orders/history/:maKH` | `maKH` từ token | Danh sách đơn sắp xếp mới nhất trước:<br>- Mã đơn `id` (`DH...`)<br>- Ngày đặt `ngayDat` (format `dd/MM/yyyy HH:mm`)<br>- Trạng thái `trangThai` (Badge: Chờ xác nhận, Đang giao, Đã giao, Đã hủy)<br>- Phương thức `phuongThucTT`<br>- Danh sách món `items` (Tên, số lượng, thành tiền)<br>- Tổng tiền `tongTien` | Skeleton 3 card đơn hàng dạng thanh ngang | Minh họa Empty: "Bạn chưa có đơn hàng nào" + Nút "Bắt đầu mua sắm" | Banner thông báo lỗi + Nút "Thử lại" |
| **Modal Xem Chi Tiết Đơn** | `GET /orders/:id` | `id` | Toàn bộ chi tiết địa chỉ giao hàng, mã voucher đã áp dụng, tiền giảm giá, phí ship | Skeleton nội dung modal | Báo lỗi không tìm thấy đơn | Báo lỗi |

---

### 7. Trang Đăng Nhập / Đăng Ký (`/login`, `/register`)
*Mục đích*: Xác thực tài khoản khách hàng và quản trị viên, cấp phát token JWT.

| Thành phần UI | API Nguồn | Request Body | Field dữ liệu hiển thị thật | Xử lý Loading | Xử lý Lỗi Nghiệp Vụ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Form Đăng Nhập** | `POST /auth/login` | `LoginDto`<br>`{ tenDangNhap, matKhau }` | Trả về `access_token`, `refresh_token`, `user` (lưu token vào cookie/localStorage) | Nút đăng nhập hiển thị spinner, disable input | 401: "Tên đăng nhập hoặc mật khẩu không chính xác" |
| **Tài Khoản Mẫu Nhanh** | Gợi ý UI (Quick Fill) | Không | Nút điền nhanh User mẫu (`vanan99` / `123456`) và Admin mẫu (`maitran` / `admin123` hoặc `admin` / `123`) | Thao tác tức thì | Không |
| **Form Đăng Ký** | `POST /auth/register` | `RegisterDto`<br>`{ hoTen, email, sdt, tenDangNhap, matKhau }` | Sau khi thành công, chuyển hướng đăng nhập hoặc tự login | Nút đăng ký hiển thị spinner | 409: "Tên đăng nhập hoặc Email đã tồn tại trong hệ thống" |

---

### 8. Widget Chatbot AI LumiBot (Góc Phải Màn Hình)
*Mục đích*: Trợ lý bán hàng thông minh, tư vấn sản phẩm, gợi ý thẻ sản phẩm trực tiếp (RAG) và streaming phản hồi văn bản theo thời gian thực.

| Thành phần UI | API Nguồn | Protocol & Params | Field dữ liệu hiển thị thật | Xử lý Loading & Streaming | Xử lý Ngoại Lệ & Lỗi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Nút Mở / Đóng Chatbot** | State giao diện | Local toggle | Bong bóng chat tròn, huy hiệu thông báo | Không | Không |
| **Lịch Sử Hội Thoại Cũ** | `GET /chat/history` | Header `Bearer <token>` (khi đã login) | `cauHoi`, `cauTraLoi`, `timestamp` | Skeleton tin nhắn 2 bên | Khách vãng lai: Hiện lời chào mặc định; Khách đã login chưa có chat: Lời chào thân thiện | Nếu 401 thì coi như khách vãng lai |
| **Thẻ Sản Phẩm Gợi Ý (RAG Cards)** | `GET /chat/stream` | SSE Event `type: 'products'` | Mảng sản phẩm: `id`, `tenSP`, `giaBan`, `hinhAnh`<br>+ Nút bấm nhanh "Thêm vào giỏ" | Xuất hiện ngay khi SSE phát event `products` | Không hiển thị nếu không tìm thấy SP khớp |
| **Chữ Chạy Văn Bản (AI Stream)** | `GET /chat/stream` | SSE Event `type: 'text'` | Từng đoạn chuỗi `content` từ Ollama | Typing animation "LumiBot đang suy nghĩ...", chữ nối tiếp mượt mà | Có nút **"Dừng phản hồi"** để ngắt stream |
| **Xử Lý Lỗi Ollama** | `GET /chat/stream` | SSE Event `type: 'error'` | `error`, `content` | Tắt typing, chuyển bong bóng chat sang viền đỏ cảnh báo | "Trợ lý AI hiện đang bận (Ollama chưa bật), quý khách vui lòng xem danh mục sản phẩm hoặc thử lại sau" |

---

## II. Phân Hệ Quản Trị (Admin Dashboard)

> Yêu cầu: Tất cả các route Admin đều bắt buộc đăng nhập với tài khoản có `role === 'admin'`.

### 1. Dashboard Tổng Quan & Doanh Thu (`/admin`)
| Thành phần UI | API Nguồn | Request Params | Field dữ liệu hiển thị thật | Loading / Empty / Error |
| :--- | :--- | :--- | :--- | :--- |
| **Card Tổng Doanh Thu** | `GET /orders/revenue` | Không | `totalRevenue` (Format VNĐ: `12.500.000₫`) | Skeleton số to / Báo 0₫ / Alert lỗi |
| **Card Tổng Đơn Giao Thành Công** | `GET /orders/revenue` | Không | `totalOrders` (Số lượng đơn hoàn tất) | Skeleton số to / Báo 0 đơn / Alert lỗi |
| **Biểu Đồ Doanh Thu Theo Ngày** | `GET /orders/revenue` | Không | Mảng `dailyRevenue: [{ date, revenue }]` (Vẽ Bar Chart / Area Chart theo ngày) | Skeleton biểu đồ / Empty: "Chưa có dữ liệu phát sinh doanh thu" / Alert lỗi |
| **Danh Sách Đơn Cần Duyệt Gấp** | `GET /orders` | `trangThai=ChoXacNhan` | `id`, `maKH`, `tongTien`, `ngayDat`, `trangThai` | Skeleton bảng / Empty: "Không có đơn nào chờ duyệt" / Alert lỗi |

---

### 2. Quản Lý Sản Phẩm (`/admin/products`)
| Thành phần UI | API Nguồn | Method | Field dữ liệu hiển thị & thao tác | Validate & Xử lý trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **Bảng Sản Phẩm** | `GET /products` | `GET` (kèm `page`, `limit`, `search`, `categoryId`) | - Ảnh `hinhAnh`<br>- Mã `id`<br>- Tên `tenSP`<br>- Danh mục `categoryId`<br>- Giá `giaBan`<br>- Tồn kho `soLuongTon`<br>- Trạng thái `trangThai`<br>- Cột thao tác: Sửa, Xóa | Loading Skeleton bảng 10 hàng; Empty: "Không có sản phẩm nào"; Phân trang `total`, `page`, `limit`. |
| **Bộ Lọc & Tìm Kiếm** | URL Params | `GET` | Input tìm kiếm (`search`), Dropdown danh mục (`categoryId`) | Tìm kiếm real-time có debounce 300ms |
| **Modal Thêm Sản Phẩm** | `POST /products` | `POST` | Input: `tenSP`, `moTa`, `giaBan` (số dương), `soLuongTon` (nguyên dương), `categoryId`, `hinhAnh` (URL + Preview), `trangThai` (`DangBan` \| `NgungBan`) | Validate khớp `CreateProductDto`. Báo lỗi từng input. |
| **Modal Sửa Sản Phẩm** | `PATCH /products/:id` | `PATCH` | Load dữ liệu cũ vào form, cho phép sửa bất kỳ trường nào | Cập nhật ngày `updatedAt`. Toast thông báo thành công. |
| **Hộp Thoại Xóa Sản Phẩm** | `DELETE /products/:id` | `DELETE` | Xác nhận: "Bạn có chắc chắn muốn xóa sản phẩm [tenSP] (id)?" | Toast thành công, invalidate query tải lại bảng. |

---

### 3. Quản Lý Danh Mục (`/admin/categories`)
| Thành phần UI | API Nguồn | Method | Field dữ liệu hiển thị & thao tác | Validate & Xử lý trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **Bảng Danh Mục** | `GET /categories` | `GET` (kèm `search`) | `id`, `tenDanhMuc`, `moTa`, `createdAt` | Phân trang client-side; Empty: "Chưa có danh mục nào". |
| **Modal Thêm Danh Mục** | `POST /categories` | `POST` | `tenDanhMuc` (bắt buộc), `moTa` | Validate `CreateCategoryDto`. Tự sinh ID `CAT...`. |
| **Modal Sửa Danh Mục** | `PATCH /categories/:id` | `PATCH` | `tenDanhMuc`, `moTa` | Toast thông báo thành công. |
| **Xóa Danh Mục** | `DELETE /categories/:id` | `DELETE` | Xác nhận xóa danh mục theo ID | Toast thông báo xóa thành công. |

---

### 4. Quản Lý Đơn Hàng (`/admin/orders`)
| Thành phần UI | API Nguồn | Method | Field dữ liệu hiển thị & thao tác | Validate & Xử lý trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **Bảng Đơn Hàng** | `GET /orders` | `GET` (kèm `trangThai`) | `id`, `maKH`, `ngayDat`, `tongTien`, `phuongThucTT`, `trangThai` | Phân trang client-side. Tab lọc: Tất cả / Chờ xác nhận / Đang giao / Đã giao / Đã hủy. |
| **Xem Chi Tiết Đơn Hàng** | `GET /orders/:id` | `GET` | Danh sách sản phẩm mua, giá tại thời điểm mua, địa chỉ nhận hàng, mã voucher | Modal xem chi tiết rõ ràng, có nút In hóa đơn đơn giản. |
| **Đổi Trạng Thái Đơn Hàng** | `PATCH /orders/:id/status` | `PATCH` | Dropdown chọn trạng thái mới: `ChoXacNhan`, `DangGiao`, `DaGiao`, `DaHuy` | **Cảnh báo khi chọn `DaHuy`**: "Hệ thống sẽ tự động hoàn lại tồn kho cho các sản phẩm trong đơn". |

---

### 5. Quản Lý Voucher Khuyến Mãi (`/admin/vouchers`)
| Thành phần UI | API Nguồn | Method | Field dữ liệu hiển thị & thao tác | Validate & Xử lý trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **Bảng Voucher** | `GET /vouchers` | `GET` (kèm `page`, `limit`, `code`, `isActive`) | `code`, `description`, loại giảm (`discountType`), mức giảm (`discountValue`), đơn tối thiểu (`minOrderValue`), ngày hiệu lực (`startDate` - `endDate`), lượt dùng (`usedCount` / `usageLimit`), kích hoạt (`isActive`) | Phân trang server-side; Badge trạng thái trực quan (Còn hạn, Hết hạn, Tạm tắt). |
| **Modal Thêm Voucher** | `POST /vouchers` | `POST` | Form đầy đủ: `code`, `description`, `discountType`, `discountValue`, `minOrderValue`, `maxDiscountAmount`, `startDate`, `endDate`, `usageLimit`, `isActive` | Validate khớp `CreateVoucherDto`. Bắt lỗi 409 trùng code. |
| **Modal Sửa Voucher** | `PATCH /vouchers/:id` | `PATCH` | Cho phép sửa thông tin, đổi ngày hạn, bật/tắt kích hoạt | Toast thông báo thành công. |
| **Xóa Voucher** | `DELETE /vouchers/:id` | `DELETE` | Xác nhận xóa voucher theo ID | Toast thông báo thành công. |

---

### 6. Quản Lý Khách Hàng (`/admin/customers`)
| Thành phần UI | API Nguồn | Method | Field dữ liệu hiển thị & thao tác | Validate & Xử lý trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **Bảng Khách Hàng** | `GET /customers` | `GET` (kèm `search`) | `id`, `hoTen`, `sdt`, `email`, `diaChi`, `tenDangNhap`, `role`, `createdAt` | Phân trang client-side; Tìm kiếm theo tên hoặc SĐT. |
| **Modal Thêm Khách Hàng** | `POST /customers` | `POST` | `hoTen`, `sdt`, `email`, `diaChi`, `tenDangNhap`, `matKhau` | Validate `CreateCustomerDto`. Báo lỗi 409 nếu trùng email/username. |
| **Modal Sửa Khách Hàng** | `PATCH /customers/:id` | `PATCH` | `hoTen`, `sdt`, `email`, `diaChi` (không đổi username & password) | Cập nhật thông tin profile. |
| **Xóa Khách Hàng** | `DELETE /customers/:id` | `DELETE` | Xác nhận xóa tài khoản khách hàng | Toast thông báo thành công. |
