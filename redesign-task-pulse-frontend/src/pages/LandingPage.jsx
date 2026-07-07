import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import LogoCloud from "@/components/marketing/LogoCloud";
import FeatureBento from "@/components/marketing/FeatureBento";
import AIShowcase from "@/components/marketing/AIShowcase";
import HowItWorks from "@/components/marketing/HowItWorks";
import Testimonials from "@/components/marketing/Testimonials";
import Pricing from "@/components/marketing/Pricing";
import CTA from "@/components/marketing/CTA";
import Footer from "@/components/marketing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-foreground">
      <Navbar />
      <main>
        <Hero />
        <LogoCloud />
        <FeatureBento />
        <AIShowcase />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
