import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Uniwind, useUniwind } from 'uniwind';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { appearanceStore, type AppearancePreference } from '../lib/appearance-store';

interface AppearanceContextValue {
  /** Resolved theme currently rendering (`light` | `dark`). */
  theme: 'light' | 'dark';
  /** User preference including system. */
  preference: AppearancePreference;
  setPreference: (next: AppearancePreference) => void;
  isReady: boolean;
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

function applyPreference(pref: AppearancePreference) {
  Uniwind.setTheme(pref);
}

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const [preference, setPreferenceState] = useState<AppearancePreference>('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await appearanceStore.get();
      if (cancelled) return;
      const next = stored ?? 'system';
      setPreferenceState(next);
      applyPreference(next);
      setIsReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const bg = theme === 'dark' ? '#22181c' : '#ffffff';
    void SystemUI.setBackgroundColorAsync(bg);
  }, [theme, isReady]);

  const setPreference = useCallback((next: AppearancePreference) => {
    setPreferenceState(next);
    applyPreference(next);
    void appearanceStore.set(next);
  }, []);

  const value = useMemo<AppearanceContextValue>(() => {
    const resolved = (theme === 'dark' ? 'dark' : 'light') as 'light' | 'dark';
    const pref: AppearancePreference = hasAdaptiveThemes ? 'system' : resolved;
    return {
      theme: resolved,
      // Prefer local state (source of truth after hydrate); fall back to uniwind.
      preference: isReady ? preference : pref,
      setPreference,
      isReady,
    };
  }, [theme, hasAdaptiveThemes, preference, setPreference, isReady]);

  return (
    <AppearanceContext.Provider value={value}>
      <StatusBar style={value.theme === 'dark' ? 'light' : 'dark'} />
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error('useAppearance must be used within an AppearanceProvider');
  return ctx;
}
