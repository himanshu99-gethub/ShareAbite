import { Link } from "@tanstack/react-router";
import { 
  Leaf, 
  ArrowRight, 
  ChevronDown, 
  UtensilsCrossed, 
  Building2, 
  Sparkles, 
  Shield, 
  Zap, 
  HeartHandshake
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { Interactive3DCanvas } from "@/components/ui/Interactive3DCanvas";
import { Hero3DMatrix } from "@/components/ui/Hero3DMatrix";

export function HeroSection() {

  return (
    <>
      {/* ══════════ SLEEK APPLE-GRADE NAVBAR ══════════ */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-emerald-950/90 dark:bg-black/90 backdrop-blur-2xl border-b border-white/10 shadow-[0_2px_20px_rgba(0,0,0,0.35)] transition-all duration-300">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 w-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-xl bg-emerald-400/40 blur-sm group-hover:blur-md transition-all duration-300" />
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-700 flex items-center justify-center border border-white/30 shadow-[0_2px_12px_rgba(16,185,129,0.5)] group-hover:scale-105 transition-transform duration-300">
                <Leaf className="w-4 h-4 text-white drop-shadow-sm" />
              </div>
            </div>
            <span className="text-lg font-extrabold text-white tracking-tight">
              Share<span className="text-emerald-400">A</span>Bite
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-xl">
            {[
              { href: "#features", label: "Features" },
              { href: "#how-it-works", label: "How it works" },
              { href: "#live-map", label: "Live Radar" },
              { href: "#testimonials", label: "Stories" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white/80 hover:text-white hover:bg-white/15 transition-all duration-200"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 text-white px-3.5 py-1.5 text-xs font-bold hover:bg-white/20 hover:border-white/35 backdrop-blur-md transition-all duration-200 active:scale-[0.97]"
            >
              Sign in
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 text-amber-950 px-4 py-1.5 text-xs font-extrabold hover:from-amber-300 hover:to-amber-400 transition-all duration-200 shadow-[0_3px_15px_rgba(251,191,36,0.4)] hover:shadow-[0_5px_22px_rgba(251,191,36,0.6)] active:scale-[0.97]"
            >
              Get started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* ══════════ 3D HERO SECTION (COMPACT & PROMINENT) ══════════ */}
      <section className="relative overflow-hidden min-h-[calc(100vh-3.5rem)] flex flex-col justify-center py-4 sm:py-6 lg:py-8 bg-hero-gradient">
        {/* Background Image Layer with Cinematic Ambient Blend */}
        <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden bg-emerald-950">
          <img
            src={heroImage}
            alt="ShareABite Community Action"
            className="w-full h-full object-cover opacity-30 pointer-events-none scale-105 filter saturate-125"
          />
        </div>

        {/* Dynamic Multi-layer Gradients */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-emerald-950/95 via-emerald-950/75 to-emerald-950/50 z-[1]" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-emerald-950 via-transparent to-black/40 z-[1]" />

        {/* Interactive 3D Particle Constellation Canvas */}
        <Interactive3DCanvas className="z-[2]" />

        {/* Ambient Atmospheric Lighting */}
        <div className="absolute -top-32 -left-20 w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[130px] pointer-events-none z-[1]" />
        <div className="absolute bottom-6 right-10 w-[450px] h-[450px] rounded-full bg-amber-400/15 blur-[120px] pointer-events-none z-[1]" />

        {/* ── Hero Container (2-Column 3D Split) ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-6 items-center">
            
            {/* Left Column: Editorial Typography & Magnetic CTAs */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">

              {/* Headline */}
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-[-0.03em] leading-[1.08]"
              >
                Your{" "}
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 drop-shadow-sm">
                    surplus food
                  </span>
                  <span className="absolute -bottom-0.5 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-transparent rounded-full" />
                </span>
                <br />
                turns into hope for families in minutes.
              </h1>

              {/* Subtitle */}
              <p
                className="mt-3.5 text-sm sm:text-base text-white/80 max-w-xl leading-relaxed font-normal"
              >
                ShareABite instantly bridges restaurants, caterers, and households with nearby verified NGOs and shelters. Post a donation in 60 seconds — feed those who need it most today.
              </p>

              {/* CTAs with Magnetic Glow */}
              <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <Link
                  to="/login"
                  className="group inline-flex items-center justify-center gap-2.5 rounded-xl px-7 py-3.5 text-xs sm:text-sm font-extrabold transition-all duration-300 active:scale-[0.97] bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 text-amber-950 shadow-[0_6px_25px_rgba(251,191,36,0.45)] hover:shadow-[0_8px_35px_rgba(251,191,36,0.65)] hover:-translate-y-0.5"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  Donate Surplus Food
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 text-white px-7 py-3.5 text-xs sm:text-sm font-bold hover:bg-white/20 hover:border-white/40 backdrop-blur-md transition-all duration-200 active:scale-[0.97] hover:-translate-y-0.5"
                >
                  <Building2 className="w-4 h-4 text-emerald-300" />
                  Register as NGO / Shelter
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-x-5 gap-y-2.5">
                {[
                  { icon: Shield, label: "100% Free Forever" },
                  { icon: Zap, label: "60-Second Setup" },
                  { icon: HeartHandshake, label: "Verified NGO Network" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs font-semibold text-white/70">
                    <div className="w-4.5 h-4.5 rounded-full bg-emerald-400/20 flex items-center justify-center">
                      <Icon className="w-3 h-3 text-emerald-300" />
                    </div>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: 3D Interactive Telemetry & Rescue Matrix */}
            <div className="lg:col-span-5 flex items-center justify-center w-full">
              <Hero3DMatrix />
            </div>

          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-4 flex flex-col items-center gap-1 animate-bounce pointer-events-none">
          <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Scroll to explore</span>
          <ChevronDown className="w-3.5 h-3.5 text-white/40" />
        </div>
      </section>
    </>
  );
}
