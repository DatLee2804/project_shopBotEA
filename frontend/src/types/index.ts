export type Role = 'BUYER' | 'SELLER' | 'ADMIN';
export type Platform = 'MT4' | 'MT5' | 'BOTH';
export type ProductType = 'BOT_EA' | 'INDICATOR';
export type IndicatorCategory =
  | 'SMC_ICT'
  | 'TREND_SIGNAL'
  | 'VOLUME_FLOW'
  | 'OSCILLATOR'
  | 'MULTI_TIMEFRAME';
export type BotStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type IndicatorStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type OrderStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  balance: number | string;
  createdAt: string;
  updatedAt: string;
}

export interface Bot {
  id: string;
  title: string;
  slug: string;
  shortDesc: string;
  description: string;
  price: number | string;
  platform: Platform;
  version: string;
  fileKey: string;
  demoFileKey?: string | null;
  thumbnailUrl?: string | null;
  winRate: number;
  maxDrawdown: number;
  profitFactor: number;
  status: BotStatus;
  sellerId: string;
  seller?: {
    id: string;
    fullName: string;
    email: string;
  };
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Indicator {
  id: string;
  title: string;
  slug: string;
  shortDesc: string;
  description: string;
  price: number | string;
  platform: Platform;
  version: string;
  fileKey: string;
  demoFileKey?: string | null;
  thumbnailUrl?: string | null;
  category: IndicatorCategory;
  accuracyRate: number;
  isNonRepaint: boolean;
  hasAlert: boolean;
  timeframes: string;
  status: IndicatorStatus;
  sellerId: string;
  seller?: {
    id: string;
    fullName: string;
    email: string;
  };
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  productType: ProductType;
  botId?: string | null;
  indicatorId?: string | null;
  amount: number | string;
  status: OrderStatus;
  paymentMethod: string;
  transactionId?: string | null;
  createdAt: string;
  bot?: Bot;
  indicator?: Indicator;
}

export interface License {
  id: string;
  licenseKey: string;
  userId: string;
  productType?: ProductType;
  botId?: string | null;
  indicatorId?: string | null;
  mtAccountNo?: string | null;
  resetCount: number;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  bot?: Bot;
  indicator?: Indicator;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  productType?: ProductType;
  botId?: string | null;
  indicatorId?: string | null;
  user?: {
    id: string;
    fullName: string;
  };
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
  message?: string;
  errorCode?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}
