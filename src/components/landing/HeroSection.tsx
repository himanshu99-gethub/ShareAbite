import { Link } from "@tanstack/react-router";
import { Leaf, ArrowRight, ChevronDown, UtensilsCrossed, Building2 } from "lucide-react";
import { Hero3dBackground } from "./Hero3dBackground";

/* ─── Floating Background Orbs ─── */
function FloatingOrb({ className }: { className: string }) {
  return <div className={`absolute rounded-full pointer-events-none animate-glow-pulse ${className}`} />;
}

/* ─── Main HeroSection ─── */
export function HeroSection() {
  return (
    <>
      {/* ══════════ FLOATING ISLAND NAVBAR ══════════ */}
      <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 pointer-events-none">
        <nav className="max-w-5xl mx-auto h-14 w-full flex items-center justify-between px-4 sm:px-6 rounded-full bg-emerald-950/80 backdrop-blur-2xl border border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.35),0_1px_1px_rgba(255,255,255,0.1)_inset] pointer-events-auto transition-all duration-500">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-xl bg-emerald-400/25 blur-sm group-hover:blur-md transition-all duration-300" />
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center border border-white/20 shadow-[0_2px_8px_rgba(16,185,129,0.35)] group-hover:scale-105 transition-transform duration-300">
                <Leaf className="w-4 h-4 text-white drop-shadow-sm" />
              </div>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Share<span className="text-emerald-400">A</span>Bite
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
            {[
              { href: "#features", label: "Features" },
              { href: "#how-it-works", label: "How it works" },
              { href: "#testimonials", label: "Stories" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-4 py-1.5 rounded-full text-xs font-medium text-white/75 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right Side CTAs */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/15 transition-all duration-200 active:scale-[0.98]"
            >
              Sign in
            </Link>
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 rounded-full pl-4 pr-1.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-xs font-bold hover:from-amber-300 hover:to-amber-400 transition-all duration-300 shadow-[0_2px_14px_rgba(251,191,36,0.35)] active:scale-[0.97]"
            >
              <span>Get started</span>
              <div className="w-6 h-6 rounded-full bg-amber-950/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
        </nav>
      </header>

      {/* ══════════ HERO SECTION ══════════ */}
      <section className="relative overflow-hidden flex flex-col justify-center min-h-[90vh] lg:min-h-[94vh] pt-28 pb-20">
        {/* 3D Interactive Spatial Mesh & Wavefield Background */}
        <Hero3dBackground />

        {/* Gradient overlays */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-emerald-950/85 via-emerald-950/45 to-transparent z-[1]" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-emerald-950/70 via-transparent to-black/35 z-[1]" />

        {/* Floating atmospheric orbs */}
        <FloatingOrb className="w-[600px] h-[600px] bg-emerald-500/8 blur-[120px] top-[-100px] right-[5%] z-[1]" />
        <FloatingOrb className="w-[400px] h-[400px] bg-amber-400/6 blur-[100px] bottom-[10%] right-[20%] z-[1]" />

        {/* ── Hero Content ── */}
        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 w-full pt-4">
          <div className="max-w-2xl">
            
            {/* Mission Pill Tag */}
            <div className="animate-badge-pop mb-5" style={{ animationDelay: "0ms" }}>
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/25 backdrop-blur-md text-emerald-300 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <Leaf className="w-3 h-3 text-emerald-400" />
                Zero Food Waste Movement
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.9rem] font-black text-white text-left tracking-tight animate-fade-up-blur [text-wrap:balance]"
              style={{ lineHeight: "1.08", animationDelay: "80ms" }}
            >
              Turn Surplus Food Into{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-400 bg-clip-text text-transparent">
                  Immediate Hope.
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-amber-400/80 via-emerald-400/60 to-transparent rounded-full" />
              </span>
            </h1>

            {/* Sub-headline */}
            <p
              className="mt-5 text-base sm:text-lg text-white/80 text-left max-w-xl leading-relaxed animate-fade-up-blur [text-wrap:pretty]"
              style={{ animationDelay: "160ms" }}
            >
              Connecting excess food from restaurants, catered events, and households with nearby verified NGOs and shelters in real-time. Free forever, zero waste.
            </p>

            {/* CTAs with Button-in-Button Architecture */}
            <div
              className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 animate-fade-up-blur"
              style={{ animationDelay: "240ms" }}
            >
              <Link
                to="/login"
                className="group relative inline-flex items-center justify-between sm:justify-center gap-3 rounded-full pl-6 pr-2.5 py-3 text-sm font-bold transition-all duration-300 active:scale-[0.98] bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-[0_4px_24px_rgba(251,191,36,0.35)] hover:shadow-[0_6px_32px_rgba(251,191,36,0.50)] hover:-translate-y-0.5"
              >
                <span className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4" />
                  Donate food now
                </span>
                <div className="w-7 h-7 rounded-full bg-amber-950/15 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <Link
                to="/login"
                className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/10 text-white px-6 py-3 text-sm font-semibold hover:bg-white/18 hover:border-white/30 backdrop-blur-md transition-all duration-300 active:scale-[0.98] hover:-translate-y-0.5"
              >
                <Building2 className="w-4 h-4 text-white/80" />
                <span>My NGO needs food</span>
              </Link>
            </div>

            {/* Trust signals */}
            <div
              className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 animate-fade-up-blur"
              style={{ animationDelay: "320ms" }}
            >
              {["100% Free for Non-profits", "GPS-Verified Pickups", "FSSAI Safety Guidelines"].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-xs text-white/70 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-float">
          <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium">Explore</span>
          <ChevronDown className="w-4 h-4 text-white/40" />
        </div>
      </section>
    </>
  );
}
