import { useState, useRef } from "react";
import { 
  UtensilsCrossed, 
  MapPin, 
  Bell, 
  CheckCircle2, 
  Truck, 
  Users, 
  Sparkles, 
  Zap, 
  ShieldCheck 
} from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const features = [
  {
    icon: UtensilsCrossed,
    tag: "Instant Posting",
    title: "Post a Donation in 60 Seconds",
    desc: "Donors list surplus food with package type, exact servings, safe pickup window, and GPS address. Verified photos boost NGO response time.",
    gradient: "from-emerald-500 to-teal-500",
    glow: "rgba(16, 185, 129, 0.25)",
    span: "col-span-1 md:col-span-7",
    has3dVisual: "cube",
  },
  {
    icon: MapPin,
    tag: "Real-Time Radar",
    title: "Interactive Live Surplus Map",
    desc: "Nearby NGOs see real-time pins categorized by food type, freshness timer, and driving distance.",
    gradient: "from-amber-500 to-emerald-500",
    glow: "rgba(245, 158, 11, 0.25)",
    span: "col-span-1 md:col-span-5",
    has3dVisual: null,
  },
  {
    icon: Bell,
    tag: "Zero Lag",
    title: "Instant 1-Tap Pickup Requests",
    desc: "NGOs request surplus with one tap. Donors receive immediate instant notifications to accept or schedule pickup.",
    gradient: "from-emerald-600 to-teal-500",
    glow: "rgba(16, 185, 129, 0.25)",
    span: "col-span-1 md:col-span-4",
    has3dVisual: null,
  },
  {
    icon: ShieldCheck,
    tag: "Transparency",
    title: "Verified Safety Protocol",
    desc: "Secure contact verification, exact handoff directions, and digital verification codes protect every transaction.",
    gradient: "from-teal-500 to-emerald-600",
    glow: "rgba(20, 184, 166, 0.25)",
    span: "col-span-1 md:col-span-4",
    has3dVisual: null,
  },
  {
    icon: Truck,
    tag: "Live Tracking",
    title: "Real-Time Dispatch Flow",
    desc: "Track status seamlessly: Available → Requested → Volunteer Dispatched → Safely Distributed.",
    gradient: "from-amber-500 to-orange-500",
    glow: "rgba(245, 158, 11, 0.25)",
    span: "col-span-1 md:col-span-4",
    has3dVisual: null,
  },
  {
    icon: Users,
    tag: "Impact Analytics",
    title: "Community Intelligence Dashboard",
    desc: "Both Donors and NGOs access rich analytics: kilograms of food saved, CO₂ offset, and meals delivered to verified families.",
    gradient: "from-emerald-500 via-teal-500 to-amber-500",
    glow: "rgba(16, 185, 129, 0.25)",
    span: "col-span-1 md:col-span-12",
    has3dVisual: "bars",
  },
];

