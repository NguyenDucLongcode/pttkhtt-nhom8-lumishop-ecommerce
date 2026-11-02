# LumiShop Design System

> **Hệ Thống Thiết Kế Giao Diện Thương Mại Điện Tử LumiShop**  
> **Định vị**: Cửa hàng chuyên doanh đèn bàn bảo vệ thị lực và thiết bị chiếu sáng gia dụng thông minh.  
> **Phong cách**: Thực dụng, sạch sẽ, tinh tế, ưu tiên trải nghiệm mua sắm thực tế của người tiêu dùng Việt Nam (tham khảo tiêu chuẩn Shopee Mall, Tiki, Muji, Haravan theme).  
> **Cam kết**: Tuyệt đối không dùng gradient neon, không glassmorphism mờ ảo, không blob trang trí vô nghĩa, không emoji thay icon. Sử dụng 100% icon đồng bộ từ `lucide-react`.

---

## 1. Bảng Màu Thương Hiệu (Color Palette)

Lấy cảm hứng từ ánh sáng đèn bàn ấm cúng (Warm Amber / Amber Gold), tạo cảm giác tin cậy, ấm áp cho không gian học tập và làm việc.

```
Màu chủ đạo (Primary - Ánh đèn ấm):
├── 50:  #fffbeb
├── 100: #fef3c7
├── 500: #f59e0b (Màu điểm nhấn phụ)
├── 600: #d97706 (Primary Brand - Màu chủ đạo cho button, logo, active state)
└── 700: #b45309 (Hover state cho primary)

Màu nhấn hành động (Accent - Xanh mua sắm tin cậy):
├── 600: #0284c7 (Sky Blue - Badge ưu đãi, liên kết)
└── 500: #0ea5e9

Màu trạng thái nghiệp vụ (Semantic):
├── Success: #16a34a (Xanh lá - Còn hàng, Giao thành công, Voucher hợp lệ)
├── Warning: #ea580c (Cam - Chờ xác nhận, Sắp hết hàng <= 5)
├── Danger:  #dc2626 (Đỏ - Hết hàng, Đã hủy, Báo lỗi API, Giá bán)
└── Info:    #2563eb (Xanh dương - Đang giao hàng)

Thang xám trung tính (Neutral Gray - Nền & Văn bản):
├── 50:  #f8fafc (Nền toàn trang app background)
├── 100: #f1f5f9 (Nền thẻ card, nền input disabled)
├── 200: #e2e8f0 (Đường viền border nhẹ nhàng)
├── 300: #cbd5e1 (Đường viền divider)
├── 500: #64748b (Chữ phụ, mô tả ngắn, placeholder)
├── 700: #334155 (Chữ nội dung chính)
└── 900: #0f172a (Tiêu đề, tên sản phẩm, độ tương phản cao)
```

---

## 2. Typography & Định Dạng Bản Địa Hóa (Vietnamese Localization)

### 2.1 Font Chữ
- **Font chính**: `Inter` hoặc `Be Vietnam Pro`, `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`.
- Hỗ trợ đầy đủ 100% dấu thanh tiếng Việt không bị lỗi hiển thị chân chữ (dấu hỏi, ngã, nặng rõ ràng).

### 2.2 Thang Cỡ Chữ (Type Scale)
- `xs` (12px / line-height 16px): Nhãn phụ, thời gian ngày đặt, badge nhỏ.
- `sm` (14px / line-height 20px): Văn bản nội dung phụ, thông tin chi tiết bảng.
- `base` (16px / line-height 24px): Cỡ chữ mặc định cho nội dung, nút bấm chuẩn, input.
- `lg` (18px / line-height 28px): Tiêu đề card sản phẩm, giá bán nổi bật.
- `xl` (20px / line-height 28px): Tiêu đề phân mục trên trang.
- `2xl` (24px / line-height 32px): Tiêu đề trang, giá sản phẩm chi tiết.
- `3xl` (30px / line-height 36px): Banner tiêu đề chính.

### 2.3 Chuẩn Hiển Thị Số & Ngày Tháng Việt Nam
- **Định dạng tiền tệ**: Dùng hàm tiện ích chuẩn `formatCurrency(number)`:
  ```typescript
  export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };
  // Kết quả: "550.000 ₫" hoặc format chuỗi "550.000₫"
  ```
