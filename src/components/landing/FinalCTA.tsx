import { Link } from "@tanstack/react-router";
import { ArrowRight, UtensilsCrossed, Building2, Shield, Zap, Heart, Sparkles } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const trustBadges = [
  { icon: Shield, label: "100% Free Forever" },
  { icon: Zap, label: "60-Sec Onboarding" },
  { icon: Heart, label: "Zero Food Wasted" },
];

export function FinalCTA() {
  const { ref, isIntersecting } = useIntersectionObserver();

  return (
    <section className="relative overflow-hidden py-36 bg-cta-gradient">
      {/* Background patterns and glowing horizons */}
      <div className="absolute inset-0 dot-grid opacity-[0.08] pointer-events-none" />

      {/* Radiant Glowing Horizon Orbs */}
      <div className="absolute top-[-140px] right-[-80px] w-[600px] h-[600px] rounded-full bg-amber-400/15 blur-[140px] pointer-events-none animate-glow-pulse" />
      <div className="absolute bottom-[-120px] left-[-80px] w-[500px] h-[500px] rounded-full bg-emerald-400/15 blur-[120px] pointer-events-none animate-glow-pulse" style={{ animationDelay: "1.8s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-emerald-500/10 blur-[180px] pointer-events-none" />

      <div
        ref={ref}
        className={`relative z-10 max-w-4xl mx-auto px-5 sm:px-8 text-center ${
          isIntersecting ? "animate-fade-up-blur opacity-100" : "opacity-0"
        }`}
      >
        {/* Eyebrow Pill */}
        <div className="mb-6 flex justify-center">
          <span className="glass-pill text-white text-xs font-extrabold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Join 850+ Active Food Heroes</span>
          </span>
        </div>

        {/* Headline */}
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-[-0.03em] leading-[1.06]"
        >
          Ready to turn surplus food into{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 drop-shadow-sm">
            life-saving meals?
          </span>
        </h2>

        {/* Subtitle */}
        <p
          className="mt-6 text-white/80 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed font-normal"
        >
          Join hundreds of restaurants, hotels, households, and NGOs using ShareABite to eradicate hunger and food waste in your city today.
        </p>

        {/* Action Buttons */}
        <div
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center"
        >
          <Link
            to="/login"
            className="group inline-flex items-center justify-center gap-3 rounded-2xl px-9 py-4.5 text-sm font-extrabold transition-all duration-300 active:scale-[0.97] bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 text-amber-950 shadow-[0_8px_35px_rgba(251,191,36,0.45)] hover:shadow-[0_12px_45px_rgba(251,191,36,0.65)] hover:-translate-y-1"
          >
            <UtensilsCrossed className="w-5 h-5" />
            Donate Surplus Food
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2.5 rounded-2xl border border-white/30 bg-white/10 text-white px-9 py-4.5 text-sm font-bold hover:bg-white/20 hover:border-white/45 backdrop-blur-md transition-all duration-200 active:scale-[0.97] hover:-translate-y-1"
          >
            <Building2 className="w-5 h-5 text-emerald-300" />
            Register as NGO / Shelter
          </Link>
        </div>

        {/* Trust Badges */}
        <div
          className="mt-12 flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-white/10"
        >
          {trustBadges.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 text-white/70 text-xs font-bold">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center border border-white/15">
                <Icon className="w-3.5 h-3.5 text-emerald-300" />
              </div>
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
