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
    desc: "Donors list surplus food with package type, exact servings, safe pickup window, and GPS address. Photos boost NGO response time by 3x.",
    gradient: "from-emerald-500 to-teal-500",
    glow: "rgba(16, 185, 129, 0.25)",
    span: "lg:col-span-2",
    has3dVisual: "cube",
  },
  {
    icon: MapPin,
    tag: "Real-Time Radar",
    title: "Interactive Live Surplus Map",
    desc: "Nearby NGOs see real-time pins categorized by food type, freshness timer, and driving distance.",
    gradient: "from-amber-500 to-orange-500",
    glow: "rgba(245, 158, 11, 0.25)",
    span: "",
    has3dVisual: "radar",
  },
  {
    icon: Bell,
    tag: "Zero Lag",
    title: "Instant 1-Tap Pickup Requests",
    desc: "NGOs request surplus with one tap. Donors receive immediate instant notifications to accept or schedule pickup.",
    gradient: "from-blue-500 to-indigo-500",
    glow: "rgba(99, 102, 241, 0.25)",
    span: "",
    has3dVisual: null,
  },
  {
    icon: CheckCircle2,
    tag: "Full Transparency",
    title: "Verified Verification Protocol",
    desc: "Secure contact verification, exact handoff directions, and digital verification codes protect every transaction.",
    gradient: "from-purple-500 to-pink-500",
    glow: "rgba(168, 85, 247, 0.25)",
    span: "",
    has3dVisual: null,
  },
  {
    icon: Truck,
    tag: "Live Tracking",
    title: "Real-Time Dispatch Flow",
    desc: "Track status seamlessly: Available → Requested → Volunteer Dispatched → Safely Distributed.",
    gradient: "from-orange-500 to-red-500",
    glow: "rgba(249, 115, 22, 0.25)",
    span: "",
    has3dVisual: null,
  },
  {
    icon: Users,
    tag: "Impact Analytics",
    title: "Community Intelligence Dashboard",
    desc: "Both Donors and NGOs access rich analytics: kilograms of food saved, CO₂ offset, and meals delivered to verified families.",
    gradient: "from-pink-500 to-rose-500",
    glow: "rgba(244, 63, 94, 0.25)",
    span: "lg:col-span-2",
    has3dVisual: "bars",
  },
];

/* ── 3D CSS Rotating Cube Mini Visual ── */
function Rotating3DCube() {
  return (
    <div className="w-16 h-16 relative perspective-1000 flex items-center justify-center pointer-events-none">
      <div className="w-10 h-10 preserve-3d animate-cube-3d relative">
        <div className="absolute inset-0 bg-emerald-500/80 border border-white/60 rounded-lg backdrop-blur-sm flex items-center justify-center text-[10px] font-bold text-white shadow-lg" style={{ transform: "translateZ(20px)" }}>🍱</div>
        <div className="absolute inset-0 bg-emerald-600/80 border border-white/60 rounded-lg backdrop-blur-sm flex items-center justify-center text-[10px] font-bold text-white shadow-lg" style={{ transform: "rotateY(180deg) translateZ(20px)" }}>🥗</div>
        <div className="absolute inset-0 bg-teal-500/80 border border-white/60 rounded-lg backdrop-blur-sm flex items-center justify-center text-[10px] font-bold text-white shadow-lg" style={{ transform: "rotateY(90deg) translateZ(20px)" }}>🥖</div>
        <div className="absolute inset-0 bg-teal-600/80 border border-white/60 rounded-lg backdrop-blur-sm flex items-center justify-center text-[10px] font-bold text-white shadow-lg" style={{ transform: "rotateY(-90deg) translateZ(20px)" }}>🍲</div>
        <div className="absolute inset-0 bg-emerald-400/80 border border-white/60 rounded-lg backdrop-blur-sm flex items-center justify-center text-[10px] font-bold text-white shadow-lg" style={{ transform: "rotateX(90deg) translateZ(20px)" }}>🍎</div>
        <div className="absolute inset-0 bg-emerald-700/80 border border-white/60 rounded-lg backdrop-blur-sm flex items-center justify-center text-[10px] font-bold text-white shadow-lg" style={{ transform: "rotateX(-90deg) translateZ(20px)" }}>🍚</div>
      </div>
    </div>
  );
}

