# OceanEA Official Store — Bot EA & Indicator Marketplace

Hệ thống cửa hàng trực tuyến chính thức chuyên bán và cho thuê **Bot EA (Expert Advisors)** và **Custom Indicators** cho nền tảng MetaTrader 4 (MT4) / MetaTrader 5 (MT5), tích hợp quản lý và xác thực License Key tự động.

## Cấu trúc dự án

- `backend/` — NestJS 12 + Prisma ORM + PostgreSQL + JWT Auth + License Key Verification API
- `frontend/` — Next.js 14 (App Router) + TypeScript + TailwindCSS + TanStack Query
- `docs/` — Tài liệu thiết kế kiến trúc, API, Database Schema và hướng dẫn triển khai

## Khởi chạy môi trường Local

### 1. Backend (`http://localhost:4000`)

```bash
cd backend
cp .env.example .env
# Cập nhật thông tin kết nối PostgreSQL trong file .env
npm install
npm run db:migrate
npm run db:seed
npm run start:dev
```

### 2. Frontend (`http://localhost:3000`)

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## Tài khoản Demo (sau khi chạy `db:seed`)

- **Admin:** `admin@oceanea.com` / `Password@123`
- **Trader (Khách hàng):** `trader@oceanea.com` / `Password@123`
