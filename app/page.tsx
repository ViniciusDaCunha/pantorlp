"use client";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/organisms/Navbar/Navbar";
import { HeroSection } from "@/components/organisms/HeroSection/HeroSection";
import { ProblemsSection } from "@/components/organisms/ProblemsSection/ProblemsSection";
import { SolutionsSection } from "@/components/organisms/SolutionsSection/SolutionsSection";

// Lazy load below-the-fold sections for performance
const PricingCalculator = dynamic(
  () => import("@/components/organisms/PricingCalculator/PricingCalculator").then((m) => m.PricingCalculator),
  { ssr: false, loading: () => <div style={{ height: "400px" }} aria-label="Carregando calculadora..." /> }
);

const WaitlistForm = dynamic(
  () => import("@/components/organisms/WaitlistForm/WaitlistForm").then((m) => m.WaitlistForm),
  { ssr: false, loading: () => <div style={{ height: "400px" }} aria-label="Carregando formulário..." /> }
);

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
