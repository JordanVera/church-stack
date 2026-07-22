import { TRPCError } from '@trpc/server';
import type { Church, PrismaClient } from '@repo/database';
import type { Session } from './context';
import { isPlatformDev } from './platform-dev';

export type ChurchAdminContext = {
  prisma: PrismaClient;
  session: Session | null;
};

/** True when both Planning Center credentials are stored on the church. */
export function isPlanningCenterLinked(
  church: Pick<Church, 'planningCenterApiKey' | 'planningCenterSecretKey'>
): boolean {
  return Boolean(church.planningCenterApiKey?.trim() && church.planningCenterSecretKey?.trim());
}

/**
 * Requires a signed-in OWNER/ADMIN membership for the church, or platform staff.
 * Returns the church row when allowed.
 */
export async function assertChurchAdmin(
  ctx: ChurchAdminContext,
  churchId: string
): Promise<Church> {
  const user = ctx.session?.user;
  if (!user?.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const church = await ctx.prisma.church.findUnique({ where: { id: churchId } });
  if (!church) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Church not found' });
  }

  if (user.isAdmin || isPlatformDev(user.email)) {
    return church;
  }

  const membership = await ctx.prisma.membership.findUnique({
    where: { userId_churchId: { userId: user.id, churchId } },
  });
  if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Not allowed for this church' });
  }

  return church;
}

export async function assertChurchAdminBySlug(
  ctx: ChurchAdminContext,
  slug: string
): Promise<Church> {
  const church = await ctx.prisma.church.findUnique({ where: { slug } });
  if (!church) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Church not found' });
  }
  return assertChurchAdmin(ctx, church.id);
}

/**
 * Manual CMS for PCO-owned domains (locations, services, events, life groups)
 * is only allowed when Planning Center is not linked.
 */
export function assertManualCmsMode(
  church: Pick<Church, 'planningCenterApiKey' | 'planningCenterSecretKey'>
): void {
  if (isPlanningCenterLinked(church)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message:
        'This church is linked to Planning Center. Manage locations, events, and groups there, then sync — or disconnect Planning Center to edit manually.',
    });
  }
}

/**
 * When Planning Center is linked, synced rows cannot be edited in the CMS.
 * When disconnected, any row may be edited (and should be marked MANUAL on write).
 */
export function assertEditableContentRow(
  church: Pick<Church, 'planningCenterApiKey' | 'planningCenterSecretKey'>,
  source: string
): void {
  if (isPlanningCenterLinked(church) && source !== 'MANUAL') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This record is synced from Planning Center and cannot be edited here.',
    });
  }
}
