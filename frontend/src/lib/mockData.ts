import type {
  Asset,
  Transaction,
  StakingPlan,
  StakingPosition,
  ChatMessage,
  Signal,
  NewsArticle,
  MarketIndex,
  PortfolioEntry,
  SupportTicket,
  LoginSession,
  OHLCV,
  OrderBook,
  MarketData,
} from '@/types';

// ─── Candle Data Generator ────────────────────────────────────────────────────

export function generateCandleData(
  basePrice: number,
  count: number = 200,
  volatility: number = 0.02
): OHLCV[] {
  const candles: OHLCV[] = [];
  let price = basePrice;
  const now = Math.floor(Date.now() / 1000);
  const interval = 3600; // 1 hour

  for (let i = count; i >= 0; i--) {
    const change = (Math.random() - 0.48) * volatility * price;
    const open = price;
    price = Math.max(price + change, price * 0.5);
    const close = price;
    const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
    const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
    const volume = basePrice * (Math.random() * 1000 + 200);

    candles.push({
      time: now - i * interval,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: parseFloat(volume.toFixed(2)),
    });
  }

  return candles;
}

function generateSparkline(basePrice: number, count = 20): number[] {
  const data: number[] = [];
  let p = basePrice;
  for (let i = 0; i < count; i++) {
    p = p * (1 + (Math.random() - 0.49) * 0.03);
    data.push(parseFloat(p.toFixed(2)));
  }
  return data;
}

// ─── Crypto Assets ────────────────────────────────────────────────────────────

export const mockCryptoAssets: Asset[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'CRYPTO',
    icon: '₿',
    price: 67842.35,
    change24h: 1423.5,
    changePercent24h: 2.14,
    volume24h: 28_450_000_000,
    marketCap: 1_334_000_000_000,
    high24h: 68920.0,
    low24h: 66100.0,
    circulatingSupply: 19_700_000,
    sparkline: generateSparkline(67842),
    decimals: 8,
    rank: 1,
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    type: 'CRYPTO',
    icon: 'Ξ',
    price: 3541.2,
    change24h: 78.4,
    changePercent24h: 2.26,
    volume24h: 14_200_000_000,
    marketCap: 425_000_000_000,
    high24h: 3610.0,
    low24h: 3448.0,
    circulatingSupply: 120_000_000,
    sparkline: generateSparkline(3541),
    decimals: 8,
    rank: 2,
  },
  {
    id: 'tether',
    symbol: 'USDT',
    name: 'Tether',
    type: 'CRYPTO',
    icon: '₮',
    price: 1.0,
    change24h: 0.0001,
    changePercent24h: 0.01,
    volume24h: 62_000_000_000,
    marketCap: 110_000_000_000,
    high24h: 1.001,
    low24h: 0.999,
    sparkline: generateSparkline(1.0),
    decimals: 2,
    rank: 3,
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    type: 'CRYPTO',
    icon: '◎',
    price: 172.45,
    change24h: -4.3,
    changePercent24h: -2.43,
    volume24h: 3_800_000_000,
    marketCap: 78_000_000_000,
    high24h: 180.0,
    low24h: 168.0,
    sparkline: generateSparkline(172),
    decimals: 6,
    rank: 5,
  },
  {
    id: 'bnb',
    symbol: 'BNB',
    name: 'BNB',
    type: 'CRYPTO',
    icon: '⬡',
    price: 598.3,
    change24h: 11.2,
    changePercent24h: 1.91,
    volume24h: 1_900_000_000,
    marketCap: 87_000_000_000,
    high24h: 608.0,
    low24h: 583.0,
    sparkline: generateSparkline(598),
    decimals: 6,
    rank: 4,
  },
  {
    id: 'xrp',
    symbol: 'XRP',
    name: 'XRP',
    type: 'CRYPTO',
    icon: '✕',
    price: 0.6124,
    change24h: -0.0182,
    changePercent24h: -2.89,
    volume24h: 1_500_000_000,
    marketCap: 35_000_000_000,
    high24h: 0.638,
    low24h: 0.601,
    sparkline: generateSparkline(0.612),
    decimals: 6,
    rank: 6,
  },
  {
    id: 'usd-coin',
    symbol: 'USDC',
    name: 'USD Coin',
    type: 'CRYPTO',
    icon: '$',
    price: 1.0,
    change24h: 0.0,
    changePercent24h: 0.0,
    volume24h: 8_200_000_000,
    marketCap: 32_000_000_000,
    high24h: 1.001,
    low24h: 0.9995,
    sparkline: generateSparkline(1.0),
    decimals: 2,
    rank: 7,
  },
  {
    id: 'avalanche-2',
    symbol: 'AVAX',
    name: 'Avalanche',
    type: 'CRYPTO',
    icon: '🔺',
    price: 38.72,
    change24h: 1.82,
    changePercent24h: 4.93,
    volume24h: 680_000_000,
    marketCap: 16_000_000_000,
    high24h: 40.1,
    low24h: 36.8,
    sparkline: generateSparkline(38.72),
    decimals: 6,
    rank: 11,
  },
];

