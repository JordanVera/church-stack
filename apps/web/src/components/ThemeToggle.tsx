'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Theme is only known on the client, so wait until after mount to render the
  // correct icon and avoid a hydration mismatch.
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="rounded-lg border-ink-200 text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white"
    >
      {mounted && isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
