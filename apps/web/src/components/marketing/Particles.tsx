'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Particles as TsParticles,
  ParticlesProvider,
  type ParticlesPluginRegistrar,
} from '@tsparticles/react';
import type { Engine, ISourceOptions } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';
import { useReducedMotion } from 'framer-motion';

/** Must stay a stable reference — ParticlesProvider enforces one init for the app. */
const initParticles: ParticlesPluginRegistrar = async (engine: Engine) => {
  await loadSlim(engine);
};

/**
 * Soft drifting particle field powered by tsParticles (no link web).
 * Color is inherited from Tailwind `text-*` classes on `className`
 * (e.g. `text-brand-500/70 dark:text-brand-300/50`).
 */
export default function Particles({
  className,
  density = 9000,
}: {
  className?: string;
  density?: number;
}) {
  return (
    <ParticlesProvider init={initParticles}>
      <ParticlesField className={className} density={density} />
    </ParticlesProvider>
  );
}

function ParticlesField({ className, density }: { className?: string; density: number }) {
  const reactId = useId().replace(/:/g, '');
  const hostRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [color, setColor] = useState('rgba(26, 139, 189, 0.7)');

  // Keep particle color in sync with theme / Tailwind text color on the host.
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const read = () => setColor(getComputedStyle(el).color);
    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', read);

    return () => {
      observer.disconnect();
      mq.removeEventListener('change', read);
    };
  }, []);

  const options = useMemo<ISourceOptions>(() => {
    const count = Math.min(90, Math.max(28, Math.round(700_000 / density)));

    return {
      fullScreen: { enable: false },
      background: { color: { value: 'transparent' } },
      fpsLimit: 60,
      detectRetina: true,
      pauseOnBlur: true,
      particles: {
        color: { value: color },
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
          value: { min: 0.25, max: 0.75 },
          animation: {
            enable: !reduce,
            speed: 0.6,
            sync: false,
            startValue: 'random',
          },
        },
        shape: { type: 'circle' },
        size: { value: { min: 1, max: 3.2 } },
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
  }, [color, density, reduce]);

  return (
    <div ref={hostRef} aria-hidden className={className}>
      <TsParticles id={`particles-${reactId}`} className="h-full w-full" options={options} />
    </div>
  );
}
