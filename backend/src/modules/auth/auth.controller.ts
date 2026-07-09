import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto, @Req() req: any) {
    return this.auth.register(dto, { ip: req.ip, userAgent: req.headers['user-agent'] });
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: any) {
    return this.auth.login(dto, { ip: req.ip, userAgent: req.headers['user-agent'] });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: any) {
    return this.auth.logout(req.user.userId);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    return this.auth.forgotPassword(body.email);
  }

  @Post('reset-password')
  resetPassword(@Body() body: { email: string; token: string; newPassword: string }) {
    return this.auth.resetPassword(body.email, body.token, body.newPassword);
  }

  @Post('refresh')
  refresh(@Body() body: { userId: string; refreshToken: string }) {
    return this.auth.refresh(body.userId, body.refreshToken);
  }
}
