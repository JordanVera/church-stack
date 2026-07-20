'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  ParticlesProvider,
  type ParticlesPluginRegistrar,
  useParticlesProvider,
} from '@tsparticles/react';
import { tsParticles, type Container, type Engine, type ISourceOptions } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';
import { useReducedMotion } from 'framer-motion';
import { useTheme } from 'next-themes';

/** Must stay a stable reference — ParticlesProvider enforces one init for the app. */
const initParticles: ParticlesPluginRegistrar = async (engine: Engine) => {
  await loadSlim(engine);
};

const LIGHT_COLOR = '#105675'; // brand-700 — readable on pale backgrounds
const DARK_COLOR = '#8ad0ef'; // brand-300

/**
 * Soft drifting particle field powered by tsParticles (no link web).
 * Colors use brand theme tokens — not computed `text-*` styles — so they
 * stay correct under Tailwind v4 (oklch / color-mix) in light and dark mode.
 *
 * Loads against a real container element (never by id alone). If tsparticles
 * can't find an id during an async race, it appends a canvas to `document.body`
 * — which shows up as floating particles after the footer (esp. Firefox + dark).
 */
export default function Particles({
  className,
  density = 9000,
  lightColor = LIGHT_COLOR,
  darkColor = DARK_COLOR,
}: {
  className?: string;
  density?: number;
  /** Hex color used in light mode. */
  lightColor?: string;
  /** Hex color used in dark mode. */
  darkColor?: string;
}) {
  return (
    <ParticlesProvider init={initParticles}>
      <ParticlesField
        className={className}
        density={density}
        lightColor={lightColor}
        darkColor={darkColor}
      />
    </ParticlesProvider>
  );
}

function ParticlesField({
  className,
  density,
  lightColor,
  darkColor,
}: {
  className?: string;
  density: number;
  lightColor: string;
  darkColor: string;
}) {
  const reactId = useId().replace(/:/g, '');
  const hostRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<Container | undefined>(undefined);
  const reduce = useReducedMotion();
  const { loaded } = useParticlesProvider();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Wait until next-themes has resolved so the first load uses the correct palette.
  const themeReady = mounted && resolvedTheme != null;
  const isDark = resolvedTheme === 'dark';
  const color = isDark ? darkColor : lightColor;

  const options = useMemo<ISourceOptions>(() => {
    const count = Math.min(90, Math.max(28, Math.round(700_000 / density)));

    return {
      fullScreen: { enable: false },
      background: { color: { value: 'transparent' } },
      fpsLimit: 60,
      detectRetina: true,
      pauseOnBlur: true,
      particles: {
        // tsParticles v4 moved particle color under `paint.color`;
        // the old top-level `color` key is silently ignored (defaults to white).
        paint: { color: { value: color } },
        links: { enable: false },
        move: {
          enable: !reduce,
          direction: 'none',
          speed: { min: 0.25, max: 0.9 },
          random: true,
          straight: false,
          outModes: { default: 'out' },
        },
        number: {
          density: { enable: true, width: 1280, height: 720 },
          value: count,
        },
        opacity: {
          value: isDark ? { min: 0.35, max: 0.75 } : { min: 0.55, max: 0.95 },
          animation: {
            enable: !reduce,
            speed: 0.6,
            sync: false,
            startValue: 'random',
          },
        },
        shape: { type: 'circle' },
        size: { value: { min: 1.2, max: 3.4 } },
      },
      interactivity: {
        detectsOn: 'window',
        events: {
          onHover: {
            enable: !reduce,
            mode: 'repulse',
          },
        },
        modes: {
          repulse: {
            distance: 70,
            duration: 0.3,
            factor: 1.2,
            speed: 0.4,
            maxSpeed: 1.5,
          },
        },
      },
    };
  }, [color, density, isDark, reduce]);

  useEffect(() => {
    if (!loaded || !themeReady) return;

    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    const id = `particles-${reactId}`;

    void tsParticles.load({ id, element: host, options }).then((container) => {
      if (cancelled || !container || container.destroyed) {
        container?.destroy();
        return;
      }
      // Host unmounted during the async load — never keep an orphaned instance.
      if (!host.isConnected) {
        container.destroy();
        return;
      }
      containerRef.current = container;
    });

    return () => {
      cancelled = true;
      containerRef.current?.destroy();
      containerRef.current = undefined;
    };
  }, [loaded, themeReady, options, reactId]);

  return (
    <div
      ref={hostRef}
      aria-hidden
      className={`overflow-hidden [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full ${className ?? ''}`}
    />
  );
}
