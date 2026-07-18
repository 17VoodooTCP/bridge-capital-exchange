import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

/**
 * Real client IP: prefer the first entry of X-Forwarded-For (set by Render's
 * proxy), fall back to req.ip, and strip the IPv6-mapped IPv4 prefix so the
 * value is a plain address that geolocation can resolve.
 */
function clientIp(req: any): string | undefined {
  const fwd = req.headers?.['x-forwarded-for'];
  const raw = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0]?.trim() || req.ip;
  return typeof raw === 'string' ? raw.replace(/^::ffff:/, '') : undefined;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto, @Req() req: any) {
    return this.auth.register(dto, { ip: clientIp(req), userAgent: req.headers['user-agent'] });
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: any) {
    return this.auth.login(dto, { ip: clientIp(req), userAgent: req.headers['user-agent'] });
  }

  @Post('verify-email')
  verifyEmail(@Body() body: { email: string; code: string }, @Req() req: any) {
    return this.auth.verifyEmail(body.email, body.code, { ip: clientIp(req), userAgent: req.headers['user-agent'] });
  }

  @Post('resend-verification')
  resendVerification(@Body() body: { email: string }) {
    return this.auth.resendVerification(body.email);
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
