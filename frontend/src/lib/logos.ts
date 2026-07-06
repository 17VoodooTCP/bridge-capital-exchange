// Real asset logo URLs. Crypto from CoinGecko/CoinMarketCap CDN, stocks/ETFs via Clearbit.
export const ASSET_LOGOS: Record<string, string> = {
  // Crypto
  BTC: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  USDT: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
  SOL: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
  BNB: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
  XRP: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
  USDC: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
  AVAX: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
  ADA: 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
  DOGE: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
  LINK: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
  DOT: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
  MATIC: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png',
  LTC: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png',
  UNI: 'https://assets.coingecko.com/coins/images/12504/small/uni.jpg',
  // Stocks
  AAPL: 'https://logo.clearbit.com/apple.com',
  MSFT: 'https://logo.clearbit.com/microsoft.com',
  NVDA: 'https://logo.clearbit.com/nvidia.com',
  TSLA: 'https://logo.clearbit.com/tesla.com',
  AMZN: 'https://logo.clearbit.com/amazon.com',
  GOOGL: 'https://logo.clearbit.com/google.com',
  META: 'https://logo.clearbit.com/meta.com',
  NFLX: 'https://logo.clearbit.com/netflix.com',
  JPM: 'https://logo.clearbit.com/jpmorganchase.com',
  V: 'https://logo.clearbit.com/visa.com',
  JNJ: 'https://logo.clearbit.com/jnj.com',
  // ETFs
  SPY: 'https://logo.clearbit.com/ssga.com',
  QQQ: 'https://logo.clearbit.com/invesco.com',
  VOO: 'https://logo.clearbit.com/vanguard.com',
  IVV: 'https://logo.clearbit.com/ishares.com',
  VTI: 'https://logo.clearbit.com/vanguard.com',
  URTH: 'https://logo.clearbit.com/ishares.com',
  ARKK: 'https://logo.clearbit.com/ark-invest.com',
  IBIT: 'https://logo.clearbit.com/ishares.com',
};

export function getAssetLogo(symbol: string): string | undefined {
  return ASSET_LOGOS[symbol.toUpperCase()];
}

// Finnhub API key for live stock/ETF quotes (free tier: 60 calls/min)
export const FINNHUB_KEY =
  process.env.NEXT_PUBLIC_FINNHUB_KEY || 'd944s01r01qj2ciac410d944s01r01qj2ciac41g';

// Symbols fetched live from Finnhub (stocks + ETFs)
export const FINNHUB_SYMBOLS = [
  'AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META', 'NFLX',
  'SPY', 'QQQ', 'VOO', 'IVV', 'VTI',
];

// CoinGecko id mapping for live prices
export const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  SOL: 'solana',
  BNB: 'binancecoin',
  XRP: 'ripple',
  USDC: 'usd-coin',
  AVAX: 'avalanche-2',
};
