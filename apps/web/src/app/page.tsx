import { redirect } from 'next/navigation';
import Hero from '@/components/marketing/Hero';
import LogoMarquee from '@/components/marketing/LogoMarquee';
import BigStatement from '@/components/marketing/BigStatement';
import Features from '@/components/marketing/Features';
import Showcase from '@/components/marketing/Showcase';
import WhyCustom from '@/components/marketing/WhyCustom';
import HowItWorks from '@/components/marketing/HowItWorks';
import PlanningCenter from '@/components/marketing/PlanningCenter';
import MobileApp from '@/components/marketing/MobileApp';
import FAQ from '@/components/marketing/FAQ';
import CTA from '@/components/marketing/CTA';

type PageProps = {
  searchParams: Promise<{ slug?: string }>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const slug = params.slug?.trim();
  if (slug) {
    const base =
      process.env.NEXT_PUBLIC_CHURCH_SITE_PREVIEW_URL?.replace(/\/$/, '') ??
      'http://localhost:3001';
    redirect(`${base}?slug=${encodeURIComponent(slug)}`);
  }

  return (
    <div>
      <Hero />
      <LogoMarquee />
      <Features />
      <BigStatement />
      <Showcase />
      <HowItWorks />
      <PlanningCenter />
      <WhyCustom />
      <MobileApp />
      <FAQ />
      <CTA />
    </div>
  );
}