// ─── Stock Assets ─────────────────────────────────────────────────────────────

export const mockStockAssets: Asset[] = [
  {
    id: 'aapl',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'STOCK',
    icon: '🍎',
    price: 213.49,
    change24h: 3.12,
    changePercent24h: 1.48,
    volume24h: 54_200_000,
    marketCap: 3_290_000_000_000,
    high24h: 215.2,
    low24h: 210.8,
    sparkline: generateSparkline(213),
    decimals: 2,
  },
  {
    id: 'msft',
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    type: 'STOCK',
    icon: '🪟',
    price: 447.83,
    change24h: -2.17,
    changePercent24h: -0.48,
    volume24h: 18_900_000,
    marketCap: 3_330_000_000_000,
    high24h: 452.0,
    low24h: 444.5,
    sparkline: generateSparkline(447),
    decimals: 2,
  },
  {
    id: 'nvda',
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    type: 'STOCK',
    icon: '🟢',
    price: 1208.88,
    change24h: 47.32,
    changePercent24h: 4.07,
    volume24h: 42_000_000,
    marketCap: 2_970_000_000_000,
    high24h: 1230.0,
    low24h: 1178.0,
    sparkline: generateSparkline(1208),
    decimals: 2,
  },
  {
    id: 'tsla',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    type: 'STOCK',
    icon: '⚡',
    price: 185.63,
    change24h: -6.84,
    changePercent24h: -3.55,
    volume24h: 98_000_000,
    marketCap: 590_000_000_000,
    high24h: 194.2,
    low24h: 183.1,
    sparkline: generateSparkline(185),
    decimals: 2,
  },
  {
    id: 'amzn',
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    type: 'STOCK',
    icon: '📦',
    price: 192.15,
    change24h: 4.22,
    changePercent24h: 2.24,
    volume24h: 36_000_000,
    marketCap: 2_020_000_000_000,
    high24h: 195.0,
    low24h: 188.3,
    sparkline: generateSparkline(192),
    decimals: 2,
  },
  {
    id: 'googl',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    type: 'STOCK',
    icon: '🔍',
    price: 178.02,
    change24h: 1.55,
    changePercent24h: 0.88,
    volume24h: 24_000_000,
    marketCap: 2_200_000_000_000,
    high24h: 180.5,
    low24h: 176.1,
    sparkline: generateSparkline(178),
    decimals: 2,
  },
  {
    id: 'meta',
    symbol: 'META',
    name: 'Meta Platforms',
    type: 'STOCK',
    icon: '👾',
    price: 541.3,
    change24h: 8.9,
    changePercent24h: 1.67,
    volume24h: 12_000_000,
    marketCap: 1_390_000_000_000,
    high24h: 546.0,
    low24h: 530.8,
    sparkline: generateSparkline(541),
    decimals: 2,
  },
  {
    id: 'nflx',
    symbol: 'NFLX',
    name: 'Netflix Inc.',
    type: 'STOCK',
    icon: '📺',
    price: 682.44,
    change24h: -12.3,
    changePercent24h: -1.77,
    volume24h: 4_800_000,
    marketCap: 294_000_000_000,
    high24h: 698.0,
    low24h: 679.0,
    sparkline: generateSparkline(682),
    decimals: 2,
  },
];

// ─── ETF Assets ───────────────────────────────────────────────────────────────