/* ── 3D CSS Rotating Cube Mini Visual with Refined SVG glyphs ── */
function Rotating3DCube() {
  return (
    <div className="w-14 h-14 relative perspective-1000 flex items-center justify-center pointer-events-none">
      <div className="w-9 h-9 preserve-3d animate-cube-3d relative">
        <div className="absolute inset-0 bg-emerald-500/85 border border-white/40 rounded-lg backdrop-blur-sm flex items-center justify-center text-white shadow-lg" style={{ transform: "translateZ(18px)" }}>
          <UtensilsCrossed className="w-4 h-4" />
        </div>
        <div className="absolute inset-0 bg-emerald-600/85 border border-white/40 rounded-lg backdrop-blur-sm flex items-center justify-center text-white shadow-lg" style={{ transform: "rotateY(180deg) translateZ(18px)" }}>
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="absolute inset-0 bg-teal-500/85 border border-white/40 rounded-lg backdrop-blur-sm flex items-center justify-center text-white shadow-lg" style={{ transform: "rotateY(90deg) translateZ(18px)" }}>
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="absolute inset-0 bg-teal-600/85 border border-white/40 rounded-lg backdrop-blur-sm flex items-center justify-center text-white shadow-lg" style={{ transform: "rotateY(-90deg) translateZ(18px)" }}>
          <Zap className="w-4 h-4" />
        </div>
        <div className="absolute inset-0 bg-emerald-400/85 border border-white/40 rounded-lg backdrop-blur-sm flex items-center justify-center text-white shadow-lg" style={{ transform: "rotateX(90deg) translateZ(18px)" }}>
          <MapPin className="w-4 h-4" />
        </div>
        <div className="absolute inset-0 bg-emerald-700/85 border border-white/40 rounded-lg backdrop-blur-sm flex items-center justify-center text-white shadow-lg" style={{ transform: "rotateX(-90deg) translateZ(18px)" }}>
          <CheckCircle2 className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

/* ── Living Animated Bar Chart Visual ── */
function LivingDataBars() {
  return (
    <div className="flex items-end gap-1.5 h-10 px-3 py-1 bg-black/5 dark:bg-white/5 rounded-xl border border-border/40">
      {[
        { h: "60%", delay: "0s" },
        { h: "95%", delay: "0.2s" },
        { h: "45%", delay: "0.4s" },
        { h: "80%", delay: "0.1s" },
        { h: "100%", delay: "0.3s" },
      ].map((bar, i) => (
        <div
          key={i}
          className="w-2 bg-gradient-to-t from-emerald-500 to-amber-400 rounded-t-sm transition-all duration-700 animate-pulse"
          style={{ height: bar.h, animationDelay: bar.delay }}
        />
      ))}
    </div>
  );
}

function FeatureCard({
  feature,
  delay,
}: {
  feature: (typeof features)[0];
  delay: number;
}) {
  const { ref: inViewRef, isIntersecting } = useIntersectionObserver();
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setTilt({ x: rotateX, y: rotateY });
    setSpotlight({ x, y, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setSpotlight((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={(el) => {
        // @ts-ignore
        inViewRef.current = el;
        // @ts-ignore
        cardRef.current = el;
      }}
      className={`group relative ${feature.span} ${
        isIntersecting ? "animate-fade-up-blur opacity-100" : "opacity-0"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Outer Double-Bezel Shell */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="p-1.5 sm:p-2 rounded-[2rem] bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 ring-1 ring-black/[0.04] dark:ring-white/5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 h-full"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        {/* Inner Core Container */}
        <div className="relative rounded-[calc(2rem-0.375rem)] border border-border/50 bg-card/95 dark:bg-card/70 backdrop-blur-xl p-7 sm:p-8 transition-all duration-300 overflow-hidden h-full flex flex-col justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          {/* Top Specular Rim */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />

          {/* Dynamic Cursor Spotlight */}
          <div
            className="pointer-events-none absolute -inset-px rounded-[calc(2rem-0.375rem)] transition-opacity duration-300"
            style={{
              opacity: spotlight.opacity,
              background: `radial-gradient(400px circle at ${spotlight.x}px ${spotlight.y}px, ${feature.glow}, transparent 65%)`,
            }}
          />

          {/* Card Content */}
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              {/* Top Row: Icon + Tag + Visual */}
              <div className="flex items-center justify-between mb-6">
                <div
                  className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white drop-shadow-sm" />
                </div>

                <div className="flex items-center gap-3">
                  {feature.has3dVisual === "cube" && <Rotating3DCube />}
                  {feature.has3dVisual === "bars" && <LivingDataBars />}
                  <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-muted/80 text-muted-foreground border border-border/50">
                    {feature.tag}
                  </span>
                </div>
              </div>

              {/* Title & Desc */}
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 tracking-tight group-hover:text-primary transition-colors duration-200">
                {feature.title}
              </h3>

              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed [text-wrap:pretty]">
                {feature.desc}
              </p>
            </div>

            {/* Bottom Accent Indicator */}
            <div className="mt-8 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.gradient}`} />
                Active in real-time
              </span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-primary font-semibold">
                Learn more ↗
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const { ref, isIntersecting } = useIntersectionObserver();

  return (
    <section id="features" className="py-28 sm:py-36 bg-background relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[650px] h-[650px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
        {/* Section Header */}
        <div
          ref={ref}
          className={`text-center mb-16 sm:mb-20 ${isIntersecting ? "animate-fade-up-blur opacity-100" : "opacity-0"}`}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold mb-4">
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            <span>Platform Capabilities</span>
          </div>

          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mt-2 tracking-tight [text-wrap:balance]"
            style={{ lineHeight: "1.12" }}
          >
            Built for speed, precision, and{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400">
              zero food waste
            </span>
          </h2>

          <p className="mt-5 text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed [text-wrap:pretty]">
            Every feature is engineered to connect surplus food with verified community shelters in real-time.
          </p>
        </div>

        {/* Asymmetrical Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}
