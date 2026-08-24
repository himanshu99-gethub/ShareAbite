import { Link } from "@tanstack/react-router";
import { 
  Leaf, 
  ArrowRight, 
  ChevronDown, 
  UtensilsCrossed, 
  Building2, 
  Shield, 
  Zap, 
  HeartHandshake
} from "lucide-react";

export function HeroSection() {
  return (
    <>
      {/* ══════════ CLEAN WHITE NAVBAR ══════════ */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/60 shadow-xs transition-all duration-300">
        <nav className="max-w-6xl mx-auto px-5 h-16 w-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 rounded-xl bg-primary/20 blur-sm group-hover:blur-md transition-all duration-300" />
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center border border-primary/20 shadow-sm group-hover:scale-105 transition-transform duration-300">
                <Leaf className="w-4.5 h-4.5 text-white drop-shadow-sm" />
              </div>
            </div>
            <span className="text-xl font-black text-foreground tracking-tight">
              Share<span className="text-primary">A</span>Bite
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/60">
            {[
              { href: "#features", label: "Features" },
              { href: "#how-it-works", label: "How it works" },
              { href: "#live-map", label: "Live Radar" },
              { href: "#testimonials", label: "Stories" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-background transition-all duration-200"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card text-foreground px-4 py-2 text-sm font-semibold hover:bg-muted/60 transition-all duration-200 active:scale-[0.97]"
            >
              Sign in
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 text-amber-950 px-4 py-2 text-sm font-extrabold hover:from-amber-300 hover:to-amber-400 transition-all duration-200 shadow-[0_2px_12px_rgba(251,191,36,0.35)] hover:shadow-[0_4px_20px_rgba(251,191,36,0.50)] active:scale-[0.97]"
            >
              Get started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* ══════════ HERO SECTION (CLEAN WHITE THEME) ══════════ */}
      <section className="relative overflow-hidden flex flex-col justify-center min-h-[75vh] py-16 lg:py-24 bg-background border-b border-border/40">
        {/* Subtle dot grid & ambient highlights */}
        <div className="absolute inset-0 dot-grid opacity-[0.25] pointer-events-none" />
        <div className="absolute top-[-100px] right-[5%] w-[600px] h-[600px] rounded-full bg-emerald-500/6 blur-[140px] pointer-events-none animate-glow-pulse" />
        <div className="absolute bottom-[10%] left-[5%] w-[450px] h-[450px] rounded-full bg-amber-400/6 blur-[120px] pointer-events-none animate-glow-pulse" style={{ animationDelay: "1.5s" }} />

        {/* ── Hero Container ── */}
        <div className="relative z-10 max-w-6xl mx-auto px-5 w-full">
          <div className="max-w-2xl text-left">

            {/* Eyebrow Badge */}
            <div className="animate-badge-pop mb-5" style={{ animationDelay: "0ms" }}>
              <span className="glass-pill text-emerald-800 dark:text-emerald-300 text-xs font-extrabold tracking-wide border border-emerald-500/20 bg-emerald-500/10">
                🌿 Fighting food waste, one meal at a time
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground text-left animate-fade-up-blur tracking-[-0.03em]"
              style={{ lineHeight: "1.10", animationDelay: "80ms" }}
            >
              Your{" "}
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 dark:from-amber-300 dark:to-orange-400">
                  small contribution
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/30 to-transparent rounded-full" />
              </span>
              <br />
              can bring a big smile to<br className="hidden sm:block" /> someone's face
            </h1>

            {/* Sub-headline */}
            <p
              className="mt-5 text-base sm:text-lg text-muted-foreground text-left max-w-xl leading-relaxed animate-fade-up-blur font-normal"
              style={{ animationDelay: "160ms" }}
            >
              Connecting surplus food with nearby NGOs and shelters in real-time. Post a donation in 60 seconds — feed those who need it most today.
            </p>

            {/* CTAs */}
            <div
              className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 animate-fade-up-blur"
              style={{ animationDelay: "240ms" }}
            >
              <Link
                to="/login"
                className="group inline-flex items-center justify-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-extrabold transition-all duration-300 active:scale-[0.97] bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 text-amber-950 shadow-[0_4px_20px_rgba(251,191,36,0.35)] hover:shadow-[0_6px_30px_rgba(251,191,36,0.55)] hover:-translate-y-0.5"
              >
                <UtensilsCrossed className="w-4 h-4" />
                Donate food now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-card hover:bg-muted/60 text-foreground px-7 py-3.5 text-sm font-semibold backdrop-blur-sm transition-all duration-200 active:scale-[0.97] hover:-translate-y-0.5 shadow-xs hover:border-primary/40"
              >
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                My NGO needs food
              </Link>
            </div>

            {/* Trust signals */}
            <div
              className="mt-8 pt-5 border-t border-border/50 flex flex-wrap items-center gap-x-6 gap-y-2.5 animate-fade-up-blur"
              style={{ animationDelay: "320ms" }}
            >
              {[
                { icon: Shield, label: "Free forever" },
                { icon: Zap, label: "Setup in 60 seconds" },
                { icon: HeartHandshake, label: "Verified NGO Network" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Icon className="w-3 h-3 text-primary" />
                  </div>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-12 flex flex-col items-center gap-1 animate-float pointer-events-none">
          <span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-medium">Scroll</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground/60" />
        </div>
      </section>
    </>
  );
}