export const mockETFAssets: Asset[] = [
  {
    id: 'spy',
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    type: 'ETF',
    icon: '📈',
    price: 548.32,
    change24h: 4.18,
    changePercent24h: 0.77,
    volume24h: 72_000_000,
    marketCap: 549_000_000_000,
    high24h: 550.1,
    low24h: 542.0,
    sparkline: generateSparkline(548),
    decimals: 2,
  },
  {
    id: 'qqq',
    symbol: 'QQQ',
    name: 'Invesco QQQ Trust',
    type: 'ETF',
    icon: '📊',
    price: 478.15,
    change24h: 5.32,
    changePercent24h: 1.13,
    volume24h: 38_000_000,
    marketCap: 236_000_000_000,
    high24h: 480.0,
    low24h: 471.5,
    sparkline: generateSparkline(478),
    decimals: 2,
  },
  {
    id: 'voo',
    symbol: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    type: 'ETF',
    icon: '📉',
    price: 503.81,
    change24h: 3.88,
    changePercent24h: 0.78,
    volume24h: 5_800_000,
    marketCap: 460_000_000_000,
    high24h: 505.5,
    low24h: 498.9,
    sparkline: generateSparkline(503),
    decimals: 2,
  },
  {
    id: 'ivv',
    symbol: 'IVV',
    name: 'iShares Core S&P 500',
    type: 'ETF',
    icon: '📈',
    price: 550.22,
    change24h: 4.1,
    changePercent24h: 0.75,
    volume24h: 4_200_000,
    marketCap: 485_000_000_000,
    high24h: 552.0,
    low24h: 544.0,
    sparkline: generateSparkline(550),
    decimals: 2,
  },
  {
    id: 'vti',
    symbol: 'VTI',
    name: 'Vanguard Total Stock Market',
    type: 'ETF',
    icon: '🏛️',
    price: 248.6,
    change24h: 2.14,
    changePercent24h: 0.87,
    volume24h: 3_100_000,
    marketCap: 411_000_000_000,
    high24h: 250.0,
    low24h: 245.8,
    sparkline: generateSparkline(248),
    decimals: 2,
  },
];

export const mockAllAssets: Asset[] = [
  ...mockCryptoAssets,
  ...mockStockAssets,
  ...mockETFAssets,
];

// ─── Portfolio ────────────────────────────────────────────────────────────────

export const mockPortfolio: PortfolioEntry[] = [
  {
    asset: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: '₿',
    amount: 0.4821,
    avgBuyPrice: 58200,
    currentPrice: 67842.35,
    currentValue: 32703.65,
    pnl: 4653.19,
    pnlPercent: 16.57,
    allocation: 45.2,
  },
  {
    asset: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    icon: 'Ξ',
    amount: 4.32,
    avgBuyPrice: 2980,
    currentPrice: 3541.2,
    currentValue: 15297.98,
    pnl: 2424.38,
    pnlPercent: 18.83,
    allocation: 21.1,
  },
  {
    asset: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    icon: '◎',
    amount: 42.5,
    avgBuyPrice: 148,
    currentPrice: 172.45,
    currentValue: 7329.13,
    pnl: 1039.13,
    pnlPercent: 16.52,
    allocation: 10.1,
  },
  {
    asset: 'aapl',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    icon: '🍎',
    amount: 25,
    avgBuyPrice: 195.4,
    currentPrice: 213.49,
    currentValue: 5337.25,
    pnl: 452.25,
    pnlPercent: 9.25,
    allocation: 7.4,
  },
  {
    asset: 'spy',
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF',
    icon: '📈',
    amount: 15,
    avgBuyPrice: 512,
    currentPrice: 548.32,
    currentValue: 8224.8,
    pnl: 544.8,
    pnlPercent: 7.09,
    allocation: 11.4,
  },
  {
    asset: 'tether',
    symbol: 'USDT',
    name: 'Tether',
    icon: '₮',
    amount: 3445.82,
    avgBuyPrice: 1.0,
    currentPrice: 1.0,
    currentValue: 3445.82,
    pnl: 0,
    pnlPercent: 0,
    allocation: 4.8,
  },
];

export const mockTotalPortfolioValue = 72338.63;
export const mockPortfolio24hChange = 1842.15;
export const mockPortfolio24hChangePercent = 2.61;

// ─── Transactions ─────────────────────────────────────────────────────────────

