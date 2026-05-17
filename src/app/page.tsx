import { NavBar } from '@/components/NavBar';
import { Hero } from '@/components/Hero';
import { TheProblem } from '@/components/TheProblem';
import { FourSections } from '@/components/FourSections';
import { HowItWorks } from '@/components/HowItWorks';
import { SamplePreview } from '@/components/SamplePreview';
import { RhythmProfile } from '@/components/RhythmProfile';
import { FounderNote } from '@/components/FounderNote';
import { Pricing } from '@/components/Pricing';
import { Faq } from '@/components/Faq';
import { FirstObject } from '@/components/FirstObject';
import { Footer } from '@/components/Footer';
import { daysUntilNextShuklaPratipada } from '@/lib/vedic-date';

export default function Page() {
  const daysToNext = daysUntilNextShuklaPratipada();
  return (
    <>
      <NavBar />
      <main id="top">
        <Hero />
        <TheProblem />
        <FourSections />
        <HowItWorks />
        <SamplePreview />
        <RhythmProfile />
        <FounderNote />
        <Pricing />
        <Faq />
        <FirstObject />
      </main>
      <Footer daysToNext={daysToNext} />
    </>
  );
}
