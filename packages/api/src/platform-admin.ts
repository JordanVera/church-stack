import { TRPCError } from '@trpc/server';
import type { PrismaClient } from '@repo/database';
import type { Session } from './context';

type PlatformAdminContext = {
  prisma: PrismaClient;
  session: Session | null;
};

export async function assertPlatformAdmin(ctx: PlatformAdminContext) {
  const userId = ctx.session?.user?.id;
  if (!userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const user = await ctx.prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, isAdmin: true },
  });

  if (!user?.isAdmin) {
    throw new TRPCError({ code: 'NOT_FOUND' });
  }

  return user;
}
