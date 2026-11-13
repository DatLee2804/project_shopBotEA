# 01_API_CONTRACT.md - ĐẶC TẢ API (RESTful)

**Base URL:** `/api/v1`  
**Response Wrapper Chuẩn:**
```json
// Thành công
{ "success": true, "data": { ... }, "meta": { "page": 1, "limit": 12, "total": 100 } }
// Thất bại
{ "success": false, "errorCode": "LIC_002", "message": "License Key đã gắn với tài khoản khác" }

1. Auth Module (/auth)
POST /auth/register: Đăng ký tài khoản (email, password, fullName, role?: 'BUYER' | 'SELLER').

POST /auth/login: Đăng nhập -> Trả về { accessToken, refreshToken, user }.

POST /auth/refresh: Cấp lại accessToken từ refreshToken.

GET /auth/me: Lấy thông tin user hiện tại (Yêu cầu Bearer Token).

2. Bots Marketplace Module (/bots)
GET /bots: Danh sách Bot đã duyệt (status = APPROVED). Query: ?search=&platform=MT4|MT5|BOTH&minWinRate=&maxDrawdown=&sort=newest|price_asc|popular&page=1&limit=12.

GET /bots/:slug: Chi tiết 1 Bot kèm thống kê backtest & danh sách reviews.

POST /bots [Role: SELLER]: Tạo Bot mới (trạng thái mặc định PENDING).

POST /bots/:id/upload [Role: SELLER]: Upload file .ex4/.ex5 (bản chính & bản demo) lên S3 Private Bucket -> Lưu fileKey.

PATCH /bots/:id/status [Role: ADMIN]: Duyệt hoặc từ chối Bot (status: 'APPROVED' | 'REJECTED').

3. Orders & Payments Module (/orders)
POST /orders/checkout [Role: BUYER, SELLER]: Tạo đơn hàng mua Bot (botId, paymentMethod: 'STRIPE' | 'VIETQR').

POST /orders/webhook: Nhận callback thanh toán thành công -> Tự động chuyển trạng thái Order sang COMPLETED, cộng tiền vào balance của Seller (trừ 15% phí sàn) và sinh bản ghi License.

GET /orders/my-purchases [Authenticated]: Danh sách Bot đã mua kèm nút tải file & License Key.

GET /orders/:botId/download [Authenticated]: Kiểm tra user đã mua Bot chưa -> Trả về { downloadUrl } (S3 Presigned URL sống 60 giây).

4. License Verification Module (/licenses) - Dành cho MT4/MT5
GET /licenses/my-licenses [Authenticated]: Xem danh sách key sở hữu và số tài khoản MT4/MT5 đang kích hoạt.

PATCH /licenses/:id/reset-account [Authenticated]: Gỡ liên kết mtAccountNo để chuyển Bot sang VPS/tài khoản khác (giới hạn tối đa 2 lần/tháng).

POST /licenses/verify [Public - gọi từ code MQL4/MQL5]:

Body: { "licenseKey": "EA-XXXX-XXXX", "accountNumber": "21008899", "botId": "uuid" }

Logic: Kiểm tra tồn tại, isActive, expiresAt. Nếu mtAccountNo null -> gán accountNumber. Nếu đã có -> so sánh trùng khớp. Trả về { valid: true }.

