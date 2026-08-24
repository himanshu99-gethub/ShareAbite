import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Leaf, ArrowRight, ChevronDown, UtensilsCrossed, Building2 } from "lucide-react";
import bgVideo from "../../../Cinematic_aerial_drone_footage.mp4";

/* ─── Floating Background Orbs ─── */
function FloatingOrb({ className }: { className: string }) {
  return <div className={`absolute rounded-full pointer-events-none animate-glow-pulse ${className}`} />;
}

/* ─── Main HeroSection ─── */
export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.45;
    }
  }, []);

  return (
    <>
      {/* ══════════ NAVBAR ══════════ */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-emerald-950/95 backdrop-blur-xl border-b border-white/10 shadow-[0_1px_20px_rgba(0,0,0,0.25)]">
        <nav className="max-w-6xl mx-auto px-5 h-16 w-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 rounded-xl bg-emerald-500/30 blur-sm group-hover:blur-md transition-all" />
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center border border-white/20 shadow-[0_2px_8px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-transform">
                <Leaf className="w-4.5 h-4.5 text-white drop-shadow-sm" />
              </div>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Share<span className="text-emerald-400">A</span>Bite
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden sm:flex items-center gap-1">
            {[
              { href: "#features", label: "Features" },
              { href: "#how-it-works", label: "How it works" },
              { href: "#testimonials", label: "Stories" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3.5 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 text-white px-4 py-2 text-sm font-semibold hover:bg-white/20 hover:border-white/35 backdrop-blur-sm transition-all duration-200 active:scale-[0.97]"
            >
              Sign in
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 px-4 py-2 text-sm font-bold hover:from-amber-300 hover:to-amber-400 transition-all duration-200 shadow-[0_2px_12px_rgba(251,191,36,0.35)] hover:shadow-[0_4px_20px_rgba(251,191,36,0.50)] active:scale-[0.97]"
            >
              Get started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* ══════════ HERO SECTION ══════════ */}
      <section className="relative overflow-hidden flex flex-col justify-center min-h-[75vh] pt-12 pb-12">
        {/* Background Video */}
        <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden bg-emerald-950">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-75 pointer-events-none"
          >
            <source src={bgVideo} type="video/mp4" />
          </video>
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-emerald-950/70 via-emerald-950/30 to-transparent z-[1]" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-emerald-950/50 via-transparent to-black/20 z-[1]" />

        {/* Floating atmospheric orbs */}
        <FloatingOrb className="w-[600px] h-[600px] bg-emerald-500/8 blur-[120px] top-[-100px] right-[5%] z-[1]" />
        <FloatingOrb className="w-[400px] h-[400px] bg-amber-400/6 blur-[100px] bottom-[10%] right-[20%] z-[1]" />

        {/* ── Hero Content ── */}
        <div className="relative z-10 max-w-6xl mx-auto px-5 w-full pt-4">
          <div className="max-w-2xl">

            {/* Eyebrow Badge */}
            <div className="animate-badge-pop mb-4" style={{ animationDelay: "0ms" }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white/90 text-xs font-semibold tracking-wide">
                🌿 Fighting food waste, one meal at a time
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-white text-left animate-fade-up-blur"
              style={{ lineHeight: "1.10", animationDelay: "80ms" }}
            >
              Your{" "}
              <span className="relative inline-block">
                <span className="gradient-text-hero">small contribution</span>
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400/60 to-transparent rounded-full" />
              </span>
              <br />
              can bring a big smile to<br className="hidden sm:block" /> someone's face
            </h1>

            {/* Sub-headline */}
            <p
              className="mt-4 text-base sm:text-lg text-white/75 text-left max-w-2xl leading-relaxed animate-fade-up-blur"
              style={{ animationDelay: "160ms" }}
            >
              Connecting surplus food with nearby NGOs and shelters in real-time.
            </p>

            {/* CTAs */}
            <div
              className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-fade-up-blur"
              style={{ animationDelay: "240ms" }}
            >
              <Link
                to="/login"
                className="group inline-flex items-center justify-center gap-2.5 rounded-xl px-7 py-3 text-sm font-bold transition-all duration-300 active:scale-[0.97] bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-[0_4px_20px_rgba(251,191,36,0.35)] hover:shadow-[0_6px_30px_rgba(251,191,36,0.55)] hover:-translate-y-1"
              >
                <UtensilsCrossed className="w-4 h-4" />
                Donate food now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 text-white px-7 py-3 text-sm font-semibold hover:bg-white/18 backdrop-blur-sm transition-all duration-200 active:scale-[0.97] hover:-translate-y-1"
              >
                <Building2 className="w-4 h-4 text-white/70" />
                My NGO needs food
              </Link>
            </div>

            {/* Trust signals */}
            <div
              className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 animate-fade-up-blur"
              style={{ animationDelay: "320ms" }}
            >
              {["Free forever", "No credit card required", "Setup in 60 seconds"].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-xs text-white/55 font-medium">
                  <span className="w-1 h-1 rounded-full bg-emerald-400/60 flex-shrink-0" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-float">
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Scroll</span>
          <ChevronDown className="w-4 h-4 text-white/40" />
        </div>
      </section>
    </>
  );
}
