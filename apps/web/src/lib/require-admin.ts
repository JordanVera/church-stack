import { notFound } from 'next/navigation';
import { prisma } from '@repo/database';
import { auth } from '@/auth';

/**
 * Server-only gate for /admin.
 * Checks the DB (not just the JWT) so revoked admins lose access immediately.
 * Non-admins get a 404 so the route does not advertise its existence.
 */
export async function requireAdmin() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) notFound();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, isAdmin: true },
  });

  if (!user?.isAdmin) notFound();

  return user;
}
