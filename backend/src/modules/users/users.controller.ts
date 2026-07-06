import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@CurrentUser('userId') userId: string) {
    return this.users.getProfile(userId);
  }

  @Patch('me')
  update(@CurrentUser('userId') userId: string, @Body() data: any) {
    return this.users.updateProfile(userId, data);
  }

  @Get('me/sessions')
  sessions(@CurrentUser('userId') userId: string) {
    return this.users.getSessions(userId);
  }

  @Delete('me/sessions/:id')
  revoke(@Param('id') id: string) {
    return this.users.revokeSession(id);
  }
}
