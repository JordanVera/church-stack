import Hero from '@/components/marketing/Hero';
import LogoMarquee from '@/components/marketing/LogoMarquee';
import BigStatement from '@/components/marketing/BigStatement';
import Features from '@/components/marketing/Features';
import Showcase from '@/components/marketing/Showcase';
import HowItWorks from '@/components/marketing/HowItWorks';
import PlanningCenter from '@/components/marketing/PlanningCenter';
import CTA from '@/components/marketing/CTA';

export default function HomePage() {
  return (
    <div>
      <Hero />
      <LogoMarquee />
      <BigStatement />
      <Features />
      <Showcase />
      <HowItWorks />
      <PlanningCenter />
      <CTA />
    </div>
  );
}
