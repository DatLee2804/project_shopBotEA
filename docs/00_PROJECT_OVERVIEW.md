# 00_PROJECT_OVERVIEW.md - TỔNG QUAN DỰ ÁN CHỢ BOT EA

## 1. Mục tiêu sản phẩm
Xây dựng nền tảng thương mại điện tử chuyên biệt cho **Expert Advisors (Bot EA) & Indicators** trên MetaTrader 4 (MT4) và MetaTrader 5 (MT5), hoạt động tương tự **MQL5 Market**.
Hệ thống cho phép:
- **Seller (Nhà phát triển Bot):** Đăng tải file biên dịch (`.ex4`, `.ex5`), cấu hình thông số backtest (Winrate, Drawdown, Profit Factor), quản lý phiên bản và rút doanh thu.
- **Buyer (Trader):** Tìm kiếm, xem báo cáo backtest minh bạch, tải bản Demo miễn phí, mua bản quyền (Lifetime / Subscription) và nhận **License Key** tự động.
- **Admin:** Kiểm duyệt mã thực thi/backtest trước khi Bot lên sàn, quản lý tranh chấp và đối soát thanh toán.
- **MT4/MT5 Terminal Integration:** Cung cấp API xác thực License Key gắn cứng với số tài khoản giao dịch (`mtAccountNo`) thông qua hàm `WebRequest()` của MQL4/MQL5.

## 2. Tech Stack Bắt Buộc (Strict Stack)
- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons, TanStack Query (React Query), Zustand (Auth state).
- **Backend:** NestJS (TypeScript), Class-Validator, Class-Transformer, Passport-JWT.
- **Database & ORM:** PostgreSQL 16+, Prisma ORM.
- **Storage:** AWS S3 hoặc Cloudflare R2 (Private Bucket lưu trữ file `.ex4`/`.ex5`, cấp quyền tải qua Presigned URL có thời hạn 60s).
- **Authorization:** RBAC (Role-Based Access Control) với 3 vai trò: `BUYER`, `SELLER`, `ADMIN`.

## 3. Quy tắc vận hành dành cho AI Agent
1. **Không tự ý đổi thư viện:** Phải dùng đúng Stack đã khai báo ở mục 2.
2. **Bảo mật file thực thi:** Tuyệt đối không lưu file `.ex4`/`.ex5` trong thư mục `public/` của Frontend hay Backend.
3. **Đồng bộ Contract:** Mọi API Backend viết ra phải khớp 100% với `01_API_CONTRACT.md` và `06_ERROR_CODES.md`.
4. **Cập nhật tiến độ:** Sau mỗi tính năng hoàn thành, bắt buộc ghi log vào `10_DAILY_LOG_AGENT.md`.