import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get('balances')
  balances(@CurrentUser('userId') userId: string) {
    return this.wallet.getBalances(userId);
  }

  @Post('deposit')
  deposit(@CurrentUser('userId') userId: string, @Body() dto: any) {
    return this.wallet.deposit(userId, dto);
  }

  @Post('withdraw')
  withdraw(@CurrentUser('userId') userId: string, @Body() dto: any) {
    return this.wallet.withdraw(userId, dto);
  }

  @Post('transfer')
  transfer(@CurrentUser('userId') userId: string, @Body() dto: any) {
    return this.wallet.transfer(userId, dto);
  }

  @Get('transactions')
  history(@CurrentUser('userId') userId: string) {
    return this.wallet.history(userId);
  }

  @Get('deposit-address')
  address(@Query('asset') asset: string, @Query('network') network: string) {
    return this.wallet.getDepositAddress(asset, network);
  }

  // All active deposit configs the admin has set — every account fetches these
  @Get('deposit-configs')
  depositConfigs() {
    return this.wallet.listActiveConfigs();
  }
}
