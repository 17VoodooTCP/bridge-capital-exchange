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
  // Stocks — official company logos from Financial Modeling Prep's CDN (by ticker)
  AAPL: 'https://financialmodelingprep.com/image-stock/AAPL.png',
  MSFT: 'https://financialmodelingprep.com/image-stock/MSFT.png',
  NVDA: 'https://financialmodelingprep.com/image-stock/NVDA.png',
  TSLA: 'https://financialmodelingprep.com/image-stock/TSLA.png',
  AMZN: 'https://financialmodelingprep.com/image-stock/AMZN.png',
  GOOGL: 'https://financialmodelingprep.com/image-stock/GOOGL.png',
  META: 'https://financialmodelingprep.com/image-stock/META.png',
  NFLX: 'https://financialmodelingprep.com/image-stock/NFLX.png',
  JPM: 'https://financialmodelingprep.com/image-stock/JPM.png',
  V: 'https://financialmodelingprep.com/image-stock/V.png',
  JNJ: 'https://financialmodelingprep.com/image-stock/JNJ.png',
  // ETFs
  SPY: 'https://financialmodelingprep.com/image-stock/SPY.png',
  QQQ: 'https://financialmodelingprep.com/image-stock/QQQ.png',
  VOO: 'https://financialmodelingprep.com/image-stock/VOO.png',
  IVV: 'https://financialmodelingprep.com/image-stock/IVV.png',
  VTI: 'https://financialmodelingprep.com/image-stock/VTI.png',
  URTH: 'https://financialmodelingprep.com/image-stock/URTH.png',
  ARKK: 'https://financialmodelingprep.com/image-stock/ARKK.png',
  IBIT: 'https://financialmodelingprep.com/image-stock/IBIT.png',
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
