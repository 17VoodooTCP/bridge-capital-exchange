import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { TradingModule } from './modules/trading/trading.module';
import { MarketModule } from './modules/market/market.module';
import { EarnModule } from './modules/earn/earn.module';
import { KycModule } from './modules/kyc/kyc.module';
import { SupportModule } from './modules/support/support.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    WalletModule,
    TradingModule,
    MarketModule,
    EarnModule,
    KycModule,
    SupportModule,
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
