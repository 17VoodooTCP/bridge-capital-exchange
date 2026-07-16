import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CopyTradingService } from './copytrading.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('copy-trading')
@Controller('copy-trading')
export class CopyTradingController {
  constructor(private readonly copy: CopyTradingService) {}

  @Get('traders')
  traders(@Query('market') market?: string, @Query('sort') sort?: string) {
    return this.copy.listTraders({ market, sort });
  }

  // ─── Admin management ─────────────────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('admin/traders')
  adminTraders() {
    return this.copy.adminListTraders();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post('admin/traders')
  createTrader(@Body() dto: Record<string, unknown>) {
    return this.copy.createTrader(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch('admin/traders/:id')
  updateTrader(@Param('id') id: string, @Body() dto: Record<string, unknown>) {
    return this.copy.updateTrader(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete('admin/traders/:id')
  deleteTrader(@Param('id') id: string) {
    return this.copy.deleteTrader(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('admin/positions')
  adminPositions(@Query('userId') userId?: string) {
    return this.copy.adminListPositions(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch('admin/positions/:id/pnl')
  adjustPnl(@Param('id') id: string, @Body() body: { pnl: number }) {
    return this.copy.adjustPnl(id, body.pnl);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('positions')
  positions(@CurrentUser('userId') userId: string) {
    return this.copy.getMyPositions(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('copy')
  copyTrader(@CurrentUser('userId') userId: string, @Body() dto: { traderId: string; allocation: number }) {
    return this.copy.copy(userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('positions/:id')
  stop(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.copy.stop(userId, id);
  }
}
