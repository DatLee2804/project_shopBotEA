---

### File: `docs/09_CODE_STANDARDS.md`
```markdown
# 09_CODE_STANDARDS.md - QUY CHUẨN VIẾT CODE

1. **TypeScript Strict Mode:** Bật `"strict": true` ở cả Backend và Frontend. Tuyệt đối không dùng kiểu `any` (thay bằng `unknown` hoặc định nghĩa Interface/DTO rõ ràng).
2. **Naming Conventions:**
   - File & Thư mục Backend: `kebab-case` (VD: `licenses.controller.ts`, `create-bot.dto.ts`).
   - Component React Frontend: `PascalCase` (VD: `BotCard.tsx`, `LicenseTable.tsx`).
   - Biến & Hàm: `camelCase`. Constants & Enum: `UPPER_SNAKE_CASE`.
3. **Xử lý tiền tệ:** Dùng kiểu `Decimal` của Prisma ở Backend; ở Frontend luôn format qua `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`.
4. **Server vs Client Components (Next.js):**
   - Ưu tiên Server Components cho các trang danh sách Bot (`app/page.tsx`) và chi tiết Bot (`app/bots/[slug]/page.tsx`) để tối ưu SEO.
   - Chỉ thêm `'use client'` ở các component có tương tác trạng thái (Form, Modal thanh toán, nút Copy License Key, bộ lọc động).