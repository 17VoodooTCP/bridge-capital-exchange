import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Throws a structured 403 if the account is on hold, so the frontend can pop
 * the reason + support-contact modal. Held users can still browse/log in; they
 * just can't move funds.
 */
export async function assertNotHeld(prisma: PrismaService, userId: string) {
  const u = await prisma.user
    .findUnique({ where: { id: userId }, select: { isHeld: true, holdReason: true } })
    .catch(() => null);
  if (u?.isHeld) {
    throw new ForbiddenException({
      code: 'ACCOUNT_HELD',
      reason: u.holdReason || 'Your account is currently under review.',
      message: u.holdReason || 'Your account is currently under review.',
    });
  }
}
