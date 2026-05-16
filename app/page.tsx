import { Navbar } from "@/components/organisms/Navbar/Navbar";
import { HeroSection } from "@/components/organisms/HeroSection/HeroSection";
import { ProblemsSection } from "@/components/organisms/ProblemsSection/ProblemsSection";
import { SolutionsSection } from "@/components/organisms/SolutionsSection/SolutionsSection";
import { PricingCalculator } from "@/components/organisms/PricingCalculator/PricingCalculator";
import { WaitlistForm } from "@/components/organisms/WaitlistForm/WaitlistForm";
import { Footer } from "@/components/organisms/Footer/Footer";
import FAQ from "@/components/organisms/FAQ/FAQ";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <ProblemsSection />
        <SolutionsSection />
        <PricingCalculator />
        <WaitlistForm />
        <FAQ/>
      </main>
      <Footer />
    </>
  );
}
