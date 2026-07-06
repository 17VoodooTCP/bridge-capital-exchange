import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EarnService } from './earn.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('earn')
@Controller('earn')
export class EarnController {
  constructor(private readonly earn: EarnService) {}

  @Get('plans')
  plans() { return this.earn.getPlans(); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('stake')
  stake(@CurrentUser('userId') userId: string, @Body() dto: any) {
    return this.earn.stake(userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('positions/:id')
  unstake(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.earn.unstake(userId, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('positions')
  positions(@CurrentUser('userId') userId: string) {
    return this.earn.getPositions(userId);
  }
}
