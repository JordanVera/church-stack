'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Gauge, Lock, Search, Server, Shield, Sparkles, FileCode2 } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';

const seoPoints = [
  {
    title: 'Crawlable HTML from the first request',
    body: 'Next.js renders real pages on the server — titles, headings, sermon copy, event details, and location info are in the HTML Googlebot downloads. Wix and WordPress page builders often lean on heavy client scripts; search engines have to wait, guess, or miss content that only appears after JavaScript runs.',
  },
  {
    title: 'You own every ranking signal',
    body: 'Meta titles, descriptions, Open Graph tags, canonical URLs, XML sitemaps, robots rules, and structured data (JSON-LD for Organization, Event, Place, and FAQ) are first-class — not buried behind a theme plugin or a template that shares markup with thousands of other churches.',
  },
  {
    title: 'Speed is an SEO feature',
    body: 'Core Web Vitals — Largest Contentful Paint, Interaction to Next Paint, Cumulative Layout Shift — are ranking factors. A custom Next.js site ships only the code your church needs: image optimization, route-level code splitting, and edge caching. Template sites drag along unused widgets, third-party trackers, and theme bloat that quietly tank scores.',
  },
];

export default function WhyCustom() {
  const reduce = useReducedMotion();

  return (
    <section
      id="why-custom"
      className="relative scroll-mt-24 overflow-hidden bg-ink-950 py-12 mb-24 text-white"
    >
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand-300">
            Why not Wix or WordPress
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            A custom Next.js site is built to be found
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/65">
            Template builders are fine for a brochure. Churches need to show up when someone
            searches “church near me,” “Sunday service times,” or your campus name. Church Stack
            sites are custom Next.js applications — engineered for search engines first, not bolted
            onto a generic page builder after the fact.
          </p>
        </Reveal>
        {/* SEO deep-dive — the section's main job */}
        <Reveal
          delay={0.1}
          className="relative mt-16 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 sm:p-10 lg:p-12"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-14">
            <div className="lg:max-w-sm lg:shrink-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/35 bg-brand-500/20 px-3.5 py-1.5 text-xs font-bold tracking-[0.18em] text-brand-200 uppercase">
                <Search className="h-3.5 w-3.5" />
                SEO advantage
              </div>
              <h3 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Search is how new families find you
              </h3>
              <p className="mt-4 text-base leading-relaxed text-white/60">
                Google rewards sites that load fast, answer clearly, and expose structured content.
                Wix and WordPress themes optimize for editing convenience. Custom Next.js optimizes
                for being ranked — and staying ranked as you publish.
              </p>
              {!reduce && (
                <motion.p
                  className="mt-6 font-mono text-xs tracking-[0.2em] text-brand-300 uppercase"
                  animate={{ opacity: [0.55, 1, 0.55] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  Indexable · Fast · Owned
                </motion.p>
              )}
            </div>

            <Stagger className="flex flex-1 flex-col gap-6 border-t border-white/10 pt-8 lg:border-l lg:border-t-0 lg:pl-14 lg:pt-0">
              {seoPoints.map((point) => (
                <StaggerItem key={point.title}>
                  <h4 className="font-display text-lg font-semibold text-white">{point.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{point.body}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Reveal>
        {/* Comparison callouts */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Reveal delay={0.05}>
            <div className="h-full rounded-3xl border border-white/10 bg-white/[0.03] px-7 py-8">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-white/40 uppercase">
                Wix &amp; WordPress
              </p>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-white/50">
                <li>Shared themes and plugins that look — and rank — like everyone else</li>
                <li>Bloated scripts that hurt Core Web Vitals and mobile rankings</li>
                <li>Limited or opaque control over crawl rules, schema, and canonicals</li>
                <li>SEO equity tied to a platform stack you don’t fully own</li>
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="h-full rounded-3xl border border-brand-400/30 bg-brand-500/10 px-7 py-8">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-brand-300 uppercase">
                Custom Next.js
              </p>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-brand-100/85">
                <li>Server-rendered pages search engines can index on contact</li>
                <li>Full control of metadata, sitemaps, redirects, and structured data</li>
                <li>Lean bundles tuned for Core Web Vitals and local search</li>
                <li>Your domain, your code, your rankings — year after year</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
