# 05_FRONTEND_GUIDE.md - THIẾT KẾ GIAO DIỆN & UX (NEXT.JS)

## 1. Hệ thống Phối màu Bắt buộc (Ocean & Sky Blue Theme)
Giao diện mang phong cách **Fintech / Algorithmic Trading** hiện đại, sạch sẽ, tạo sự tin cậy tuyệt đối. AI Agent phải cấu hình chính xác bảng màu này vào `tailwind.config.ts`:

- **Nền chính (Background Canvas):** `#F8FAFC` (Alabaster White - Trắng ngà dịu mắt, làm nổi bật các thẻ sản phẩm).
- **Nền thẻ / Bề mặt (Surface / Card):** `#FFFFFF` (Pure White - Trắng tinh khiết) kèm viền `#E2E8F0`.
- **Màu thương hiệu chính (Deep Ocean Blue):**
  - `ocean-600`: `#0284C7` (Nút hành động chính: "Mua ngay", "Tải Bot", điểm nhấn tiêu đề).
  - `ocean-700`: `#0369A1` (Trạng thái Hover của nút chính).
  - `ocean-900`: `#0C4A6E` (Footer, chữ nhấn đậm trên nền sáng).
- **Màu phụ trợ (Sky Blue Light):**
  - `ocean-50`: `#F0F9FF` (Nền Hero Banner chuyển sắc, nền bảng thông số).
  - `ocean-100`: `#E0F2FE` (Nền các Badge như `MT5`, `Scalping`, `Lifetime`).
  - `ocean-300`: `#7DD3FC` (Viền thẻ Bot khi di chuột vào - Hover border).
- **Màu chữ (Typography):**
  - Chữ chính: `#0F172A` (Slate 900).
  - Chữ phụ / Mô tả: `#475569` (Slate 600).
- **Màu chỉ số Trading (Semantic Colors):**
  - Lợi nhuận / Winrate cao: `#10B981` (Emerald 500) trên nền `#ECFDF5`.
  - Cảnh báo / Drawdown: `#F59E0B` (Amber 500).

## 2. Các trang & Component trọng tâm
1. **Navbar (`components/Navbar.tsx`):** Nền trắng mờ (`bg-white/90 backdrop-blur-md`), viền dưới `border-ocean-100`. Hiển thị Logo xanh nước biển, thanh tìm kiếm nhanh, nút chuyển đổi giữa **Chợ Bot**, **Dashboard Mua hàng**, và **Kênh Seller**.
2. **Trang chủ (`app/page.tsx`):**
   - Hero Banner nền Gradient `from-ocean-100 via-ocean-50 to-[#F8FAFC]`.
   - Bộ lọc ngang (Filter Bar): Lọc theo nền tảng (`All`, `MT4`, `MT5`), mức giá, Winrate.
   - Grid 3 cột hiển thị `BotCard`.
3. **Trang Chi tiết Bot (`app/bots/[slug]/page.tsx`):**
   - Bố cục 2 cột (Trái 8 phần: Mô tả chi tiết, Biểu đồ tăng trưởng Equity Curve giả lập/thật, Đánh giá từ người mua; Phải 4 phần: Sticky Box hiển thị Giá, Winrate, Max Drawdown, nút "Mua License" màu `bg-ocean-600` và nút "Tải bản Demo" màu `bg-ocean-50 text-ocean-700`).
4. **Dashboard Người dùng (`app/dashboard/licenses/page.tsx`):**
   - Bảng quản lý các Bot đã mua: Hiển thị `License Key` (có nút Copy 1 click), ô hiển thị `MT4/MT5 Account ID` đang gắn, nút **Reset Account** và nút **Download `.ex4/.ex5`**.
5. **Kênh Seller (`app/dashboard/seller/page.tsx`):**
   - Form đăng Bot mới, kéo thả upload file `.ex4`/`.ex5`, xem trạng thái duyệt (`PENDING` / `APPROVED`) và doanh thu.