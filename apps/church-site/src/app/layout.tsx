import type { Metadata } from 'next';
import { Fraunces, Source_Sans_3 } from 'next/font/google';
import '@/styles/global.css';

const sans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Church site',
  description: 'Your church website, powered by Church Stack.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <body className="bg-[var(--site-bg)] font-[family-name:var(--font-sans)] text-[var(--site-fg)] antialiased">
        {children}
      </body>
    </html>
  );
}
