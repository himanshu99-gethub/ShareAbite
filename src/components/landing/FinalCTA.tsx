import { Link } from "@tanstack/react-router";
import { ArrowRight, UtensilsCrossed, Building2, Shield, Zap, Heart } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const trustBadges = [
  { icon: Shield, label: "Free forever" },
  { icon: Zap,    label: "Setup in 60 sec" },
  { icon: Heart,  label: "Zero food wasted" },
];

export function FinalCTA() {
  const { ref, isIntersecting } = useIntersectionObserver();

  return (
    <section className="relative overflow-hidden py-32">
      {/* Multi-layer gradient background */}
      <div className="absolute inset-0 bg-cta-gradient" />
      <div className="absolute inset-0 dot-grid opacity-[0.08]" />

      {/* Animated glow orbs */}
      <div className="absolute top-[-100px] right-[-50px] w-[500px] h-[500px] rounded-full bg-amber-400/12 blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-[-80px] left-[-60px] w-[400px] h-[400px] rounded-full bg-emerald-400/10 blur-[100px] animate-glow-pulse" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-600/5 blur-[150px] pointer-events-none" />

      <div
        ref={ref}
        className={`relative z-10 max-w-3xl mx-auto px-5 text-center opacity-0 ${
          isIntersecting ? "animate-fade-up-blur opacity-100" : ""
        }`}
      >
        {/* Eyebrow */}
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white/80 text-xs font-semibold tracking-wide mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Join the movement
        </span>

        {/* Headline */}
        <h2
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight"
          style={{ lineHeight: "1.08" }}
        >
          Ready to make a{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
            difference?
          </span>
        </h2>

        {/* Sub-copy */}
        <p
          className="mt-6 text-white/70 max-w-xl mx-auto text-lg leading-relaxed"
          style={{ textWrap: "pretty" } as React.CSSProperties}
        >
          Join hundreds of restaurants, households, and NGOs already using
          ShareABite to fight hunger and food waste — together.
        </p>

        {/* CTA Buttons */}
        <div
          className={`mt-10 flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center opacity-0 ${
            isIntersecting ? "animate-fade-up-blur opacity-100" : ""
          }`}
          style={{ animationDelay: "200ms" }}
        >
          <Link
            to="/login"
            className="group inline-flex items-center justify-center gap-2.5 rounded-xl px-8 py-4 text-sm font-bold transition-all duration-300 active:scale-[0.97] bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-[0_6px_30px_rgba(251,191,36,0.35)] hover:shadow-[0_8px_40px_rgba(251,191,36,0.55)] hover:-translate-y-1"
          >
            <UtensilsCrossed className="w-4 h-4" />
            I want to donate food
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 text-white px-8 py-4 text-sm font-semibold hover:bg-white/18 backdrop-blur-sm transition-all duration-200 active:scale-[0.97] hover:-translate-y-1"
          >
            <Building2 className="w-4 h-4 text-white/70" />
            My NGO needs food
          </Link>
        </div>

        {/* Trust Badges */}
        <div
          className={`mt-10 flex flex-wrap items-center justify-center gap-6 opacity-0 ${
            isIntersecting ? "animate-fade-in opacity-100" : ""
          }`}
          style={{ animationDelay: "400ms" }}
        >
          {trustBadges.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-white/50 text-xs font-medium">
              <Icon className="w-3.5 h-3.5 text-white/40" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
