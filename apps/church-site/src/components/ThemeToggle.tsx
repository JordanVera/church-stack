'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

type Props = {
  className?: string;
  /** When true, use light-on-brand styling (over hero). */
  onBrand?: boolean;
};

export function ThemeToggle({ className = '', onBrand = false }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      // Keep label stable until mounted — resolvedTheme differs server vs client.
      aria-label={
        !mounted ? 'Toggle color theme' : isDark ? 'Switch to light mode' : 'Switch to dark mode'
      }
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition ${
        onBrand
          ? 'border border-white/25 bg-white/10 text-white hover:bg-white/15'
          : 'border border-[var(--site-line)] bg-[var(--site-band)] text-[var(--site-fg)] hover:bg-[var(--site-band-alt)]'
      } ${className}`}
    >
      {!mounted ? (
        <span className="h-4 w-4" />
      ) : isDark ? (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3a6.5 6.5 0 0 0 11.5 11.5Z" />
        </svg>
      )}
    </button>
  );
}
