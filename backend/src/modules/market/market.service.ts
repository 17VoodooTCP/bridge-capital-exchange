import { Injectable } from '@nestjs/common';

/**
 * Market data service — provides mocked-yet-realistic data for crypto, stocks, and ETFs.
 * In production, plug real feeds (CoinGecko / Alpha Vantage / TradingView WebSocket).
 */
@Injectable()
export class MarketService {
  private assets = [
    { symbol: 'BTC', name: 'Bitcoin', type: 'CRYPTO', price: 67842.35, change24h: 2.14, volume24h: 28_450_000_000, marketCap: 1_334_000_000_000, high24h: 68920, low24h: 66100 },
    { symbol: 'ETH', name: 'Ethereum', type: 'CRYPTO', price: 3541.2, change24h: 2.26, volume24h: 14_200_000_000, marketCap: 425_000_000_000, high24h: 3610, low24h: 3448 },
    { symbol: 'USDT', name: 'Tether', type: 'CRYPTO', price: 1.0, change24h: 0.01, volume24h: 62_000_000_000, marketCap: 110_000_000_000, high24h: 1.001, low24h: 0.999 },
    { symbol: 'SOL', name: 'Solana', type: 'CRYPTO', price: 172.45, change24h: -2.43, volume24h: 3_800_000_000, marketCap: 78_000_000_000, high24h: 180, low24h: 168 },
    { symbol: 'BNB', name: 'BNB', type: 'CRYPTO', price: 598.3, change24h: 1.91, volume24h: 1_900_000_000, marketCap: 87_000_000_000, high24h: 608, low24h: 583 },
    { symbol: 'XRP', name: 'XRP', type: 'CRYPTO', price: 0.6124, change24h: -2.89, volume24h: 1_500_000_000, marketCap: 35_000_000_000, high24h: 0.638, low24h: 0.601 },
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'STOCK', price: 213.49, change24h: 1.48, volume24h: 54_200_000, marketCap: 3_290_000_000_000, high24h: 215.2, low24h: 210.8 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'STOCK', price: 447.83, change24h: -0.48, volume24h: 18_900_000, marketCap: 3_330_000_000_000, high24h: 452, low24h: 444.5 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'STOCK', price: 1208.88, change24h: 4.07, volume24h: 42_000_000, marketCap: 2_970_000_000_000, high24h: 1230, low24h: 1178 },
    { symbol: 'TSLA', name: 'Tesla Inc.', type: 'STOCK', price: 185.63, change24h: -3.55, volume24h: 98_000_000, marketCap: 590_000_000_000, high24h: 194.2, low24h: 183.1 },
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF', type: 'ETF', price: 548.32, change24h: 0.77, volume24h: 72_000_000, marketCap: 549_000_000_000, high24h: 550.1, low24h: 542 },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'ETF', price: 478.15, change24h: 1.13, volume24h: 38_000_000, marketCap: 236_000_000_000, high24h: 480, low24h: 471.5 },
    { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'ETF', price: 503.81, change24h: 0.78, volume24h: 5_800_000, marketCap: 460_000_000_000, high24h: 505.5, low24h: 498.9 },
  ];

  getAssets(type?: string) {
    const filtered = type ? this.assets.filter((a) => a.type === type.toUpperCase()) : this.assets;
    return filtered.map((a) => ({ ...a, price: this.jitter(a.price) }));
  }

  getAsset(symbol: string) {
    const a = this.assets.find((x) => x.symbol.toLowerCase() === symbol.toLowerCase());
    if (!a) return null;
    return { ...a, price: this.jitter(a.price) };
  }

  getOHLCV(symbol: string, timeframe = '1H', count = 200) {
    const base = this.assets.find((x) => x.symbol.toLowerCase() === symbol.toLowerCase())?.price || 100;
    const intervalSec = this.tfSeconds(timeframe);
    const candles: any[] = [];
    let price = base;
    const now = Math.floor(Date.now() / 1000);
    for (let i = count; i >= 0; i--) {
      const change = (Math.random() - 0.48) * 0.02 * price;
      const open = price;
      price = Math.max(price + change, price * 0.5);
      const close = price;
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = base * (Math.random() * 1000 + 200);
      candles.push({ time: now - i * intervalSec, open, high, low, close, volume });
    }
    return candles;
  }

  getOrderBook(symbol: string) {
    const price = this.assets.find((x) => x.symbol.toLowerCase() === symbol.toLowerCase())?.price || 100;
    const bids: [number, number][] = [];
    const asks: [number, number][] = [];
    for (let i = 0; i < 15; i++) {
      bids.push([+(price - i * price * 0.0003).toFixed(2), +(Math.random() * 2 + 0.1).toFixed(4)]);
      asks.push([+(price + i * price * 0.0003).toFixed(2), +(Math.random() * 2 + 0.1).toFixed(4)]);
    }
    return { bids, asks, spread: +(asks[0][0] - bids[0][0]).toFixed(2) };
  }

  private jitter(p: number) { return +(p * (1 + (Math.random() - 0.5) * 0.002)).toFixed(p < 1 ? 6 : 2); }
  private tfSeconds(tf: string) { const map: Record<string, number> = { '1m': 60, '5m': 300, '15m': 900, '30m': 1800, '1H': 3600, '4H': 14400, '1D': 86400, '1W': 604800 }; return map[tf] || 3600; }
}
