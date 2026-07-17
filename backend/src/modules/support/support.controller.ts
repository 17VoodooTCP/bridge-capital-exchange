import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('support')
export class SupportController {
  constructor(private readonly support: SupportService) {}

  @Get('tickets')
  tickets(@CurrentUser('userId') userId: string, @CurrentUser('role') role: string) {
    const isStaff = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'SUPPORT';
    return this.support.getTickets(isStaff ? undefined : userId);
  }

  @Post('tickets')
  create(@CurrentUser('userId') userId: string, @Body() dto: any) {
    return this.support.createTicket(userId, dto);
  }

  // Get (or lazily create) the current user's live-chat ticket
  @Post('chat/ensure')
  ensureTicket(@CurrentUser('userId') userId: string) {
    return this.support.ensureTicket(userId);
  }

  @Get('tickets/:id/messages')
  messages(@Param('id') id: string) {
    return this.support.getMessages(id);
  }

  @Post('tickets/:id/messages')
  send(@Param('id') id: string, @CurrentUser('userId') userId: string, @Body() dto: any) {
    return this.support.sendMessage(id, userId, dto);
  }

  @Post('tickets/:id/takeover')
  takeover(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.support.takeOver(id, userId);
  }

  @Post('tickets/:id/typing')
  typing(@Param('id') id: string, @CurrentUser('role') role: string) {
    this.support.markTyping(id, role === 'USER' ? 'USER' : 'STAFF');
    return { ok: true };
  }

  @Get('tickets/:id/typing')
  getTyping(@Param('id') id: string, @CurrentUser('role') role: string) {
    return { typing: this.support.isOtherTyping(id, role === 'USER' ? 'USER' : 'STAFF') };
  }
}
