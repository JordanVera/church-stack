import type { Metadata } from 'next';
import { TRPCProvider } from '@/lib/trpc-provider';
import SessionProvider from '@/components/SessionProvider';
import ThemeProvider from '@/components/ThemeProvider';
import Header from '@/components/Header';
import '@/styles/global.css';

export const metadata: Metadata = {
  title: 'Church Stack — Whitelabel apps for churches',
  description:
    'Launch a beautiful, branded mobile app for your church in days, not months. Built for small and medium churches.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-slate-900 antialiased transition-colors dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider>
          <SessionProvider>
            <TRPCProvider>
              <Header />
              <main>{children}</main>
            </TRPCProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
