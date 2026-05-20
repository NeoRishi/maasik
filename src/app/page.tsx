import { NavBar } from '@/components/NavBar';
import { Hero } from '@/components/Hero';
import { InsideEdition } from '@/components/InsideEdition';
import { WhyItWorks } from '@/components/WhyItWorks';
import { FounderNote } from '@/components/FounderNote';
import { Pricing } from '@/components/Pricing';
import { Faq } from '@/components/Faq';
import { FinalCta } from '@/components/FinalCta';
import { Footer } from '@/components/Footer';

export default function Page() {
  return (
    <>
      <NavBar />
      <main id="top">
        <Hero />
        <InsideEdition />
        <WhyItWorks />
        <FounderNote />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