export const mockTransactions: Transaction[] = [
  {
    id: 'txn-001',
    userId: 'user-001',
    type: 'DEPOSIT',
    asset: 'tether',
    symbol: 'USDT',
    amount: 10000,
    fee: 0,
    status: 'COMPLETED',
    txHash: '0x7f4a8b2c1d9e3f6a5b0c8d7e2f4a1b9c3d5e7f',
    network: 'TRC20',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    usdValue: 10000,
  },
  {
    id: 'txn-002',
    userId: 'user-001',
    type: 'BUY',
    asset: 'bitcoin',
    symbol: 'BTC',
    amount: 0.1482,
    fee: 6.78,
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    usdValue: 10056.15,
  },
  {
    id: 'txn-003',
    userId: 'user-001',
    type: 'BUY',
    asset: 'ethereum',
    symbol: 'ETH',
    amount: 1.2,
    fee: 4.25,
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    usdValue: 4249.44,
  },
  {
    id: 'txn-004',
    userId: 'user-001',
    type: 'STAKE',
    asset: 'ethereum',
    symbol: 'ETH',
    amount: 1.0,
    fee: 0,
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 86400000 * 0.8).toISOString(),
    usdValue: 3541.2,
  },
  {
    id: 'txn-005',
    userId: 'user-001',
    type: 'WITHDRAWAL',
    asset: 'tether',
    symbol: 'USDT',
    amount: 500,
    fee: 1,
    status: 'COMPLETED',
    txHash: '0xabc123def456',
    network: 'ERC20',
    toAddress: '0x742d35Cc6634C0532925a3b8D4C1C9f8F8f8a8b',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    usdValue: 500,
  },
  {
    id: 'txn-006',
    userId: 'user-001',
    type: 'BUY',
    asset: 'solana',
    symbol: 'SOL',
    amount: 12.5,
    fee: 2.15,
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    usdValue: 2156.13,
  },
  {
    id: 'txn-007',
    userId: 'user-001',
    type: 'REWARD',
    asset: 'ethereum',
    symbol: 'ETH',
    amount: 0.00125,
    fee: 0,
    status: 'COMPLETED',
    note: 'Daily staking reward',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    usdValue: 4.43,
  },
  {
    id: 'txn-008',
    userId: 'user-001',
    type: 'DEPOSIT',
    asset: 'bitcoin',
    symbol: 'BTC',
    amount: 0.05,
    fee: 0,
    status: 'PENDING',
    txHash: '0x9f8e7d6c5b4a3210fedcba9876543210',
    network: 'BTC',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    usdValue: 3392.12,
  },
];

// ─── Staking Plans ────────────────────────────────────────────────────────────

export const mockStakingPlans: StakingPlan[] = [
  {
    id: 'plan-btc-30',
    asset: 'bitcoin',
    symbol: 'BTC',
    name: 'BTC Fixed 30-Day',
    icon: '₿',
    apr: 5.0,
    duration: 30,
    isFlexible: false,
    minAmount: 0.001,
    maxAmount: 10,
    totalStaked: 142.5,
    availableQuota: 57.5,
    description: 'Earn 5% APR on your Bitcoin with a 30-day lock period. Rewards paid daily.',
  },
  {
    id: 'plan-eth-flex',
    asset: 'ethereum',
    symbol: 'ETH',
    name: 'ETH Flexible Earn',
    icon: 'Ξ',
    apr: 4.5,
    duration: 0,
    isFlexible: true,
    minAmount: 0.01,
    totalStaked: 2840.2,
    availableQuota: 9999,
    description: 'Flexible ETH staking with 4.5% APR. Unstake anytime with no penalties.',
  },
  {
    id: 'plan-usdt-90',
    asset: 'tether',
    symbol: 'USDT',
    name: 'USDT Fixed 90-Day',
    icon: '₮',
    apr: 8.0,
    duration: 90,
    isFlexible: false,
    minAmount: 100,
    maxAmount: 500000,
    totalStaked: 4_820_000,
    availableQuota: 180_000,
    description: 'High-yield 90-day USDT earning with 8% APR. Best for stable returns.',
  },
  {
    id: 'plan-sol-60',
    asset: 'solana',
    symbol: 'SOL',
    name: 'SOL Fixed 60-Day',
    icon: '◎',
    apr: 6.5,
    duration: 60,
    isFlexible: false,
    minAmount: 1,
    maxAmount: 5000,
    totalStaked: 38200,
    availableQuota: 11800,
    description: 'Earn 6.5% APR on SOL with a 60-day lock. Daily compounding rewards.',
  },
  {
    id: 'plan-bnb-flex',
    asset: 'bnb',
    symbol: 'BNB',
    name: 'BNB Flexible Earn',
    icon: '⬡',
    apr: 3.8,
    duration: 0,
    isFlexible: true,
    minAmount: 0.1,
    totalStaked: 4200,
    availableQuota: 99999,
    description: 'Flexible BNB earning at 3.8% APR. No lock-up, withdraw anytime.',
  },
  {
    id: 'plan-usdc-30',
    asset: 'usd-coin',
    symbol: 'USDC',
    name: 'USDC 30-Day Earn',
    icon: '$',
    apr: 7.2,
    duration: 30,
    isFlexible: false,
    minAmount: 50,
    maxAmount: 250000,
    totalStaked: 2_140_000,
    availableQuota: 360_000,
    description: 'Stable 7.2% APR on USDC. Great for preserving value while earning.',
  },
];

