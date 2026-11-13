import axios from 'axios';
import {
  ApiResponse,
  AuthTokens,
  Bot,
  Indicator,
  IndicatorCategory,
  License,
  Order,
  ProductType,
  User,
} from '@/types';
import { useAuthStore } from '@/store/useAuthStore';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config) => {
    let token = useAuthStore.getState().accessToken;
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('oceanea_access_token');
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle Token Refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken =
        useAuthStore.getState().refreshToken ||
        (typeof window !== 'undefined' ? localStorage.getItem('oceanea_refresh_token') : null);

      if (!refreshToken) {
        useAuthStore.getState().logout();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<ApiResponse<AuthTokens>>(
          `${BASE_URL}/auth/refresh`,
          { refreshToken },
        );

        if (data.success && data.data.accessToken) {
          useAuthStore.getState().setTokens(data.data.accessToken, data.data.refreshToken);
          apiClient.defaults.headers.common.Authorization = `Bearer ${data.data.accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
          processQueue(null, data.data.accessToken);
          return apiClient(originalRequest);
        } else {
          useAuthStore.getState().logout();
          processQueue(error, null);
          return Promise.reject(error);
        }
      } catch (refreshErr) {
        useAuthStore.getState().logout();
        processQueue(refreshErr, null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export const authApi = {
  register: (body: { email: string; password: string; fullName: string; role?: string }) =>
    apiClient.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>('/auth/register', body),

  login: (body: { email: string; password: string }) =>
    apiClient.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>('/auth/login', body),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken }),

  getMe: () =>
    apiClient.get<ApiResponse<User>>('/auth/me'),
};

export const botsApi = {
  getBots: (params?: {
    search?: string;
    platform?: string;
    minWinRate?: number;
    maxDrawdown?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }) => apiClient.get<ApiResponse<Bot[]>>('/bots', { params }),

  getBotBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Bot>>(`/bots/${slug}`),

  createBot: (data: Partial<Bot>) =>
    apiClient.post<ApiResponse<Bot>>('/bots', data),

  uploadBotFile: (id: string, formData: FormData) =>
    apiClient.post<ApiResponse<{ fileKey: string; demoFileKey?: string }>>(`/bots/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateStatus: (id: string, status: 'APPROVED' | 'REJECTED') =>
    apiClient.patch<ApiResponse<Bot>>(`/bots/${id}/status`, { status }),
};

export const indicatorsApi = {
  getIndicators: (params?: {
    search?: string;
    platform?: string;
    category?: IndicatorCategory | string;
    minAccuracy?: number;
    nonRepaint?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) => apiClient.get<ApiResponse<Indicator[]>>('/indicators', { params }),

  getIndicatorBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Indicator>>(`/indicators/${slug}`),

  createIndicator: (data: Partial<Indicator>) =>
    apiClient.post<ApiResponse<Indicator>>('/indicators', data),

  uploadIndicatorFile: (id: string, formData: FormData) =>
    apiClient.post<ApiResponse<{ fileKey: string; demoFileKey?: string }>>(`/indicators/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateStatus: (id: string, status: 'APPROVED' | 'REJECTED') =>
    apiClient.patch<ApiResponse<Indicator>>(`/indicators/${id}/status`, { status }),
};

export const ordersApi = {
  checkout: (body: {
    productType?: ProductType;
    botId?: string;
    indicatorId?: string;
    paymentMethod: 'STRIPE' | 'VIETQR' | 'BANK_TRANSFER';
  }) => apiClient.post<ApiResponse<{ order: Order; license?: License }>>('/orders/checkout', body),

  getMyPurchases: () =>
    apiClient.get<ApiResponse<Order[]>>('/orders/my-purchases'),

  getDownloadUrl: (productId: string) =>
    apiClient.get<ApiResponse<{ downloadUrl: string }>>(`/orders/${productId}/download`),
};

export const licensesApi = {
  getMyLicenses: () =>
    apiClient.get<ApiResponse<License[]>>('/licenses/my-licenses'),

  resetAccount: (id: string) =>
    apiClient.patch<ApiResponse<License>>(`/licenses/${id}/reset-account`),

  verify: (body: { licenseKey: string; accountNumber: string; botId?: string; indicatorId?: string }) =>
    apiClient.post<ApiResponse<{ valid: boolean }>>('/licenses/verify', body),
};
