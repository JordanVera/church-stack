'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  CalendarDays,
  Church,
  LayoutDashboard,
  MapPin,
  Plug,
  Settings,
  Users,
  UsersRound,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** When linked to PCO, this nav item is managed by sync. */
  pcoOwned?: boolean;
};

export function dashboardNav(slug: string): NavItem[] {
  const base = `/dashboard/${slug}`;
  return [
    { href: base, label: 'Overview', icon: LayoutDashboard },
    { href: `${base}/integrations`, label: 'Integrations', icon: Plug },
    { href: `${base}/pastors`, label: 'Pastors', icon: Users },
    { href: `${base}/locations`, label: 'Locations', icon: MapPin, pcoOwned: true },
    { href: `${base}/events`, label: 'Events', icon: CalendarDays, pcoOwned: true },
    { href: `${base}/announcements`, label: 'Announcements', icon: Bell },
    { href: `${base}/groups`, label: 'Life groups', icon: UsersRound, pcoOwned: true },
    { href: `${base}/settings`, label: 'Settings', icon: Settings },
  ];
}

export function DashboardShell({
  slug,
  churchName,
  planningCenterLinked,
  children,
}: {
  slug: string;
  churchName: string;
  planningCenterLinked: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const items = dashboardNav(slug);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-6xl flex-col gap-8 px-6 py-10 lg:flex-row lg:gap-10">
      <aside className="w-full shrink-0 lg:w-56">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
          >
            All churches
          </Link>
          <div className="mt-3 flex items-start gap-2">
            <Church className="mt-0.5 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" />
            <div>
              <h1 className="font-display text-lg font-semibold leading-tight text-ink-900 dark:text-white">
                {churchName}
              </h1>
              <Badge
                variant="outline"
                className={cn(
                  'mt-2 h-auto px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  planningCenterLinked
                    ? 'border-brand-300 text-brand-700 dark:border-brand-700 dark:text-brand-300'
                    : 'border-ink-300 text-ink-600 dark:border-ink-600 dark:text-ink-300'
                )}
              >
                {planningCenterLinked ? 'Planning Center' : 'Manual CMS'}
              </Badge>
            </div>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {items.map((item) => {
            const active =
              item.href === `/dashboard/${slug}`
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition',
                  active
                    ? 'bg-brand-50 text-brand-800 dark:bg-brand-500/15 dark:text-brand-200'
                    : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-900 dark:hover:text-white'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
                {planningCenterLinked && item.pcoOwned ? (
                  <span className="ml-auto hidden text-[10px] uppercase tracking-wide text-ink-400 lg:inline">
                    sync
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function PcoLockedPanel({ slug, label }: { slug: string; label: string }) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-ink-50/80 p-8 text-center dark:border-ink-800 dark:bg-ink-900/40">
      <p className="font-display text-xl font-semibold text-ink-900 dark:text-white">
        {label} managed in Planning Center
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-600 dark:text-ink-300">
        This church is linked to Planning Center. Update {label.toLowerCase()} there, then sync from
        Integrations. Disconnect Planning Center if you want to edit them here instead.
      </p>
      <Link
        href={`/dashboard/${slug}/integrations`}
        className="mt-5 inline-flex text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
      >
        Go to Integrations
      </Link>
    </div>
  );
}
