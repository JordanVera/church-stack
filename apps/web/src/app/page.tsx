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

export default function HomePage() {
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