/* ── Living Animated Bar Chart Visual ── */
function LivingDataBars() {
  return (
    <div className="flex items-end gap-1.5 h-12 px-3 py-1 bg-black/10 dark:bg-white/5 rounded-xl border border-border/40">
      {[
        { h: "60%", delay: "0s" },
        { h: "95%", delay: "0.2s" },
        { h: "45%", delay: "0.4s" },
        { h: "80%", delay: "0.1s" },
        { h: "100%", delay: "0.3s" },
      ].map((bar, i) => (
        <div
          key={i}
          className="w-2.5 bg-gradient-to-t from-pink-500 to-rose-400 rounded-t-sm transition-all duration-700 animate-pulse"
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

    const rotateX = -((y - centerY) / centerY) * 10;
    const rotateY = ((x - centerX) / centerX) * 10;

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
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative rounded-3xl border border-border/60 bg-card/90 dark:bg-card/50 backdrop-blur-xl p-7 sm:p-8 
        transition-all duration-300 cursor-default overflow-hidden perspective-1000
        ${isIntersecting ? "animate-fade-up-blur opacity-100" : "opacity-0"}
        ${feature.span}
      `}
      style={{
        animationDelay: `${delay}ms`,
        boxShadow: "var(--shadow-neumorphic)",
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
    >
      {/* Specular rim light top edge */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />

      {/* Dynamic Cursor Spotlight */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-300"
        style={{
          opacity: spotlight.opacity,
          background: `radial-gradient(400px circle at ${spotlight.x}px ${spotlight.y}px, ${feature.glow}, transparent 60%)`,
        }}
      />

      {/* Card Content */}
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          {/* Top Row: Icon + Tag + Visual */}
          <div className="flex items-center justify-between mb-6">
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}
            >
              <feature.icon className="w-7 h-7 text-white drop-shadow-sm" />
            </div>

            <div className="flex items-center gap-3">
              {feature.has3dVisual === "cube" && <Rotating3DCube />}
              {feature.has3dVisual === "bars" && <LivingDataBars />}
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-muted/80 text-muted-foreground border border-border/60">
                {feature.tag}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-extrabold text-foreground text-xl sm:text-2xl mb-3 leading-tight tracking-tight">
            {feature.title}
          </h3>

          {/* Description */}
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {feature.desc}
          </p>
        </div>

        {/* Bottom Accent */}
        <div className="mt-6 pt-4 border-t border-border/40 flex items-center gap-2 text-xs font-bold text-foreground/80 group-hover:text-primary transition-colors">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Active & Ready on Web & Mobile</span>
        </div>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const { ref, isIntersecting } = useIntersectionObserver();

  return (
    <section id="features" className="py-28 bg-background relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[650px] h-[650px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
        {/* Section Header */}
        <div
          ref={ref}
          className={`text-center mb-18 ${isIntersecting ? "animate-fade-up-blur opacity-100" : "opacity-0"}`}
        >
          <span className="glass-pill text-emerald-700 dark:text-emerald-300 text-xs font-extrabold mb-4">
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            <span>Platform Capabilities</span>
          </span>

          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mt-3 tracking-[-0.03em]"
            style={{ lineHeight: "1.10" }}
          >
            Built for speed, precision, and{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400">
              zero food waste
            </span>
          </h2>

          <p className="mt-5 text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Every feature is engineered to connect surplus food with verified community shelters in real-time.
          </p>
        </div>

        {/* 3D Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} delay={i * 90} />
          ))}
        </div>
      </div>
    </section>
  );
}
