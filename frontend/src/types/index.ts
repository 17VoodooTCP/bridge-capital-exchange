// ─── User & Auth ────────────────────────────────────────────────────────────

export type UserRole = 'USER' | 'ADMIN' | 'SUPPORT';

export type KYCStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  kycStatus: KYCStatus;
  isHeld: boolean;
  antiPhishingCode?: string;
  twoFactorEnabled: boolean;
  country?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  country: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginSession {
  id: string;
  ipAddress: string;
  country: string;
  deviceType: string;
  carrier?: string;
  createdAt: string;
  isActive: boolean;
  isCurrent: boolean;
}

// ─── Assets & Market ────────────────────────────────────────────────────────

export type AssetType = 'CRYPTO' | 'STOCK' | 'ETF';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  icon: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  circulatingSupply?: number;
  sparkline?: number[];
  decimals: number;
  network?: string;
  rank?: number;
}

export interface OHLCV {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBook {
  bids: [number, number][];
  asks: [number, number][];
  spread: number;
  spreadPercent: number;
}

export interface MarketData {
  totalMarketCap: number;
  total24hVolume: number;
  btcDominance: number;
  ethDominance: number;
  marketCapChange24h: number;
  activeCryptocurrencies: number;
  defiVolume: number;
}

export interface Signal {
  id: string;
  asset: string;
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  targetPrice: number;
  stopLoss: number;
  timeframe: string;
  analysis: string;
  createdAt: string;
}

// ─── Wallet & Balances ───────────────────────────────────────────────────────

export interface Balance {
  asset: string;
  symbol: string;
  name: string;
  icon: string;
  available: number;
  locked: number;
  total: number;
  usdValue: number;
  price: number;
}

export interface Wallet {
  totalUsdValue: number;
  balances: Balance[];
}

export interface WalletConfig {
  id: string;
  asset: string;
  network: string;
  address: string;
  qrCodeUrl?: string;
  minDeposit: number;
  maxWithdrawal: number;
  isActive: boolean;
  confirmations: number;
}

// ─── Transactions ────────────────────────────────────────────────────────────

export type TransactionType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'BUY'
  | 'SELL'
  | 'TRANSFER'
  | 'STAKE'
  | 'UNSTAKE'
  | 'REWARD'
  | 'FEE';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  asset: string;
  symbol: string;
  amount: number;
  fee: number;
  status: TransactionStatus;
  txHash?: string;
  fromAddress?: string;
  toAddress?: string;
  network?: string;
  note?: string;
  createdAt: string;
  completedAt?: string;
  usdValue: number;
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP_LIMIT' | 'STOP_MARKET';
export type OrderStatus = 'OPEN' | 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELLED' | 'REJECTED';

export interface Order {
  id: string;
  userId: string;
  symbol: string;
  assetName: string;
  side: OrderSide;
  type: OrderType;
  amount: number;
  price: number;
  filledAmount: number;
  averagePrice: number;
  total: number;
  fee: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Earn / Staking ──────────────────────────────────────────────────────────

export interface StakingPlan {
  id: string;
  asset: string;
  symbol: string;
  name: string;
  icon: string;
  apr: number;
  duration: number;
  isFlexible: boolean;
  minAmount: number;
  maxAmount?: number;
  totalStaked: number;
  availableQuota: number;
  description: string;
}

export interface StakingPosition {
  id: string;
  userId: string;
  plan: StakingPlan;
  amount: number;
  earned: number;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  nextRewardDate?: string;
}

// ─── KYC ─────────────────────────────────────────────────────────────────────

export type KYCDocumentType = 'PASSPORT' | 'NATIONAL_ID' | 'DRIVERS_LICENSE' | 'PROOF_OF_ADDRESS';

export interface KYCDocument {
  id: string;
  userId: string;
  type: KYCDocumentType;
  fileUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  uploadedAt: string;
}

export interface KYCSubmission {
  documents: {
    type: KYCDocumentType;
    fileUrl: string;
  }[];
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country: string;
  address: string;
}

// ─── Support ──────────────────────────────────────────────────────────────────

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ChatMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: 'USER' | 'SUPPORT' | 'ADMIN' | 'BOT';
  content: string;
  fileUrl?: string;
  createdAt: string;
  isRead: boolean;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetId?: string;
  targetType?: string;
  details: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
}

export interface FundAdjustment {
  userId: string;
  asset: string;
  amount: number;
  type: 'ADD' | 'DEDUCT';
  reason: string;
  note?: string;
}

export interface PlatformSettings {
  maintenanceMode: boolean;
  depositEnabled: boolean;
  withdrawalEnabled: boolean;
  tradingEnabled: boolean;
  stakingEnabled: boolean;
  announcementBanner: string | null;
  tradingFeePercent: number;
  withdrawalFeePercent: number;
  minWithdrawal: number;
  maxDailyWithdrawal: number;
  kycRequired: boolean;
}

// ─── UI ───────────────────────────────────────────────────────────────────────

export type Theme = 'dark' | 'light';

export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1H' | '4H' | '1D' | '1W' | '1M';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  imageUrl: string;
  category: 'CRYPTO' | 'STOCKS' | 'ETF' | 'MACRO' | 'ANALYSIS';
  publishedAt: string;
  readTime: number;
}

export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface PortfolioEntry {
  asset: string;
  symbol: string;
  name: string;
  icon: string;
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  allocation: number;
}
