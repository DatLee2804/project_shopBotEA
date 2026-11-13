# 06_ERROR_CODES.md - DANH MỤC MÃ LỖI HỆ THỐNG

Mọi Exception ném ra từ Backend đều phải kèm theo `errorCode` chuẩn hóa dưới đây để Frontend hiển thị Toast thông báo chính xác bằng tiếng Việt:

## 1. Authentication & RBAC (`AUTH_xxx`)
- `AUTH_001` (401): Email hoặc mật khẩu không chính xác.
- `AUTH_002` (401): Access Token hết hạn hoặc không hợp lệ.
- `AUTH_003` (403): Tài khoản không có quyền thực hiện hành động này (Sai Role).
- `AUTH_004` (409): Email đã tồn tại trên hệ thống.

## 2. Bot & Storage (`BOT_xxx`)
- `BOT_001` (404): Không tìm thấy Bot EA yêu cầu.
- `BOT_002` (400): Định dạng file không hợp lệ (Chỉ chấp nhận `.ex4` hoặc `.ex5`).
- `BOT_003` (403): Bot chưa được Admin phê duyệt nên không thể giao dịch.
- `BOT_004` (403): Bạn không phải là tác giả của Bot này.

## 3. Order & Payment (`ORD_xxx`)
- `ORD_001` (400): Bạn đã sở hữu bản quyền Bot này rồi.
- `ORD_002` (403): Bạn chưa mua Bot này nên không thể tải file gốc.
- `ORD_003` (400): Giao dịch thanh toán thất bại hoặc bị hủy.

## 4. License Verification (`LIC_xxx`)
- `LIC_001` (404): Mã License Key không tồn tại.
- `LIC_002` (403): License Key đã bị khóa cứng cho một số tài khoản MT4/MT5 khác.
- `LIC_003` (403): License Key đã hết hạn sử dụng hoặc bị khóa bởi Admin.
- `LIC_004` (400): Đã vượt quá số lần Reset tài khoản cho phép trong tháng.