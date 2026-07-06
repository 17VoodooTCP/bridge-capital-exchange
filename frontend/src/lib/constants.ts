import type { Timeframe } from '@/types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Bridge Capital Exchange';

export const TIMEFRAMES: { label: string; value: Timeframe }[] = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '30m', value: '30m' },
  { label: '1H', value: '1H' },
  { label: '4H', value: '4H' },
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
];

export const SUPPORTED_CRYPTOS = [
  { name: 'Bitcoin', symbol: 'BTC', icon: '₿', decimals: 8, network: 'Bitcoin' },
  { name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', decimals: 8, network: 'Ethereum' },
  { name: 'Tether', symbol: 'USDT', icon: '₮', decimals: 2, network: 'Multi' },
  { name: 'Solana', symbol: 'SOL', icon: '◎', decimals: 6, network: 'Solana' },
  { name: 'BNB', symbol: 'BNB', icon: '⬡', decimals: 6, network: 'BSC' },
  { name: 'XRP', symbol: 'XRP', icon: '✕', decimals: 6, network: 'XRP Ledger' },
  { name: 'USD Coin', symbol: 'USDC', icon: '$', decimals: 2, network: 'Multi' },
  { name: 'Avalanche', symbol: 'AVAX', icon: '🔺', decimals: 6, network: 'Avalanche' },
  { name: 'Cardano', symbol: 'ADA', icon: '₳', decimals: 6, network: 'Cardano' },
  { name: 'Dogecoin', symbol: 'DOGE', icon: 'Ð', decimals: 4, network: 'Dogecoin' },
  { name: 'Chainlink', symbol: 'LINK', icon: '⬡', decimals: 6, network: 'Ethereum' },
  { name: 'Polkadot', symbol: 'DOT', icon: '●', decimals: 6, network: 'Polkadot' },
  { name: 'Polygon', symbol: 'MATIC', icon: '⬡', decimals: 6, network: 'Polygon' },
  { name: 'Litecoin', symbol: 'LTC', icon: 'Ł', decimals: 6, network: 'Litecoin' },
  { name: 'Uniswap', symbol: 'UNI', icon: '🦄', decimals: 6, network: 'Ethereum' },
];

export const SUPPORTED_STOCKS = [
  { name: 'Apple Inc.', symbol: 'AAPL', icon: '🍎', decimals: 2 },
  { name: 'Microsoft Corp.', symbol: 'MSFT', icon: '🪟', decimals: 2 },
  { name: 'NVIDIA Corp.', symbol: 'NVDA', icon: '🟢', decimals: 2 },
  { name: 'Tesla Inc.', symbol: 'TSLA', icon: '⚡', decimals: 2 },
  { name: 'Amazon.com Inc.', symbol: 'AMZN', icon: '📦', decimals: 2 },
  { name: 'Alphabet Inc.', symbol: 'GOOGL', icon: '🔍', decimals: 2 },
  { name: 'Meta Platforms', symbol: 'META', icon: '👾', decimals: 2 },
  { name: 'Netflix Inc.', symbol: 'NFLX', icon: '📺', decimals: 2 },
  { name: 'JPMorgan Chase', symbol: 'JPM', icon: '🏦', decimals: 2 },
  { name: 'Berkshire Hathaway', symbol: 'BRK.B', icon: '📊', decimals: 2 },
  { name: 'Visa Inc.', symbol: 'V', icon: '💳', decimals: 2 },
  { name: 'Johnson & Johnson', symbol: 'JNJ', icon: '💊', decimals: 2 },
];

export const SUPPORTED_ETFS = [
  { name: 'SPDR S&P 500 ETF', symbol: 'SPY', icon: '📈', decimals: 2 },
  { name: 'Invesco QQQ Trust', symbol: 'QQQ', icon: '📊', decimals: 2 },
  { name: 'Vanguard S&P 500 ETF', symbol: 'VOO', icon: '📉', decimals: 2 },
  { name: 'iShares Core S&P 500', symbol: 'IVV', icon: '📈', decimals: 2 },
  { name: 'Vanguard Total Stock', symbol: 'VTI', icon: '🏛️', decimals: 2 },
  { name: 'iShares MSCI World', symbol: 'URTH', icon: '🌍', decimals: 2 },
  { name: 'ARK Innovation ETF', symbol: 'ARKK', icon: '🚀', decimals: 2 },
  { name: 'iShares Bitcoin Trust', symbol: 'IBIT', icon: '₿', decimals: 2 },
];

export const NETWORKS = [
  { name: 'TRC20 (TRON)', value: 'TRC20', fee: '1 USDT', confirmations: 1 },
  { name: 'ERC20 (Ethereum)', value: 'ERC20', fee: '5 USDT', confirmations: 12 },
  { name: 'BEP20 (BSC)', value: 'BEP20', fee: '0.5 USDT', confirmations: 15 },
  { name: 'SOL (Solana)', value: 'SOL', fee: '0.1 USDT', confirmations: 32 },
  { name: 'Bitcoin Network', value: 'BTC', fee: '0.0001 BTC', confirmations: 6 },
  { name: 'Polygon (MATIC)', value: 'MATIC', fee: '0.1 USDT', confirmations: 128 },
];

export const KYC_STATUS_LABELS = {
  NONE: 'Not Submitted',
  PENDING: 'Under Review',
  APPROVED: 'Verified',
  REJECTED: 'Rejected',
};

export const KYC_STATUS_COLORS = {
  NONE: 'text-gray-400 bg-gray-400/10',
  PENDING: 'text-yellow-400 bg-yellow-400/10',
  APPROVED: 'text-green-400 bg-green-400/10',
  REJECTED: 'text-red-400 bg-red-400/10',
};

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  DEPOSIT: 'Deposit',
  WITHDRAWAL: 'Withdrawal',
  BUY: 'Buy',
  SELL: 'Sell',
  TRANSFER: 'Transfer',
  STAKE: 'Stake',
  UNSTAKE: 'Unstake',
  REWARD: 'Reward',
  FEE: 'Fee',
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-yellow-400 bg-yellow-400/10',
  COMPLETED: 'text-green-400 bg-green-400/10',
  FAILED: 'text-red-400 bg-red-400/10',
  CANCELLED: 'text-gray-400 bg-gray-400/10',
  OPEN: 'text-blue-400 bg-blue-400/10',
  FILLED: 'text-green-400 bg-green-400/10',
  PARTIALLY_FILLED: 'text-yellow-400 bg-yellow-400/10',
  REJECTED: 'text-red-400 bg-red-400/10',
  ACTIVE: 'text-green-400 bg-green-400/10',
  IN_PROGRESS: 'text-blue-400 bg-blue-400/10',
  RESOLVED: 'text-green-400 bg-green-400/10',
  CLOSED: 'text-gray-400 bg-gray-400/10',
};