- **Định dạng ngày tháng**: Sử dụng dạng `dd/MM/yyyy` hoặc `dd/MM/yyyy HH:mm` cho đơn hàng:
  ```typescript
  export const formatDate = (isoString?: string): string => {
    if (!isoString) return '--';
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  ```

---

## 3. Spacing, Bo Góc (Radius) & Đổ Bóng (Elevation)

- **Thang Spacing**: Hệ lưới chuẩn 4px / 8px (`p-2: 8px`, `p-3: 12px`, `p-4: 16px`, `p-6: 24px`, `gap-4: 16px`, `gap-6: 24px`).
- **Bo góc (Border Radius)**: Nhất quán, không bo tròn quá đà (không dùng `rounded-3xl` bong bóng):
  - Badge, Tag: `rounded-md` (6px)
  - Button, Input: `rounded-lg` (8px)
  - Card sản phẩm, Modal, Drawer: `rounded-xl` (12px)
  - Avatar, Icon button tròn: `rounded-full`
- **Đổ bóng (Shadow)**: Rất nhẹ và tự nhiên, không bóng đen dày:
  - Card thường: `shadow-sm` (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`)
  - Card hover & Dropdown menu: `shadow-md`
  - Modal & Chatbot popup: `shadow-lg`

---

## 4. Quy Chuẩn Thành Phần Giao Diện (UI Components)

### 4.1 Card Sản Phẩm (Product Card)
- **Tỉ lệ khung hình ảnh**: Cố định `aspect-square` (1:1), dùng `object-cover`.
- **Skeleton loading**: Hiển thị khối chữ nhật xám animate-pulse đúng tỉ lệ ảnh trước khi tải xong.
- **Image Fallback**: Khi đường link ảnh lỗi (`onError`), tự động trỏ về ảnh SVG placeholder chuẩn đèn bàn LumiShop nền trắng nhẹ (`#f8fafc`).
- **Trạng thái tồn kho**:
  - Nếu `soLuongTon > 10`: Hiển thị giá đỏ đậm, nút "Thêm vào giỏ" sẵn sàng.
  - Nếu `1 <= soLuongTon <= 5`: Thêm dòng chữ cảnh báo nhỏ màu cam: *"Chỉ còn X sản phẩm"*.
  - Nếu `soLuongTon === 0`: Đè watermark mờ *"Hết hàng"*, nút mua đổi thành disabled *"Tạm hết hàng"*.
  - Nếu `trangThai === 'NgungBan'`: Đè nhãn xám *"Ngừng kinh doanh"*.

### 4.2 Nút Bấm (Button)
- Chiều cao chuẩn: Mobile 44px (touch-target thân thiện), Desktop 40px.
- Hiệu ứng: Chuyển động nhẹ nhàng `transition-all duration-150 active:scale-[0.98]`.
- Nút submit form luôn có spinner nhỏ quay đều và tự động disable để chống click đúp.

### 4.3 Thông Báo & Trạng Thái (Toast & Alert)
- Dùng `sonner` hoặc component Toast nhẹ, hiển thị góc trên/dưới phải với icon Lucide rõ ràng:
  - Thành công: Icon `CheckCircle2` màu xanh lá.
  - Lỗi: Icon `AlertCircle` màu đỏ.
  - Cảnh báo: Icon `AlertTriangle` màu cam.

---

## 5. Trải Nghiệm Mobile-First (Responsive Layout)

- **375px (Mobile)**:
  - Header thu gọn thành Hamburger Menu + Icon Giỏ hàng kèm badge số lượng + Nút mở Chatbot.
  - Danh sách sản phẩm: Lưới 2 cột (`grid-cols-2 gap-3`), chữ tiêu đề rút gọn 2 dòng (`line-clamp-2`).
  - Thanh Bottom Bar cố định trên mobile khi ở trang Chi tiết SP gồm: Icon chat, Icon giỏ hàng, Nút "Thêm vào giỏ", Nút "Mua ngay".
- **768px (Tablet)**:
  - Lưới sản phẩm: 3 cột (`grid-cols-3 gap-4`).
  - Bảng Admin cho phép cuộn ngang (overflow-x-auto) không vỡ layout.
- **1280px (Desktop)**:
  - Lưới sản phẩm: 4 cột (`grid-cols-4 gap-6`).
  - Trang chi tiết: Bố cục 2 cột (Trái: Ảnh lớn + Thumbnail, Phải: Thông tin giá & nút đặt).
  - Admin: Sidebar cố định bên trái 260px, nội dung bên phải rộng rãi.
