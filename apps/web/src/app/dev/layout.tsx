import { requireDev } from '@/lib/require-dev';

export default async function DevLayout({ children }: { children: React.ReactNode }) {
  await requireDev();
  return <>{children}</>;
}
