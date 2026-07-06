import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_BASE_URL } from './constants';
import type {
  AuthResponse,
  AuthCredentials,
  RegisterPayload,
  User,
  Asset,
  OHLCV,
  OrderBook,
  Wallet,
  Transaction,
  Order,
  StakingPlan,
  StakingPosition,
  SupportTicket,
  ChatMessage,
  FundAdjustment,
  PlatformSettings,
  WalletConfig,
} from '@/types';

// ─── Axios Instance ───────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // Generous timeout: free-tier backends cold-start and can take 30-60s on first request
  timeout: 75000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('auth-storage');
      if (raw) {
        try {
          const state = JSON.parse(raw);
          const token = state?.state?.token;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch {
          // ignore
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (credentials: AuthCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', payload).then((r) => r.data),

  logout: () => api.post('/auth/logout').then((r) => r.data),

  refreshToken: (refreshToken: string) =>
    api
      .post<{ accessToken: string }>('/auth/refresh', { refreshToken })
      .then((r) => r.data),

  getMe: () => api.get<User>('/auth/me').then((r) => r.data),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const userApi = {
  getProfile: () => api.get<User>('/users/me').then((r) => r.data),

  updateProfile: (data: Partial<User>) =>
    api.patch<User>('/users/me', data).then((r) => r.data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/users/me/change-password', data).then((r) => r.data),

  getLoginSessions: () =>
    api.get('/users/me/sessions').then((r) => r.data),

  revokeSession: (sessionId: string) =>
    api.delete(`/users/me/sessions/${sessionId}`).then((r) => r.data),

  setup2FA: () =>
    api.post<{ qrCode: string; secret: string }>('/users/me/2fa/setup').then((r) => r.data),

  enable2FA: (code: string) =>
    api.post('/users/me/2fa/enable', { code }).then((r) => r.data),

  disable2FA: (code: string) =>
    api.post('/users/me/2fa/disable', { code }).then((r) => r.data),

  setAntiPhishingCode: (code: string) =>
    api.post('/users/me/anti-phishing', { code }).then((r) => r.data),
};

// ─── Market ───────────────────────────────────────────────────────────────────

export const marketApi = {
  getAssets: (type?: string) =>
    api.get<Asset[]>('/market/assets', { params: { type } }).then((r) => r.data),

  getAsset: (symbol: string) =>
    api.get<Asset>(`/market/assets/${symbol}`).then((r) => r.data),

  getOHLCV: (symbol: string, timeframe: string, limit: number = 200) =>
    api
      .get<OHLCV[]>(`/market/ohlcv/${symbol}`, { params: { timeframe, limit } })
      .then((r) => r.data),

  getOrderBook: (symbol: string) =>
    api.get<OrderBook>(`/market/orderbook/${symbol}`).then((r) => r.data),

  search: (query: string) =>
    api.get<Asset[]>('/market/search', { params: { q: query } }).then((r) => r.data),
};

// ─── Wallet ───────────────────────────────────────────────────────────────────

export const walletApi = {
  getWallet: () => api.get<Wallet>('/wallet').then((r) => r.data),

  getTransactions: (params?: { page?: number; limit?: number; type?: string }) =>
    api.get<{ data: Transaction[]; total: number }>('/wallet/transactions', { params }).then((r) => r.data),

  getDepositAddress: (asset: string, network: string) =>
    api
      .get<{ address: string; qrCode: string; minDeposit: number }>('/wallet/deposit-address', {
        params: { asset, network },
      })
      .then((r) => r.data),

  withdraw: (data: {
    asset: string;
    network: string;
    address: string;
    amount: number;
    twoFactorCode?: string;
  }) => api.post('/wallet/withdraw', data).then((r) => r.data),

  transfer: (data: { fromAsset: string; toAsset: string; amount: number }) =>
    api.post('/wallet/transfer', data).then((r) => r.data),
};

// ─── Trading ──────────────────────────────────────────────────────────────────

export const tradingApi = {
  createOrder: (data: {
    symbol: string;
    side: string;
    type: string;
    amount: number;
    price?: number;
    stopPrice?: number;
  }) => api.post<Order>('/trading/orders', data).then((r) => r.data),

  cancelOrder: (orderId: string) =>
    api.delete(`/trading/orders/${orderId}`).then((r) => r.data),

  getOpenOrders: (symbol?: string) =>
    api.get<Order[]>('/trading/orders/open', { params: { symbol } }).then((r) => r.data),

  getOrderHistory: (params?: { symbol?: string; page?: number; limit?: number }) =>
    api
      .get<{ data: Order[]; total: number }>('/trading/orders/history', { params })
      .then((r) => r.data),

  getOrder: (orderId: string) =>
    api.get<Order>(`/trading/orders/${orderId}`).then((r) => r.data),
};

// ─── Earn ─────────────────────────────────────────────────────────────────────

export const earnApi = {
  getPlans: () => api.get<StakingPlan[]>('/earn/plans').then((r) => r.data),

  getPlan: (planId: string) =>
    api.get<StakingPlan>(`/earn/plans/${planId}`).then((r) => r.data),

  stake: (planId: string, amount: number) =>
    api.post<StakingPosition>('/earn/stake', { planId, amount }).then((r) => r.data),

  unstake: (positionId: string) =>
    api.post(`/earn/unstake/${positionId}`).then((r) => r.data),

  getPositions: () =>
    api.get<StakingPosition[]>('/earn/positions').then((r) => r.data),

  getEarningHistory: () =>
    api.get<Transaction[]>('/earn/history').then((r) => r.data),
};

// ─── KYC ─────────────────────────────────────────────────────────────────────

export const kycApi = {
  getStatus: () =>
    api.get('/kyc/status').then((r) => r.data),

  submitDocuments: (formData: FormData) =>
    api
      .post('/kyc/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),
};

// ─── Support ──────────────────────────────────────────────────────────────────

export const supportApi = {
  getTickets: () => api.get<SupportTicket[]>('/support/tickets').then((r) => r.data),

  createTicket: (data: { subject: string; category: string; message: string }) =>
    api.post<SupportTicket>('/support/tickets', data).then((r) => r.data),

  getTicket: (ticketId: string) =>
    api.get<SupportTicket>(`/support/tickets/${ticketId}`).then((r) => r.data),

  getMessages: (ticketId: string) =>
    api.get<ChatMessage[]>(`/support/tickets/${ticketId}/messages`).then((r) => r.data),

  sendMessage: (ticketId: string, content: string, fileUrl?: string) =>
    api
      .post<ChatMessage>(`/support/tickets/${ticketId}/messages`, { content, fileUrl })
      .then((r) => r.data),

  closeTicket: (ticketId: string) =>
    api.post(`/support/tickets/${ticketId}/close`).then((r) => r.data),
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminApi = {
  // Users
  getUsers: (params?: { page?: number; limit?: number; search?: string; kycStatus?: string }) =>
    api.get('/admin/users', { params }).then((r) => r.data),

  getUser: (userId: string) =>
    api.get(`/admin/users/${userId}`).then((r) => r.data),

  updateUser: (userId: string, data: Partial<User>) =>
    api.patch(`/admin/users/${userId}`, data).then((r) => r.data),

  holdUser: (userId: string) =>
    api.post(`/admin/users/${userId}/hold`).then((r) => r.data),

  unholdUser: (userId: string) =>
    api.post(`/admin/users/${userId}/unhold`).then((r) => r.data),

  adjustFunds: (data: FundAdjustment) =>
    api.post('/admin/users/adjust-funds', data).then((r) => r.data),

  // Transactions
  getAllTransactions: (params?: Record<string, unknown>) =>
    api.get('/admin/transactions', { params }).then((r) => r.data),

  // KYC
  getPendingKYC: () =>
    api.get('/admin/kyc/pending').then((r) => r.data),

  reviewKYC: (userId: string, data: { status: string; note?: string }) =>
    api.post(`/admin/kyc/${userId}/review`, data).then((r) => r.data),

  // Wallet configs
  getWalletConfigs: () =>
    api.get<WalletConfig[]>('/admin/wallet-configs').then((r) => r.data),

  upsertWalletConfig: (data: Partial<WalletConfig>) =>
    api.post('/admin/wallet-configs', data).then((r) => r.data),

  // Platform settings
  getSettings: () =>
    api.get<PlatformSettings>('/admin/settings').then((r) => r.data),

  updateSettings: (data: Partial<PlatformSettings>) =>
    api.patch('/admin/settings', data).then((r) => r.data),

  // Stats
  getDashboardStats: () =>
    api.get('/admin/stats').then((r) => r.data),

  // Support
  getAllTickets: (params?: Record<string, unknown>) =>
    api.get('/admin/support/tickets', { params }).then((r) => r.data),

  takeOverTicket: (ticketId: string) =>
    api.post(`/admin/support/tickets/${ticketId}/takeover`).then((r) => r.data),

  // Logs
  getAuditLogs: (params?: Record<string, unknown>) =>
    api.get('/admin/logs', { params }).then((r) => r.data),
};

export default api;
