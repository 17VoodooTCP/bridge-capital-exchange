import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';
import { NotificationsService } from '../notifications/notifications.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@UseInterceptors(AuditLogInterceptor)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly notifications: NotificationsService,
  ) {}

  @Get('stats')
  stats() { return this.admin.stats(); }

  // Send the P2P order-completion email (branded, matches the reference design)
  @Post('send-order-email')
  sendOrderEmail(@Body() body: { to: string; name?: string; side?: 'Buy' | 'Sell'; orderId: string; createdAt?: string; fiatAmount: string; cryptoQuantity: string }) {
    return this.notifications.sendOrderCompleted(body.to, body);
  }

  @Get('users')
  users(@Query('q') q?: string, @Query('page') page?: string) {
    return this.admin.listUsersWithBalances(q, page ? parseInt(page, 10) : 1);
  }

  @Post('users')
  createUser(@Body() dto: any) { return this.admin.createUser(dto); }

  @Post('users/adjust-funds')
  adjust(@CurrentUser('userId') adminId: string, @Body() dto: any, @Req() req: any) {
    return this.admin.adjustFunds(adminId, dto, req.ip);
  }

  @Patch('users/:id/hold')
  hold(@CurrentUser('userId') adminId: string, @Param('id') id: string, @Body() body: { reason?: string }, @Req() req: any) {
    return this.admin.toggleHold(adminId, id, body?.reason, req.ip);
  }

  @Delete('users/:id')
  deleteUser(@CurrentUser('userId') adminId: string, @Param('id') id: string, @Req() req: any) {
    return this.admin.deleteUser(adminId, id, req.ip);
  }

  @Get('transactions')
  transactions(@Query('status') status?: string) { return this.admin.listTransactions(status); }

  @Patch('transactions/:id/review')
  reviewTx(@CurrentUser('userId') adminId: string, @Param('id') id: string, @Body() body: { approve: boolean }, @Req() req: any) {
    return this.admin.reviewTransaction(adminId, id, body.approve, req.ip);
  }

  @Get('logs')
  logs() { return this.admin.listAdminLogs(); }

  @Get('wallet-configs')
  walletConfigs() { return this.admin.listWalletConfigs(); }

  @Post('wallet-configs')
  saveWallet(@Body() dto: any) { return this.admin.upsertWalletConfig(dto); }

  @Delete('wallet-configs/:id')
  deleteWallet(@Param('id') id: string) { return this.admin.deleteWalletConfig(id); }

  @Roles('SUPER_ADMIN')
  @Post('secure-access')
  secureAccess(@CurrentUser('userId') adminId: string, @Req() req: any) {
    return this.admin.requestSecureAccess(adminId, req.ip);
  }
}
