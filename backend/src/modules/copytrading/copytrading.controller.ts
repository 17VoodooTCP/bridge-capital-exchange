import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CopyTradingService } from './copytrading.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('copy-trading')
@Controller('copy-trading')
export class CopyTradingController {
  constructor(private readonly copy: CopyTradingService) {}

  @Get('traders')
  traders(@Query('market') market?: string, @Query('sort') sort?: string) {
    return this.copy.listTraders({ market, sort });
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
