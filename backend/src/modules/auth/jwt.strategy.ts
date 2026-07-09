import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'development_jwt_secret',
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    // Verify the account still exists. A stateless JWT alone would keep
    // deleted/stale users "logged in" — this rejects those sessions so the
    // frontend clears them and sends the visitor to sign up.
    const user = await this.prisma.user
      .findUnique({ where: { id: payload.sub }, select: { id: true, role: true, email: true } })
      .catch(() => null);
    if (!user) throw new UnauthorizedException('Session no longer valid');
    return { userId: user.id, email: user.email, role: user.role };
  }
}
