import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Records all privileged (admin) mutations to the AdminLog table for
 * traceability and regulatory compliance.
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const { method, originalUrl, user, body, ip } = req;

    return next.handle().pipe(
      tap(async () => {
        if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method) && user?.role && user.role !== 'USER') {
          try {
            await this.prisma.adminLog.create({
              data: {
                adminId: user.userId || user.id,
                action: `${method} ${originalUrl}`,
                targetId: body?.userId || body?.id || null,
                targetType: originalUrl.split('/')[2] || null,
                details: this.sanitize(body) as any,
                ipAddress: ip,
              },
            });
          } catch {
            // Never block the request on audit-log failure
          }
        }
      }),
    );
  }

  private sanitize(body: Record<string, unknown> = {}): Record<string, unknown> {
    const clone = { ...body };
    for (const key of ['password', 'passwordHash', 'privateKey', 'seedPhrase', 'secureCode']) {
      if (key in clone) clone[key] = '***redacted***';
    }
    return clone;
  }
}
