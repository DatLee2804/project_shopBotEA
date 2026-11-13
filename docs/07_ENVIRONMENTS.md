# 07_ENVIRONMENTS.md - CẤU HÌNH BIẾN MÔI TRƯỜNG

AI Agent phải tạo đầy đủ 2 file `.env.example` cho Backend và Frontend với các biến sau:

## 1. Backend (`backend/.env.example`)
```env
# App
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ea_marketplace?schema=public"

# JWT Secrets
JWT_ACCESS_SECRET="super-secret-access-key-change-in-prod"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="super-secret-refresh-key-change-in-prod"
JWT_REFRESH_EXPIRES_IN="7d"

# S3 / Cloudflare R2 Storage (Lưu file .ex4 / .ex5)
S3_ENDPOINT="https://<account_id>.r2.cloudflarestorage.com"
S3_REGION="auto"
S3_BUCKET_NAME="ea-marketplace-files"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"

# Payment (Stripe / Webhook)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

2. Frontend (frontend/.env.example)

NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_APP_NAME="OceanEA Market"