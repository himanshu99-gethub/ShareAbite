import { UtensilsCrossed, MapPin, Bell, CheckCircle2, Truck, Users } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useRef } from "react";

const features = [
  {
    icon: UtensilsCrossed,
    title: "Post a Donation in 60 Seconds",
    desc: "Donors list surplus food with type, quantity, pickup window, and location. Add a photo for faster pickups.",
    gradient: "from-emerald-500 to-teal-500",
    glow: "rgba(16, 185, 129, 0.15)",
    span: "md:col-span-2", // Featured card
    size: "large",
  },
  {
    icon: MapPin,
    title: "Live Map of Available Food",
    desc: "Receivers browse an interactive map showing all available donations pinned near them, sorted by distance.",
    gradient: "from-amber-500 to-orange-500",
    glow: "rgba(245, 158, 11, 0.15)",
    span: "",
    size: "normal",
  },
  {
    icon: Bell,
    title: "Instant Pickup Requests",
    desc: "NGOs send a request with one click. Donors get notified immediately and can Accept or Reject from their dashboard.",
    gradient: "from-blue-500 to-indigo-500",
    glow: "rgba(99, 102, 241, 0.15)",
    span: "",
    size: "normal",
  },
  {
    icon: CheckCircle2,
    title: "Confirmed Pickup Flow",
    desc: "Once accepted, both parties see pickup address, time window, and contact details. Full transparency.",
    gradient: "from-purple-500 to-pink-500",
    glow: "rgba(168, 85, 247, 0.15)",
    span: "",
    size: "normal",
  },
  {
    icon: Truck,
    title: "Real-Time Status Tracking",
    desc: "Donation status updates instantly — Available → Requested → Confirmed → Picked Up — no refresh needed.",
    gradient: "from-orange-500 to-red-500",
    glow: "rgba(249, 115, 22, 0.15)",
    span: "",
    size: "normal",
  },
  {
    icon: Users,
    title: "Community Dashboard",
    desc: "Every donor and receiver gets a personal dashboard showing history, active listings, and impact stats.",
    gradient: "from-pink-500 to-rose-500",
    glow: "rgba(244, 63, 94, 0.15)",
    span: "md:col-span-2", // Featured card
    size: "large",
  },
];

function FeatureCard({
  feature,
  delay,
}: {
  feature: (typeof features)[0];
  delay: number;
}) {
  const { ref: inViewRef, isIntersecting } = useIntersectionObserver();
  const cardRef = useRef<HTMLDivElement>(null);
  const { x, y } = useMousePosition(cardRef);
  const isLarge = feature.size === "large";

  return (
    <div
      ref={(el) => {
        // @ts-ignore
        inViewRef.current = el;
        // @ts-ignore
        cardRef.current = el;
      }}
      className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 
        hover:border-primary/30 transition-all duration-400 cursor-default
        opacity-0 ${isIntersecting ? "animate-fade-up-blur opacity-100" : ""}
        ${isLarge ? "sm:p-8 lg:p-9" : ""}
        ${feature.span}
      `}
      style={{
        animationDelay: `${delay}ms`,
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Gradient glow on hover */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(500px circle at ${x}px ${y}px, ${feature.glow}, transparent 50%)`,
        }}
      />

      {/* Bottom gradient line */}
      <div
        className={`absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-300`}
      />

      {/* Card lift on hover */}
      <div className="relative z-10 transform group-hover:-translate-y-0.5 transition-transform duration-300">
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
        >
          <feature.icon className="w-6 h-6 text-white drop-shadow-sm" />
        </div>

        {/* Content */}
        <h3
          className={`font-bold text-foreground mb-2.5 leading-tight ${
            isLarge ? "text-xl" : "text-lg"
          }`}
        >
          {feature.title}
        </h3>
        <p
          className={`text-muted-foreground leading-relaxed ${
            isLarge ? "text-base max-w-sm" : "text-sm"
          }`}
        >
          {feature.desc}
        </p>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const { ref, isIntersecting } = useIntersectionObserver();

  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative grid background */}
      <div className="absolute inset-0 line-grid pointer-events-none opacity-60" />

      {/* Radial gradient top-right */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-50/60 via-transparent to-transparent dark:from-emerald-900/15 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-5 relative z-10">
        {/* Section Header */}
        <div
          ref={ref}
          className={`text-center mb-16 opacity-0 ${isIntersecting ? "animate-fade-up-blur opacity-100" : ""}`}
        >
          <span className="eyebrow-tag mb-4 inline-flex">
            ✦ Platform Features
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-4"
            style={{ lineHeight: "1.12" }}
          >
            Everything you need to
            <br />
            <span className="gradient-text-primary">close the food gap</span>
          </h2>
          <p className="mt-5 text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            A complete toolkit for donors and NGOs to coordinate food rescue efficiently.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}
