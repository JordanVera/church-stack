import Link from 'next/link';
import { prisma } from '@repo/database';
import { requireAdmin } from '@/lib/require-admin';
import { AdminSupportRequests } from '@/components/admin/AdminSupportRequests';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminPage() {
  const admin = await requireAdmin();

  const [churchCount, userCount, churches] = await Promise.all([
    prisma.church.count(),
    prisma.user.count(),
    prisma.church.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        _count: { select: { memberships: true } },
      },
    }),
  ]);

  return (
    <div className="px-6 py-16 mx-auto max-w-5xl">
      <div className="flex flex-wrap gap-4 justify-between items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500 dark:text-ink-400">
            Platform
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-900 dark:text-white">
            Admin
          </h1>
          <p className="mt-1 text-ink-600 dark:text-ink-300">Signed in as {admin.email}</p>
        </div>
      </div>

      <div className="grid gap-4 mt-10 sm:grid-cols-2">
        <Card className="shadow-sm border-ink-200 dark:border-ink-800 dark:bg-ink-900">
          <CardHeader className="px-5">
            <CardDescription>Churches</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{churchCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm border-ink-200 dark:border-ink-800 dark:bg-ink-900">
          <CardHeader className="px-5">
            <CardDescription>Users</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{userCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <h2 className="mt-12 text-lg font-semibold text-ink-900 dark:text-white">Churches</h2>
      <div className="grid gap-4 mt-4 sm:grid-cols-2">
        {churches.map((church) => (
          <Card
            key={church.id}
            className="shadow-sm border-ink-200 dark:border-ink-800 dark:bg-ink-900"
          >
            <CardHeader className="px-5">
              <div className="flex gap-3 justify-between items-center">
                <CardTitle className="font-semibold text-ink-900 dark:text-white">
                  {church.name}
                </CardTitle>
                <Badge
                  className={
                    church.isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                      : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300'
                  }
                >
                  {church.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <CardDescription className="text-ink-500 dark:text-ink-400">
                /{church.slug} · {church._count.memberships} members
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <AdminSupportRequests />
    </div>
  );
}
