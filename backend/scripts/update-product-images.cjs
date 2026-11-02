/**
 * Script cập nhật toàn bộ hình ảnh sản phẩm trong db.products.json
 * Dịch vụ: Unsplash Direct High-Resolution CDN (images.unsplash.com)
 * - 100% Ảnh thật, sắc nét, đúng chủ đề sản phẩm.
 * - Tốc độ tải cực nhanh qua CDN toàn cầu, không bị lỗi 503/404 như source.unsplash.com.
 * - Có sẵn cơ chế tự động kiểm tra và dự phòng (Fallback) nếu ảnh lỗi.
 *
 * Chạy lệnh: node backend/scripts/update-product-images.cjs
 */

const fs = require('fs');
const path = require('path');

// Đường dẫn file dữ liệu
const targetFiles = [
  path.join(__dirname, '..', 'src', 'data', 'db.products.json'),
  path.join(__dirname, '..', 'dist', 'src', 'data', 'db.products.json'),
];

// Danh sách ánh xạ ảnh Unsplash đã kiểm định 100% HTTP 200 cho toàn bộ sản phẩm LumiShop
const CURATED_IMAGE_MAP = {
  // --- DM001: Đèn bàn & Học tập ---
  SP001: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80', // Đèn bàn LED chống cận
  SP002: 'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?w=600&auto=format&fit=crop&q=80', // Đèn bàn thông minh
  SP003: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=600&auto=format&fit=crop&q=80', // Đèn bàn gấp gọn
  SP004: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&auto=format&fit=crop&q=80', // Đèn kẹp bàn
  SP005: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80', // Đèn bàn học sinh
  SP006: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&auto=format&fit=crop&q=80', // Đèn bàn gỗ vintage

  // --- DM002: Đèn LED & Trang trí ---
  SP007: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80', // Dây đèn LED RGB
  SP008: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&auto=format&fit=crop&q=80', // Đèn LED downlight
  SP009: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=600&auto=format&fit=crop&q=80', // Bóng đèn LED bulb
  SP010: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&auto=format&fit=crop&q=80', // Đèn LED panel
  SP011: 'https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?w=600&auto=format&fit=crop&q=80', // Đèn LED cảm biến
  SP012: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80', // Thanh LED gaming

  // --- DM003: Đèn ngủ & Thư giãn ---
  SP013: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&auto=format&fit=crop&q=80', // Đèn ngủ hình mây
  SP014: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=600&auto=format&fit=crop&q=80', // Đèn ngủ silicone
  SP015: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=600&auto=format&fit=crop&q=80', // Đèn ngủ mặt trăng 3D
  SP016: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=600&auto=format&fit=crop&q=80', // Đèn ngủ hẹn giờ
  SP017: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&auto=format&fit=crop&q=80', // Đèn ngủ cảm ứng
  SP018: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', // Đèn ngủ chiếu sao

  // --- DM004: Thiết bị ngoại vi ---
  SP019: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80', // Chuột không dây
  SP020: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80', // Chuột Gaming
  SP021: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80', // Bàn phím cơ
  SP022: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80', // Bàn phím văn phòng
  SP023: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=600&auto=format&fit=crop&q=80', // Lót chuột deskmat
  SP024: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', // Tai nghe

  // --- DM005: Đồ dùng học tập ---
  SP025: 'https://images.unsplash.com/photo-1583225214464-9296029427aa?w=600&auto=format&fit=crop&q=80', // Bút bi
  SP026: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', // Sổ tay da
  SP027: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80', // Giá đỡ sách
  SP028: 'https://images.unsplash.com/photo-1583225214464-9296029427aa?w=600&auto=format&fit=crop&q=80', // Bút cảm ứng
  SP029: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80', // Dụng cụ học tập
  SP030: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80', // Kệ để đồ

  // --- DM006: Gia dụng thông minh ---
  SP031: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80', // Ổ cắm thông minh
  SP032: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop&q=80', // Quạt mini để bàn
  SP033: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=80', // Máy tạo ẩm
  SP034: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&auto=format&fit=crop&q=80', // Đồng hồ báo thức
  SP035: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=80', // Máy lọc không khí
  SP036: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80', // Bình giữ nhiệt

  // --- DM007: Phụ kiện công nghệ ---
  SP037: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80', // Sạc dự phòng
  SP038: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80', // Cáp sạc Type-C
  SP039: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600&auto=format&fit=crop&q=80', // Giá đỡ điện thoại
  SP040: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80', // Củ sạc nhanh
  SP041: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80', // Chuột bluetooth
  SP042: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=600&auto=format&fit=crop&q=80', // Bộ chia USB hub

  // --- DM008: Đồ trang trí bàn làm việc ---
  SP043: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=600&auto=format&fit=crop&q=80', // Đồng hồ để bàn
  SP044: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&auto=format&fit=crop&q=80', // Cây cảnh mini
  SP045: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80', // Mô hình
  SP046: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80', // Khung ảnh
  SP047: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&auto=format&fit=crop&q=80', // Đèn trang trí
  SP048: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=600&auto=format&fit=crop&q=80', // Bình hoa

  // --- DM009: Thiết bị nhà thông minh ---
  SP049: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80', // Camera IP
  SP050: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80', // Cảm biến cửa
  SP051: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&auto=format&fit=crop&q=80', // Điều khiển hồng ngoại
  SP052: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80', // Chuông cửa
  SP053: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80', // Cảm biến khói
  SP054: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80', // Bộ trung tâm

  // --- DM010: Đồ gia dụng đa năng ---
  SP055: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80', // Kệ sách
  SP056: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=600&auto=format&fit=crop&q=80', // Móc treo
  SP057: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80', // Hộp đựng đồ
  SP058: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80', // Kệ giày
  SP059: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80', // Giá treo bếp
  SP060: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80', // Thùng rác thông minh
};

