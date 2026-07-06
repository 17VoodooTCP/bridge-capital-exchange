import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TradingService } from './trading.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('trading')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trading')
export class TradingController {
  constructor(private readonly trading: TradingService) {}

  @Post('orders')
  create(@CurrentUser('userId') userId: string, @Body() dto: any) {
    return this.trading.createOrder(userId, dto);
  }

  @Delete('orders/:id')
  cancel(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.trading.cancelOrder(userId, id);
  }

  @Get('orders')
  list(@CurrentUser('userId') userId: string, @Query('status') status?: string) {
    return this.trading.getOrders(userId, status);
  }

  @Get('history')
  history(@CurrentUser('userId') userId: string) {
    return this.trading.getHistory(userId);
  }
}
