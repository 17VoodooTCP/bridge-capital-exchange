import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MarketService } from './market.service';

@ApiTags('market')
@Controller('market')
export class MarketController {
  constructor(private readonly market: MarketService) {}

  @Get('assets')
  assets(@Query('type') type?: string) {
    return this.market.getAssets(type);
  }

  @Get('assets/:symbol')
  asset(@Param('symbol') symbol: string) {
    return this.market.getAsset(symbol);
  }

  @Get('assets/:symbol/ohlcv')
  ohlcv(@Param('symbol') symbol: string, @Query('tf') tf?: string, @Query('count') count?: string) {
    return this.market.getOHLCV(symbol, tf || '1H', count ? parseInt(count, 10) : 200);
  }

  @Get('assets/:symbol/orderbook')
  orderbook(@Param('symbol') symbol: string) {
    return this.market.getOrderBook(symbol);
  }
}
