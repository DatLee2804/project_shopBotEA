### File: `docs/02_DATA_MODELS.md`
```markdown
# 02_DATA_MODELS.md - THIẾT KẾ CƠ SỞ DỮ LIỆU (PRISMA SCHEMA)

AI Agent phải sử dụng chính xác schema dưới đây cho file `backend/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  BUYER
  SELLER
  ADMIN
}

enum Platform {
  MT4
  MT5
  BOTH
}

enum BotStatus {
  PENDING
  APPROVED
  REJECTED
}

enum OrderStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

model User {
  id           String    @id @default(uuid())
  email        String    @unique
  password     String
  fullName     String
  role         Role      @default(BUYER)
  balance      Decimal   @default(0.0) @db.Decimal(12, 2)
  refreshToken String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  bots         Bot[]
  orders       Order[]
  licenses     License[]
  reviews      Review[]
}

model Bot {
  id           String    @id @default(uuid())
  title        String
  slug         String    @unique
  shortDesc    String    @db.VarChar(255)
  description  String    @db.Text
  price        Decimal   @db.Decimal(10, 2)
  platform     Platform  @default(MT5)
  version      String    @default("1.0.0")
  fileKey      String    // S3 Key bản chính (.ex4 / .ex5)
  demoFileKey  String?   // S3 Key bản Demo
  thumbnailUrl String?
  winRate      Float     @default(0)
  maxDrawdown  Float     @default(0)
  profitFactor Float     @default(0)
  status       BotStatus @default(PENDING)

  sellerId     String
  seller       User      @relation(fields: [sellerId], references: [id])

  orders       Order[]
  licenses     License[]
  reviews      Review[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([status, platform])
  @@index([sellerId])
}

model Order {
  id            String      @id @default(uuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  botId         String
  bot           Bot         @relation(fields: [botId], references: [id])
  amount        Decimal     @db.Decimal(10, 2)
  status        OrderStatus @default(PENDING)
  paymentMethod String
  transactionId String?     @unique
  createdAt     DateTime    @default(now())
}

model License {
  id            String    @id @default(uuid())
  licenseKey    String    @unique // Format: EA-XXXX-XXXX-XXXX
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  botId         String
  bot           Bot       @relation(fields: [botId], references: [id])
  mtAccountNo   String?   // Khóa cứng theo Account ID trên MT4/MT5
  resetCount    Int       @default(0)
  isActive      Boolean   @default(true)
  expiresAt     DateTime? // Null = Lifetime
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([licenseKey])
}

model Review {
  id        String   @id @default(uuid())
  rating    Int      // 1-5
  comment   String   @db.Text
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  botId     String
  bot       Bot      @relation(fields: [botId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, botId]) // Mỗi người chỉ được review 1 lần cho 1 Bot
}