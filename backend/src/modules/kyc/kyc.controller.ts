import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('kyc')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('kyc')
export class KycController {
  constructor(private readonly kyc: KycService) {}

  @Post('submit')
  submit(@CurrentUser('userId') userId: string, @Body() dto: any) {
    return this.kyc.submit(userId, dto);
  }

  @Get('status')
  status(@CurrentUser('userId') userId: string) {
    return this.kyc.getStatus(userId);
  }

  @Post('limit-increase')
  limitIncrease(@CurrentUser('userId') userId: string, @Body() dto: { requestedLimit: number; reason?: string }) {
    return this.kyc.requestLimitIncrease(userId, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('pending')
  pending() { return this.kyc.listPending(); }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id/review')
  review(@Param('id') id: string, @CurrentUser('userId') reviewerId: string, @Body() body: { decision: 'APPROVED' | 'REJECTED'; note?: string }) {
    return this.kyc.review(id, body.decision, reviewerId, body.note);
  }
}
