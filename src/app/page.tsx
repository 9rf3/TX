import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { WhyTwokax } from "@/components/landing/WhyTwokax";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { Community } from "@/components/landing/Community";
import { AISection } from "@/components/landing/AISection";
import { Stats } from "@/components/landing/Stats";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      <Navbar />
      <Hero />
      <WhyTwokax />
      <HowItWorks />
      <Features />
      <AISection />
      <Community />
      <Stats />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
