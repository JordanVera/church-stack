import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-md bg-ink-200/80 dark:bg-ink-800/80', className)}
      {...props}
    />
  );
}

export { Skeleton };