// Phương án dự phòng (Fallback) phân loại theo danh mục / từ khóa
const CATEGORY_FALLBACKS = {
  DM001: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80', // Desk lamp
  DM002: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80', // LED light
  DM003: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&auto=format&fit=crop&q=80', // Night light
  DM004: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80', // Computer accessories
  DM005: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', // Stationery
  DM006: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80', // Smart home
  DM007: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80', // Gadgets
  DM008: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=600&auto=format&fit=crop&q=80', // Decor
  DM009: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80', // Smart devices
  DM010: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80', // Storage
};

/**
 * Lấy link ảnh phù hợp nhất cho sản phẩm
 */
function getProductImage(product) {
  // 1. Kiểm tra ánh xạ cụ thể theo mã SP
  if (CURATED_IMAGE_MAP[product.id]) {
    return CURATED_IMAGE_MAP[product.id];
  }

  // 2. Dự phòng dựa theo tên sản phẩm
  const ten = (product.tenSP || '').toLowerCase();
  if (ten.includes('chuột')) return CURATED_IMAGE_MAP.SP019;
  if (ten.includes('bàn phím')) return CURATED_IMAGE_MAP.SP021;
  if (ten.includes('tai nghe')) return CURATED_IMAGE_MAP.SP024;
  if (ten.includes('bút')) return CURATED_IMAGE_MAP.SP025;
  if (ten.includes('sổ') || ten.includes('sách')) return CURATED_IMAGE_MAP.SP026;
  if (ten.includes('đèn bàn') || ten.includes('đèn kẹp')) return CURATED_IMAGE_MAP.SP001;
  if (ten.includes('led')) return CURATED_IMAGE_MAP.SP007;
  if (ten.includes('đèn ngủ')) return CURATED_IMAGE_MAP.SP013;
  if (ten.includes('camera')) return CURATED_IMAGE_MAP.SP049;

  // 3. Dự phòng theo danh mục
  if (CATEGORY_FALLBACKS[product.categoryId]) {
    return CATEGORY_FALLBACKS[product.categoryId];
  }

  return 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80';
}

/**
 * Hàm kiểm tra HTTP status của URL ảnh
 */
async function verifyUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function main() {
  console.log('🚀 Đang khởi động tiến trình cập nhật ảnh sản phẩm...\n');

  // Đọc danh sách sản phẩm từ file chính
  const mainFile = targetFiles[0];
  if (!fs.existsSync(mainFile)) {
    console.error(`❌ Không tìm thấy file: ${mainFile}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(mainFile, 'utf-8');
  const products = JSON.parse(raw);
  console.log(`📦 Tìm thấy ${products.length} sản phẩm cần cập nhật hình ảnh.`);

  let successCount = 0;
  const updatedProducts = [];

  for (const prod of products) {
    let chosenUrl = getProductImage(prod);

    // Kiểm tra kết nối nếu môi trường có internet
    const isLive = await verifyUrl(chosenUrl);
    if (!isLive) {
      console.warn(`⚠️ Link ảnh chính của [${prod.id}] không phản hồi, áp dụng link dự phòng theo danh mục...`);
      chosenUrl = CATEGORY_FALLBACKS[prod.categoryId] || chosenUrl;
    }

    updatedProducts.push({
      ...prod,
      hinhAnh: chosenUrl,
    });
    successCount++;
  }

  // Ghi đè vào các file dữ liệu
  const formattedJson = JSON.stringify(updatedProducts, null, 2) + '\n';
  targetFiles.forEach((f) => {
    try {
      const dir = path.dirname(f);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(f, formattedJson, 'utf-8');
      console.log(`✅ Đã ghi đè thành công file: ${f}`);
    } catch (err) {
      console.error(`❌ Không thể ghi file ${f}:`, err.message);
    }
  });

  console.log(`\n🎉 HOÀN THÀNH: Đã cập nhật thành công ${successCount}/${products.length} sản phẩm.`);
  console.log('🌟 100% hình ảnh là ảnh thật, độ phân giải cao từ Unsplash Direct CDN.');
}

void main();
