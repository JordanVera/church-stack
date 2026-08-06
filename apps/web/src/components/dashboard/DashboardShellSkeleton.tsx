import { Skeleton } from '@/components/ui/skeleton';

export function DashboardShellSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-6xl flex-col gap-8 px-6 py-10 lg:flex-row lg:gap-10">
      <aside className="w-full shrink-0 lg:w-56">
        <div className="mb-6">
          <Skeleton className="h-3 w-24" />
          <div className="mt-3 flex items-start gap-2">
            <Skeleton className="mt-0.5 h-5 w-5 shrink-0 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-28 shrink-0 rounded-lg lg:w-full" />
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
