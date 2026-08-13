import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { HeroSection } from "@/components/landing/HeroSection";
import { StatsBar } from "@/components/landing/StatsBar";
import { ImpactDashboard } from "@/components/landing/ImpactDashboard";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { LiveMapSection } from "@/components/landing/LiveMapSection";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "ShareABite — Connect Surplus Food to Those Who Need It" },
      { name: "description", content: "ShareABite bridges the gap between food surplus and hunger. Restaurants and households donate food; nearby NGOs and shelters receive it in minutes." },
    ],
  }),
});

function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    import("@/integrations/supabase/client").then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) navigate({ to: "/app" });
      });
    }).catch(() => {});
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <HeroSection />
      <StatsBar />
      <ImpactDashboard />
      <FeaturesSection />
      <HowItWorksSection />
      <LiveMapSection />
      <TestimonialsSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
