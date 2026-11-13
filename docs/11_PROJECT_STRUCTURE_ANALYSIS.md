# 11_PROJECT_STRUCTURE_ANALYSIS.md - CÂY THƯ MỤC CHUẨN CỦA DỰ ÁN

AI Agent phải tạo đúng cấu trúc thư mục dưới đây, không tự ý phát sinh thư mục rác ngoài kiến trúc:

```text
ea-marketplace/
├── docs/                                # 12 file tài liệu quy chuẩn hệ thống (00 -> 11)
├── backend/                             # NestJS Application
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   │   ├── current-user.decorator.ts
│   │   │   │   ├── public.decorator.ts
│   │   │   │   └── roles.decorator.ts
│   │   │   ├── filters/
│   │   │   │   └── http-exception.filter.ts
│   │   │   └── guards/
│   │   │       ├── jwt-auth.guard.ts
│   │   │       └── roles.guard.ts
│   │   ├── modules/
│   │   │   ├── auth/                    # Login, Register, Refresh Token
│   │   │   ├── users/                   # Profile, Become Seller
│   │   │   ├── bots/                    # Marketplace CRUD, Search, Admin Approval
│   │   │   ├── storage/                 # S3/R2 Upload & Presigned Download URL
│   │   │   ├── orders/                  # Checkout, Webhook, Purchase History
│   │   │   └── licenses/                # License Generation, Reset & MT4/MT5 Verify API
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                            # Next.js 14+ App Router
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/
    │   │   │   ├── login/page.tsx
    │   │   │   └── register/page.tsx
    │   │   ├── bots/
    │   │   │   └── [slug]/page.tsx      # Chi tiết Bot + Backtest Metrics + Checkout
    │   │   ├── dashboard/
    │   │   │   ├── layout.tsx           # Sidebar điều hướng theo Role (Buyer/Seller/Admin)
    │   │   │   ├── licenses/page.tsx    # Quản lý License Key & Tải file .ex4/.ex5
    │   │   │   ├── seller/page.tsx      # Đăng Bot mới & Theo dõi doanh thu
    │   │   │   └── admin/page.tsx       # Duyệt Bot PENDING
    │   │   ├── globals.css
    │   │   ├── layout.tsx               # RootLayout (Navbar, Footer, QueryProvider)
    │   │   └── page.tsx                 # Trang chủ Chợ Bot EA
    │   ├── components/
    │   │   ├── ui/                      # Button, Badge, Modal, Toast
    │   │   ├── BotCard.tsx              # Thẻ Bot chuẩn màu Ocean/Sky Blue
    │   │   ├── FilterBar.tsx            # Bộ lọc MT4/MT5, Winrate, Giá
    │   │   └── Navbar.tsx
    │   ├── lib/
    │   │   ├── api-client.ts            # Axios/Fetch wrapper tự động gắn Token & Refresh
    │   │   └── utils.ts                 # Format tiền tệ, ngày tháng
    │   ├── store/
    │   │   └── useAuthStore.ts          # Zustand lưu trạng thái đăng nhập & Role
    │   └── types/
    │       └── index.ts                 # Interface đồng bộ với API Contract
    ├── .env.example
    ├── next.config.mjs
    ├── tailwind.config.ts               # Cấu hình màu Ocean Blue & Sky Blue
    ├── package.json
    └── tsconfig.json