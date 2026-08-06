'use client';

import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type HTMLMotionProps,
  type Variants,
} from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';

type MotionTag = keyof typeof motion;

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Fade + rise into view once. The workhorse used across marketing sections.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  as = 'div',
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: MotionTag;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;

  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/** Container that staggers its <StaggerItem/> children as they enter the viewport. */
export function Stagger({
  children,
  className,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reduce ? undefined : containerVariants}
      initial={reduce ? false : 'hidden'}
      whileInView={reduce ? undefined : 'show'}
      viewport={{ once, margin: '-80px' }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  ...rest
}: { children: ReactNode; className?: string } & HTMLMotionProps<'div'>) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} variants={reduce ? undefined : itemVariants} {...rest}>
      {children}
    </motion.div>
  );
}

/**
 * Big editorial headline that reveals word-by-word — the signature hero move.
 * `highlight` words render in the brand color.
 */
export function WordReveal({
  text,
  className,
  highlight = [],
  delay = 0,
}: {
  text: string;
  className?: string;
  highlight?: string[];
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const words = text.split(' ');
  const highlighted = new Set(highlight.map((w) => w.toLowerCase()));

  return (
    <span className={className}>
      {words.map((word, i) => {
        const isHot = highlighted.has(word.replace(/[.,]/g, '').toLowerCase());
        return (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
            <motion.span
              className={`inline-block ${isHot ? 'text-brand-500 dark:text-brand-300' : ''}`}
              initial={reduce ? false : { y: '110%' }}
              whileInView={reduce ? undefined : { y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: delay + i * 0.08, ease: EASE }}
            >
              {word}
              {i < words.length - 1 ? '\u00A0' : ''}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

/**
 * A single big line that slides up from behind a mask as it enters view.
 * Compose several for the oversized editorial statement blocks.
 *
 * Pass `eager` for content that's visible on load (e.g. a hero headline) —
 * it animates immediately via `animate` instead of waiting on `whileInView`,
 * which can fail to fire for elements that are already in the viewport
 * before layout has fully settled (leaving them stuck masked/invisible).
 */
export function LineReveal({
  children,
  className,
  delay = 0,
  eager = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  eager?: boolean;
}) {
  const reduce = useReducedMotion();
  // Observe the mask wrapper — not the transformed child. `whileInView` on the
  // sliding span fails because overflow-hidden + y:115% yields zero intersection,
  // leaving the line stuck invisible forever.
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const show = reduce || eager || inView;

  return (
    <span ref={ref} className="block overflow-hidden">
      <motion.span
        className={`block ${className ?? ''}`}
        initial={reduce ? false : { y: '115%' }}
        animate={reduce ? undefined : show ? { y: 0 } : { y: '115%' }}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/**
 * Translates its children vertically as the user scrolls past — subtle depth.
 * `speed` is the total travel in px across the element's scroll range.
 */
export function Parallax({
  children,
  className,
  speed = 60,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);

  return (
    <div ref={ref} className={className}>
      {/* Fill the parent so transform doesn't collapse absolute/fill children to 0 height. */}
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y }}>
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Counts up from 0 to `value` once it scrolls into view. Renders `prefix`/`suffix`
 * around the number so callers can wrap things like "$" or "+" without extra markup.
 *
 * Pass `eager` for hero (or other above-the-fold) stats — IntersectionObserver with a
 * shrunk rootMargin often never fires for elements already in view on short mobile
 * viewports, leaving the count stuck at 0.
 *
 * Display uses React state (not MotionValue-as-children) so the digits update reliably
 * on mobile Safari.
 */
export function Counter({
  value,
  duration = 1.6,
  delay = 0,
  prefix = '',
  suffix = '',
  className,
  eager = false,
}: {
  value: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  eager?: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4, margin: '0px 0px -12% 0px' });
  const shouldRun = reduce || eager || inView;
  const [display, setDisplay] = useState(() =>
    reduce ? `${prefix}${value}${suffix}` : `${prefix}0${suffix}`
  );

  useEffect(() => {
    if (!shouldRun) return;
    if (reduce) {
      setDisplay(`${prefix}${value}${suffix}`);
      return;
    }

    let controls: ReturnType<typeof animate> | undefined;
    const timeout = window.setTimeout(() => {
      controls = animate(0, value, {
        duration,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (latest) => {
          setDisplay(`${prefix}${Math.round(latest)}${suffix}`);
        },
        onComplete: () => setDisplay(`${prefix}${value}${suffix}`),
      });
    }, delay * 1000);

    return () => {
      window.clearTimeout(timeout);
      controls?.stop();
    };
  }, [shouldRun, reduce, value, duration, delay, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

/**
 * A vertical line whose fill height tracks scroll progress through `containerRef`.
 * Drop inside a `relative` container alongside the content it should trace.
 */
export function ScrollLine({
  containerRef,
  className,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  return (
    <div className={`absolute w-px bg-ink-200 dark:bg-ink-800 ${className ?? ''}`}>
      <motion.div
        className="w-full origin-top bg-brand-500 dark:bg-brand-400"
        style={{ scaleY: reduce ? 1 : scrollYProgress, height: '100%' }}
      />
    </div>
  );
}

/**
 * Infinite horizontal marquee. Pass pre-duplicated `children` sized for one loop —
 * the track renders two copies back to back and scrolls the whole thing left.
 */
export function Marquee({
  children,
  className,
  duration = 32,
  reverse = false,
  mask = true,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  reverse?: boolean;
  mask?: boolean;
}) {
  return (
    <div className={`flex overflow-hidden ${mask ? 'marquee-mask' : ''} ${className ?? ''}`}>
      <motion.div
        className="flex items-center shrink-0"
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

/** Generic passthrough for ad-hoc motion needs without re-importing framer-motion. */
export const M = motion;
