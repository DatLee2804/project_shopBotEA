---

### File: `docs/08_LOCAL_MIGRATION_SEED.md`
```markdown
# 08_LOCAL_MIGRATION_SEED.md - KHỞI TẠO DATABASE & DỮ LIỆU MẪU

## 1. Quy trình chạy Migration
Khi khởi tạo dự án ở môi trường Local, AI Agent chạy tuần tự:
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init_ea_marketplace
npx prisma db seed

2. Yêu cầu file backend/prisma/seed.ts
Tự động tạo dữ liệu mẫu sẵn sàng để test ngay lập tức (mật khẩu chung cho tất cả tài khoản test là Password@123 được hash bằng bcrypt):

1 Tài khoản Admin: admin@oceanea.com (Role.ADMIN).

2 Tài khoản Seller: quantlab@oceanea.com và algotrader@oceanea.com (Role.SELLER).

1 Tài khoản Buyer: trader@oceanea.com (Role.BUYER).

6 Bot EA mẫu đã duyệt (status: APPROVED) với đầy đủ chỉ số hấp dẫn:

OceanGold Scalper Pro XAUUSD ($149, MT5, WinRate: 78.5%, Drawdown: 11.2%)

SkyTrend Grid Master EURUSD ($99, BOTH, WinRate: 82.0%, Drawdown: 14.8%)

BlueWave News Filter EA ($0 - Free, MT4, WinRate: 68.4%, Drawdown: 8.5%)

DeepSea Swing GBPJPY ($199, MT5, WinRate: 74.2%, Drawdown: 9.4%)

Marine PropFirm Challenge Passer ($249, BOTH, WinRate: 81.0%, Drawdown: 4.5%)

Coral Reef Hedging System ($120, MT4, WinRate: 76.5%, Drawdown: 12.0%)

1 Đơn hàng & 1 License Key mẫu gắn sẵn cho tài khoản trader@oceanea.com với mã EA-DEMO-2026-8888.