export const FAQ_ITEMS = [
  {
    question: 'How do I deposit funds to my account?',
    answer:
      'Navigate to Wallet → Deposit. Select your asset and network, copy the wallet address shown, and send funds from your external wallet. Deposits are credited after the required number of network confirmations.',
  },
  {
    question: 'How long do withdrawals take?',
    answer:
      'Crypto withdrawals are processed within 30 minutes during business hours. Network confirmations may add additional time depending on blockchain congestion. Bank transfers take 1-3 business days.',
  },
  {
    question: 'What is KYC and why is it required?',
    answer:
      'KYC (Know Your Customer) is required by financial regulations to prevent fraud and money laundering. You need to complete KYC to unlock full deposit/withdrawal limits. The process typically takes 24-48 hours.',
  },
  {
    question: 'How does staking work on Bridge Capital?',
    answer:
      'Staking lets you earn passive income by locking your crypto assets. Choose a flexible or fixed-term plan, deposit your assets, and earn daily rewards at the advertised APR. Flexible plans can be unstaked anytime.',
  },
  {
    question: 'What are the trading fees?',
    answer:
      'Bridge Capital charges a 0.1% trading fee on all spot trades. VIP tiers with higher trading volumes receive discounted fees ranging from 0.08% down to 0.02%.',
  },
  {
    question: 'How do I enable Two-Factor Authentication?',
    answer:
      'Go to Settings → Security → Two-Factor Authentication. Scan the QR code with Google Authenticator or Authy, then enter the 6-digit code to confirm. 2FA is strongly recommended for all accounts.',
  },
];
