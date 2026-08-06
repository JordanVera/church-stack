'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Reveal } from '@/components/motion';

const faqs = [
  {
    question: 'What is Gatherly Stack?',
    answer:
      'Gatherly Stack gives your church a white-label website and church-named mobile apps, managed from one dashboard. Publish events, announcements, sermons, and locations once — they update everywhere at once.',
  },
  {
    question: 'Do we get our own branded website and apps?',
    answer:
      'Yes. Every plan includes a white-label site on your domain and white-label iOS & Android apps under your church’s name — not a shared “powered by” experience for your congregation.',
  },
  {
    question: 'Can we sync with Planning Center?',
    answer:
      'Yes. Connect a Planning Center Personal Access Token to import campuses and service times, then keep syncing from Integrations when you are ready. Full PCO surface sync is optional — you can launch without it.',
  },
  {
    question: 'How is giving handled?',
    answer:
      'We never process gifts ourselves. Point visitors to Tithe.ly, Pushpay, or your existing giving page. Giving integration is included on Growth and Custom plans.',
  },
  {
    question: 'What’s the difference between Site, Growth, and Custom?',
    answer:
      'Site covers white-label web and apps with hosted content and optional Planning Center sync. Growth adds giving, richer content types, and priority support. Custom includes a fully custom Next.js website plus dedicated support — still on the same shared database as your apps.',
  },
  {
    question: 'How long does it take to go live?',
    answer:
      'Most churches can go from signup to a live branded site in days, not months — without waiting on an agency or custom build. Native apps ship on a white-label build cadence; Custom plans can go further with bespoke site work.',
  },
  {
    question: 'Can we cancel anytime?',
    answer:
      'Yes. Plans are billed monthly and you can cancel anytime. See pricing for current tiers and what’s included on each.',
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="relative scroll-mt-24 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand-500 dark:text-brand-400">
            FAQ
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl dark:text-white">
            Questions, answered
          </h2>
          <p className="mt-4 text-lg text-ink-600 dark:text-ink-300">
            Straight answers about branding, Planning Center, giving, and plans — so you know what
            you&apos;re getting before you start.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mx-auto mt-14 max-w-3xl">
          <Accordion className="w-full">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.question}
                value={faq.question}
                className="border-ink-200 dark:border-white/10"
              >
                <AccordionTrigger className="py-5 font-display text-base font-semibold text-ink-900 hover:no-underline sm:text-lg dark:text-white">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-base leading-relaxed text-ink-600 dark:text-ink-300">
                  <p>{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
