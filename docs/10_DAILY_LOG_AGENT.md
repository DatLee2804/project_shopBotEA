# 10_DAILY_LOG_AGENT.md - NHẬT KÝ THỰC THI CỦA AI AGENT

> **Quy tắc bắt buộc:** AI Agent phải cập nhật file này sau mỗi phiên làm việc hoặc mỗi khi hoàn thành một Phase để đảm bảo tính liên tục, không lặp lại lỗi cũ.

## Trạng thái các Phase triển khai
- [x] **Phase 1: Setup Monorepo & Database**
  - Khởi tạo cấu trúc `backend/` (NestJS) và `frontend/` (Next.js 14+ App Router + Tailwind với bảng màu Ocean/Sky Blue).
  - Viết `schema.prisma`, sinh Prisma Client thành công, viết hoàn thiện `prisma/seed.ts` chuẩn 100% dữ liệu 6 Bots mẫu theo spec `08_LOCAL_MIGRATION_SEED.md`.
- [x] **Phase 2: Backend Core (Auth, RBAC, Bots, Storage)**
  - Hoàn thiện `AuthModule` (JWT Access Token 15m + Refresh Token 7d lưu bcrypt db, RBAC RolesGuard, Public Decorator, CurrentUser Decorator).
  - Hoàn thiện `BotsModule` (Tìm kiếm, phân trang, lọc theo Platform, Winrate, Drawdown, Sort, tạo slugify, duyệt trạng thái).
  - Hoàn thiện `StorageModule` (S3/Cloudflare R2 presigned download URL 60s, kiểm tra định dạng file thực thi .ex4/.ex5).
- [x] **Phase 3: Orders & License Verification Engine**
  - Hoàn thiện luồng Checkout xử lý transaction (tự động kích hoạt đối với Bot free, trừ phí sàn 15% cộng balance Seller, sinh License Key định dạng `EA-XXXX-XXXX-XXXX`).
  - Hoàn thiện API `POST /api/v1/licenses/verify` dành riêng cho WebRequest từ MQL4/MQL5 (gắn cứng `mtAccountNo` tự động lần đầu, kiểm tra khóa tài khoản, hạn dùng).
  - Hoàn thiện API `PATCH /api/v1/licenses/:id/reset-account` giới hạn 2 lần/tháng.
- [x] **Phase 4: Frontend Marketplace UI**
  - Dựng giao diện Trang chủ (`app/page.tsx`) với Hero Banner Gradient Ocean Blue (`#0284C7`), Bộ lọc đa chiều (`FilterBar`), lưới 3 cột thẻ sản phẩm (`BotCard`).
  - Dựng trang Chi tiết Bot (`app/bots/[slug]/page.tsx`) chuẩn bố cục 2 cột (Chỉ số Backtest, Equity Curve, Đánh giá Reviews, Hộp mua hàng Sticky Purchase Box & Modal Checkout).
  - Trang Đăng nhập (`app/(auth)/login/page.tsx`) & Đăng ký (`app/(auth)/register/page.tsx`) tích hợp sẵn nút test tài khoản nhanh theo Role (Buyer, Seller, Admin).
- [x] **Phase 5: User Dashboard & Seller Portal**
  - Dựng Sidebar đa vai trò (`app/dashboard/layout.tsx`).
  - Dựng trang quản lý License (`app/dashboard/licenses/page.tsx`): 1-click Copy License Key, hiển thị MT Account ID, nút Reset Account, nút Tải file .ex4/.ex5 (link presigned 60s), hướng dẫn WebRequest MQL4/MQL5.
  - Dựng Kênh Seller (`app/dashboard/seller/page.tsx`): Thống kê doanh thu, Form đăng Bot EA kèm kéo thả file .ex4/.ex5, danh sách Bot và trạng thái duyệt.
  - Dựng Trang Admin (`app/dashboard/admin/page.tsx`): Danh sách Bot PENDING, nút Duyệt / Từ chối tức thì.

## Nhật ký chi tiết
- **[2026-11-12 14:15]**: Khởi tạo tài liệu kiến trúc dự án `00` -> `11`.
- **[2026-11-12 14:35]**: Hoàn thiện Phase 1 và Phase 2 Backend:
  - Khắc phục cấu hình ESM / CommonJS cho NestJS compiler.
  - Generate thành công Prisma Client 5.22.0.
  - Cập nhật `backend/package.json` bổ sung script `prisma seed`.
  - Thiết lập `backend/.env.example` và `backend/.env`.
- **[2026-11-12 15:30]**: Khởi tạo toàn bộ cấu trúc Frontend Next.js 14 App Router, cài đặt Tailwind CSS với bảng màu Ocean & Sky Blue (`#F8FAFC`, `#0284C7`, `#0369A1`, `#0C4A6E`, `#10B981`, `#F59E0B`).
- **[2026-11-13 09:35]**: Hoàn thiện toàn bộ các trang giao diện Frontend:
  - `(auth)/register/page.tsx`, `bots/[slug]/page.tsx`, `dashboard/layout.tsx`, `dashboard/licenses/page.tsx`, `dashboard/seller/page.tsx`, `dashboard/admin/page.tsx`.
  - Next.js build thành công 100% không có cảnh báo hay lỗi kiểu (`Compiled successfully`, 9 static & dynamic routes).
- **[2026-11-13 09:47]**: Đồng bộ và tinh chỉnh toàn bộ API Contract giữa Backend và Frontend:
  - Khớp cấu trúc Response `data` + `meta` phân trang chuẩn RESTful.
  - Xử lý các query params `minWinRate`, `maxDrawdown`, `sort` trong `QueryBotsDto`.
  - Hoàn thiện xử lý WebRequest MQL4/MQL5 trong `VerifyLicenseDto` & `LicensesService`.
  - Cả `backend` (`npm run build`) và `frontend` (`npm run build`) đều build thành công tuyệt đối 0 lỗi.
