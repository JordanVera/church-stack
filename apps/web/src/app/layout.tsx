import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { TRPCProvider } from '@/lib/trpc-provider';
import SessionProvider from '@/components/SessionProvider';
import ThemeProvider from '@/components/ThemeProvider';
import Header from '@/components/Header';
import '@/styles/global.css';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Church Stack — Whitelabel apps for churches',
  description:
    'Launch a beautiful, branded mobile app for your church in days, not months. Built for small and medium churches.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${display.variable}`}>
      <body className="bg-white font-sans text-slate-900 antialiased transition-colors dark:bg-slate-950 dark:text-slate-100">
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
