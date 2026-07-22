import type { Metadata } from 'next';
import { Anton, Inter, Space_Grotesk } from 'next/font/google';
import { TRPCProvider } from '@/lib/trpc-provider';
import SessionProvider from '@/components/SessionProvider';
import ThemeProvider from '@/components/ThemeProvider';
import Header from '@/components/Header';
import { Toaster } from '@/components/ui/toaster';
import '@/styles/global.css';
import Footer from '@/components/marketing/Footer';

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

// Heavy condensed grotesque reserved for oversized editorial headlines (hero-style statements).
const hero = Anton({
  subsets: ['latin'],
  variable: '--font-hero',
  display: 'swap',
  weight: '400',
});

export const metadata: Metadata = {
  title: 'Church Stack — Whitelabel apps for churches',
  description:
    'Launch a beautiful, branded mobile app for your church in days, not months. Built for small and medium churches.',
  icons: {
    icon: '/brand/favico-logo.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${display.variable} ${hero.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="bg-white font-sans text-ink-900 antialiased transition-colors dark:bg-ink-950 dark:text-ink-100">
        <ThemeProvider>
          <SessionProvider>
            <TRPCProvider>
              <Header />
              <main>{children}</main>
              <Footer />
              <Toaster />
            </TRPCProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
