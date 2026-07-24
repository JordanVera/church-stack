'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

type Props = {
  children: React.ReactNode;
  /** Church-configured default; visitors can still toggle. */
  defaultTheme?: 'light' | 'dark';
};

export default function ThemeProvider({ children, defaultTheme = 'light' }: Props) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
