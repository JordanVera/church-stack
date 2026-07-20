import { notFound } from 'next/navigation';
import { isPlatformDev } from '@repo/api';
import { auth } from '@/auth';

/**
 * Server-only gate for /dev.
 * Uses PLATFORM_DEV_EMAILS (or ALLOW_DEV_CONSOLE when the list is empty).
 * Non-devs get a 404 so the route does not advertise its existence.
 */
export async function requireDev() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email || !isPlatformDev(email)) notFound();

  return {
    id: session.user!.id!,
    email,
    name: session.user?.name ?? null,
  };
}