export const mockStakingPositions: StakingPosition[] = [
  {
    id: 'pos-001',
    userId: 'user-001',
    plan: mockStakingPlans[1],
    amount: 1.0,
    earned: 0.00125,
    startDate: new Date(Date.now() - 86400000 * 0.8).toISOString(),
    status: 'ACTIVE',
    nextRewardDate: new Date(Date.now() + 3600000 * 16).toISOString(),
  },
];

// ─── Chat Messages ────────────────────────────────────────────────────────────

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg-001',
    ticketId: 'ticket-001',
    senderId: 'bot',
    senderName: 'BCE Support Bot',
    senderRole: 'BOT',
    content: 'Welcome to Bridge Capital Exchange Support! How can I help you today?',
    createdAt: new Date(Date.now() - 60000 * 5).toISOString(),
    isRead: true,
  },
  {
    id: 'msg-002',
    ticketId: 'ticket-001',
    senderId: 'user-001',
    senderName: 'John Smith',
    senderRole: 'USER',
    content: "Hi, I made a deposit 2 hours ago but it's not showing in my account.",
    createdAt: new Date(Date.now() - 60000 * 4).toISOString(),
    isRead: true,
  },
  {
    id: 'msg-003',
    ticketId: 'ticket-001',
    senderId: 'support-001',
    senderName: 'Sarah (Support)',
    senderRole: 'SUPPORT',
    content:
      "Hi John! I can see your deposit transaction. It's currently waiting for 3 more blockchain confirmations. This usually takes 10-20 minutes. Your funds will appear shortly!",
    createdAt: new Date(Date.now() - 60000 * 2).toISOString(),
    isRead: true,
  },
];

// ─── Support Tickets ──────────────────────────────────────────────────────────

export const mockTickets: SupportTicket[] = [
  {
    id: 'ticket-001',
    userId: 'user-001',
    userName: 'John Smith',
    userEmail: 'john@example.com',
    subject: 'Deposit not showing in account',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    category: 'Deposits',
    assignedTo: 'Sarah (Support)',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 120000).toISOString(),
    messageCount: 3,
  },
  {
    id: 'ticket-002',
    userId: 'user-001',
    userName: 'John Smith',
    userEmail: 'john@example.com',
    subject: 'KYC verification taking too long',
    status: 'RESOLVED',
    priority: 'MEDIUM',
    category: 'KYC',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    messageCount: 5,
  },
];

// ─── Signals ──────────────────────────────────────────────────────────────────

