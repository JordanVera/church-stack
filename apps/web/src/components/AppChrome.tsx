'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import DashboardHeader from '@/components/DashboardHeader';
import Footer from '@/components/marketing/Footer';

function isDashboardRoute(pathname: string) {
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/');
}

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dashboard = isDashboardRoute(pathname);

  return (
    <>
      {dashboard ? <DashboardHeader /> : <Header />}
      <main>{children}</main>
      {dashboard ? null : <Footer />}
    </>
  );
}
