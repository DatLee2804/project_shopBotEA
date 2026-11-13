### File: `docs/03_AUTH_FLOW.md`
```markdown
# 03_AUTH_FLOW.md - LUỒNG XÁC THỰC & PHÂN QUYỀN (RBAC)

## 1. Cơ chế JWT (Dual Token)
- **Access Token:** Thời hạn `15m`, chứa payload `{ sub: user.id, email: user.email, role: user.role }`. Gửi qua Header `Authorization: Bearer <token>`.
- **Refresh Token:** Thời hạn `7d`, được hash bằng `bcrypt` và lưu trong cột `User.refreshToken` dưới Database. Dùng để cấp mới cặp token khi Access Token hết hạn.

## 2. Ma trận Phân quyền RBAC
| Chức năng / Endpoint | Guest | BUYER | SELLER | ADMIN |
| :--- | :---: | :---: | :---: | :---: |
| Xem danh sách & chi tiết Bot (`APPROVED`) | ✅ | ✅ | ✅ | ✅ |
| Tải file Demo (`.ex4`/`.ex5`) | ❌ | ✅ | ✅ | ✅ |
| Mua Bot & Nhận License Key | ❌ | ✅ | ✅ | ✅ |
| Tải file gốc (`.ex4`/`.ex5`) đã mua | ❌ | ✅ (Owner) | ✅ (Owner) | ✅ |
| Đăng bán Bot mới & Upload file lên S3 | ❌ | ❌ | ✅ | ✅ |
| Chỉnh sửa / Cập nhật phiên bản Bot | ❌ | ❌ | ✅ (Author) | ✅ |
| Duyệt Bot (`PENDING` -> `APPROVED`) | ❌ | ❌ | ❌ | ✅ |
| Khóa License Key vi phạm | ❌ | ❌ | ❌ | ✅ |

## 3. Quy tắc triển khai Guard trong NestJS
- Sử dụng Global `JwtAuthGuard` kết hợp decorator `@Public()` cho các route không cần đăng nhập (như `GET /bots`, `POST /licenses/verify`).
- Sử dụng `RolesGuard` kết hợp decorator `@Roles(Role.SELLER, Role.ADMIN)` để chặn truy cập trái phép.
- Kiểm tra **Ownership (Quyền sở hữu)**: Khi `SELLER` sửa Bot hoặc `BUYER` tải file/reset License, Service bắt buộc phải kiểm tra `resource.userId === currentUser.id`.