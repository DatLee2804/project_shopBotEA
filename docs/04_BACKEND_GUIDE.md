# 04_BACKEND_GUIDE.md - HƯỚNG DẪN XÂY DỰNG BACKEND (NESTJS)

## 1. Kiến trúc Module
Mỗi tính năng chia thành module độc lập trong `backend/src/modules/`:
- `prisma/`: Global `PrismaModule` và `PrismaService`.
- `auth/`: `JwtStrategy`, `JwtRefreshStrategy`, `AuthController`, `AuthService`.
- `users/`: Quản lý hồ sơ, nâng cấp tài khoản từ `BUYER` lên `SELLER`.
- `bots/`: Xử lý logic tìm kiếm, phân trang, tạo slug tự động (`slugify`), tích hợp `StorageService`.
- `storage/`: Tích hợp `@aws-sdk/client-s3` và `@aws-sdk/s3-request-presigner`.
  - Chỉ chấp nhận file có đuôi `.ex4` hoặc `.ex5` (kiểm tra extension & magic bytes).
  - Sinh Presigned URL tải xuống với `ExpiresIn: 60` (giây).
- `orders/`: Xử lý giao dịch trong `prisma.$transaction([...])` để đảm bảo: Cập nhật Order `COMPLETED` + Cộng tiền Seller + Sinh `License` diễn ra đồng thời (nguyên tử).
- `licenses/`: Sinh chuỗi License Key ngẫu nhiên theo định dạng `EA-XXXX-XXXX-XXXX` (dùng `crypto.randomBytes`).

## 2. Global Pipes & Filters (`main.ts`)
- Bật `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`.
- Tạo `HttpExceptionFilter` toàn cục để mọi lỗi văng ra đều tuân thủ format `{ success: false, errorCode, message }` trong `06_ERROR_CODES.md`.
- Cấu hình CORS chỉ cho phép domain của Frontend (`FRONTEND_URL`).