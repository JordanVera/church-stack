import Link from 'next/link';
import Image from 'next/image';
import { Smartphone, Palette, Zap, CalendarDays, HandHeart, Megaphone } from 'lucide-react';

const features = [
  {
    icon: Palette,
    title: 'Fully whitelabel',
    body: 'Your name, your logo, your colors. Every app is branded for the individual church, top to bottom.',
  },
  {
    icon: Zap,
    title: 'Launch in days',
    body: 'One shared codebase, per-church config. Spin up a new church app without touching code.',
  },
  {
    icon: Megaphone,
    title: 'Announcements',
    body: 'Push the week’s news straight to members’ phones and keep everyone in the loop.',
  },
  {
    icon: CalendarDays,
    title: 'Events',
    body: 'Service times, small groups, and special events — always up to date.',
  },
  {
    icon: HandHeart,
    title: 'Giving-ready',
    body: 'Built with giving in mind so congregations can support the mission with a tap.',
  },
  {
    icon: Smartphone,
    title: 'iOS & Android',
    body: 'A single React Native app that ships to both stores from the same foundation.',
  },
];

const steps = [
  { n: '01', title: 'Add the church', body: 'Create a tenant with its name, branding, and feature flags.' },
  { n: '02', title: 'Brand it', body: 'Colors and logo flow into the app automatically at runtime.' },
  { n: '03', title: 'Ship it', body: 'Generate a per-church build and publish to the App Store & Google Play.' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-sm font-medium text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
              Whitelabel church apps, done fast
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:mx-0 dark:text-white">
              A branded mobile app for every church.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 lg:mx-0 dark:text-slate-300">
              Church Stack is the platform for building and shipping beautiful, whitelabel apps for
              small and medium churches — quickly and repeatably.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4 lg:justify-start">
              <Link
                href="/signup"
                className="rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-500"
              >
                Start building
              </Link>
              <Link
                href="/#features"
                className="rounded-xl border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                See features
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl ring-1 ring-slate-900/10 dark:ring-white/10">
              <Image
                src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80"
                alt="A church congregation gathered together"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Everything a church needs, out of the box
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Start with a solid foundation and customize per church.
          </p>
        </div>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Showcase */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid items-center gap-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:grid-cols-2 lg:p-12 dark:border-slate-800 dark:bg-slate-900">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-slate-900/10 dark:ring-white/10">
            <Image
              src="https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=1200&q=80"
              alt="Interior of a modern church building"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Built for the way churches actually work
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              From the smallest congregation to a growing multi-site network, Church Stack keeps every
              community connected with a home in their pocket — announcements, events, and giving all
              in one branded place.
            </p>
            <Link
              href="/pricing"
              className="mt-8 inline-block rounded-xl border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-slate-50 py-20 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              From zero to published in three steps
            </h2>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900">
                <div className="text-4xl font-bold text-indigo-200 dark:text-indigo-500/40">{s.n}</div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="rounded-3xl bg-indigo-600 px-8 py-16 text-center shadow-lg dark:bg-indigo-700">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Ready to launch your church’s app?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-indigo-100">
            Join churches shipping modern apps without the six-figure agency invoice.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-xl bg-white px-6 py-3 text-base font-semibold text-indigo-700 transition hover:bg-indigo-50"
          >
            Get started free
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-10 dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-6 text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} Church Stack. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