export const mockSignals: Signal[] = [
  {
    id: 'sig-001',
    asset: 'bitcoin',
    symbol: 'BTC',
    action: 'BUY',
    confidence: 82,
    targetPrice: 72000,
    stopLoss: 63500,
    timeframe: '4H',
    analysis:
      'BTC breaking above key resistance at $67,000. RSI showing bullish divergence. Volume increasing. Target: $72,000.',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'sig-002',
    asset: 'ethereum',
    symbol: 'ETH',
    action: 'BUY',
    confidence: 75,
    targetPrice: 3800,
    stopLoss: 3300,
    timeframe: '1D',
    analysis:
      'ETH consolidating above $3,400 support. Bullish flag pattern forming. Expecting breakout to $3,800.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'sig-003',
    asset: 'solana',
    symbol: 'SOL',
    action: 'SELL',
    confidence: 68,
    targetPrice: 155,
    stopLoss: 185,
    timeframe: '4H',
    analysis:
      'SOL showing bearish divergence on RSI. Support at $170 may break. Consider taking profits.',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'sig-004',
    asset: 'nvda',
    symbol: 'NVDA',
    action: 'BUY',
    confidence: 79,
    targetPrice: 1350,
    stopLoss: 1150,
    timeframe: '1D',
    analysis:
      'NVDA momentum strong post-earnings. AI tailwind continues. Breaking all-time highs with volume.',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
];

// ─── News ─────────────────────────────────────────────────────────────────────

export const mockNews: NewsArticle[] = [
  {
    id: 'news-001',
    title: 'Bitcoin Surges Past $68,000 as Institutional Demand Accelerates',
    summary:
      'Bitcoin hit its highest level in weeks as spot ETF inflows reached record highs, with BlackRock and Fidelity reporting significant institutional buying.',
    source: 'CryptoNews',
    sourceUrl: '#',
    imageUrl: '/news/btc-surge.jpg',
    category: 'CRYPTO',
    publishedAt: new Date(Date.now() - 1800000).toISOString(),
    readTime: 3,
  },
  {
    id: 'news-002',
    title: 'NVIDIA Tops $3 Trillion Market Cap on AI Chip Demand',
    summary:
      'NVIDIA briefly overtook Apple as the world\'s most valuable company as AI infrastructure spending shows no signs of slowing down.',
    source: 'Financial Times',
    sourceUrl: '#',
    imageUrl: '/news/nvda.jpg',
    category: 'STOCKS',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    readTime: 4,
  },
  {
    id: 'news-003',
    title: 'Federal Reserve Signals Possible Rate Cuts in Q4 2024',
    summary:
      'Fed Chair signals openness to rate cuts later this year, boosting risk assets across crypto, equities and ETF markets.',
    source: 'Reuters',
    sourceUrl: '#',
    imageUrl: '/news/fed.jpg',
    category: 'MACRO',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    readTime: 5,
  },
  {
    id: 'news-004',
    title: 'Ethereum ETFs See Record $1.2B Inflows in First Week',
    summary:
      'Spot Ethereum ETFs launched to massive demand, signaling mainstream acceptance of the second-largest cryptocurrency.',
    source: 'Bloomberg',
    sourceUrl: '#',
    imageUrl: '/news/eth-etf.jpg',
    category: 'ETF',
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    readTime: 3,
  },
  {
    id: 'news-005',
    title: 'S&P 500 Hits New All-Time High Amid Tech Earnings Beat',
    summary:
      'Major tech companies reported better-than-expected earnings, driving the S&P 500 to record levels and boosting SPY ETF to $550.',
    source: 'CNBC',
    sourceUrl: '#',
    imageUrl: '/news/sp500.jpg',
    category: 'STOCKS',
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    readTime: 4,
  },
  {
    id: 'news-006',
    title: 'Solana DeFi TVL Surpasses $10 Billion for First Time',
    summary:
      'Solana ecosystem hits milestone as DeFi total value locked crosses $10B, driven by meme coin mania and new DEX activity.',
    source: 'DeFi Pulse',
    sourceUrl: '#',
    imageUrl: '/news/sol.jpg',
    category: 'CRYPTO',
    publishedAt: new Date(Date.now() - 18000000).toISOString(),
    readTime: 3,
  },
];

// ─── Market Indices ───────────────────────────────────────────────────────────

export const mockMarketIndices: MarketIndex[] = [
  { name: 'S&P 500', symbol: 'SPX', value: 5481.63, change: 42.3, changePercent: 0.78 },
  { name: 'NASDAQ', symbol: 'NDX', value: 19860.42, change: 186.5, changePercent: 0.95 },
  { name: 'DOW JONES', symbol: 'DJI', value: 39118.86, change: -82.4, changePercent: -0.21 },
  { name: 'VIX', symbol: 'VIX', value: 14.32, change: -0.84, changePercent: -5.54 },
];

// ─── Market Data ──────────────────────────────────────────────────────────────

export const mockMarketData: MarketData = {
  totalMarketCap: 2_780_000_000_000,
  total24hVolume: 142_000_000_000,
  btcDominance: 54.8,
  ethDominance: 17.2,
  marketCapChange24h: 2.14,
  activeCryptocurrencies: 13420,
  defiVolume: 8_400_000_000,
};

// ─── Order Book ───────────────────────────────────────────────────────────────

export function generateOrderBook(price: number): OrderBook {
  const bids: [number, number][] = [];
  const asks: [number, number][] = [];

  for (let i = 0; i < 15; i++) {
    const bidPrice = price - i * price * 0.0003 - Math.random() * price * 0.0001;
    const askPrice = price + i * price * 0.0003 + Math.random() * price * 0.0001;
    const bidSize = parseFloat((Math.random() * 2 + 0.1).toFixed(4));
    const askSize = parseFloat((Math.random() * 2 + 0.1).toFixed(4));

    bids.push([parseFloat(bidPrice.toFixed(2)), bidSize]);
    asks.push([parseFloat(askPrice.toFixed(2)), askSize]);
  }

  return {
    bids,
    asks,
    spread: parseFloat((asks[0][0] - bids[0][0]).toFixed(2)),
    spreadPercent: parseFloat((((asks[0][0] - bids[0][0]) / price) * 100).toFixed(4)),
  };
}

// ─── Login Sessions ───────────────────────────────────────────────────────────

export const mockLoginSessions: LoginSession[] = [
  {
    id: 'sess-001',
    ipAddress: '192.168.1.100',
    country: 'United States',
    deviceType: 'Chrome on macOS',
    carrier: 'Comcast',
    createdAt: new Date().toISOString(),
    isActive: true,
    isCurrent: true,
  },
  {
    id: 'sess-002',
    ipAddress: '10.0.0.42',
    country: 'United States',
    deviceType: 'Safari on iPhone 15',
    carrier: 'AT&T',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isActive: true,
    isCurrent: false,
  },
  {
    id: 'sess-003',
    ipAddress: '172.16.0.88',
    country: 'United Kingdom',
    deviceType: 'Firefox on Windows',
    carrier: 'BT Internet',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    isActive: false,
    isCurrent: false,
  },
];

// ─── Admin Mock Users ─────────────────────────────────────────────────────────

export const mockAdminUsers = [
  {
    id: 'user-001',
    name: 'John Smith',
    email: 'john@example.com',
    role: 'USER',
    kycStatus: 'APPROVED',
    isHeld: false,
    totalBalance: 72338.63,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    country: 'US',
  },
  {
    id: 'user-002',
    name: 'Emma Johnson',
    email: 'emma@example.com',
    role: 'USER',
    kycStatus: 'PENDING',
    isHeld: false,
    totalBalance: 18420.0,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    country: 'UK',
  },
  {
    id: 'user-003',
    name: 'Carlos Rodriguez',
    email: 'carlos@example.com',
    role: 'USER',
    kycStatus: 'NONE',
    isHeld: false,
    totalBalance: 5200.0,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    country: 'ES',
  },
  {
    id: 'user-004',
    name: 'Liu Wei',
    email: 'liu@example.com',
    role: 'USER',
    kycStatus: 'REJECTED',
    isHeld: true,
    totalBalance: 0,
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    country: 'CN',
  },
  {
    id: 'user-005',
    name: 'Priya Patel',
    email: 'priya@example.com',
    role: 'USER',
    kycStatus: 'APPROVED',
    isHeld: false,
    totalBalance: 142800.0,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    country: 'IN',
  },
  {
    id: 'user-006',
    name: 'Marcus Williams',
    email: 'marcus@example.com',
    role: 'USER',
    kycStatus: 'APPROVED',
    isHeld: false,
    totalBalance: 38900.0,
    createdAt: new Date(Date.now() - 86400000 * 22).toISOString(),
    country: 'US',
  },
];

// ─── Portfolio Chart Data ─────────────────────────────────────────────────────

export function generatePortfolioHistory(
  currentValue: number,
  days: number = 30
): { date: string; value: number }[] {
  const data: { date: string; value: number }[] = [];
  let value = currentValue * 0.78;

  for (let i = days; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000);
    value = value * (1 + (Math.random() - 0.44) * 0.04);
    if (i === 0) value = currentValue;
    data.push({
      date: date.toISOString().split('T')[0],
      value: parseFloat(value.toFixed(2)),
    });
  }

  return data;
}
