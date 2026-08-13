import { UtensilsCrossed, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const steps = [
  {
    num: "01",
    role: "Donor",
    roleColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    title: "Post your surplus",
    desc: "Add food details, quantity, pickup address, and time window. Takes under a minute.",
    icon: UtensilsCrossed,
    gradient: "from-emerald-500 to-teal-500",
    glowColor: "rgba(16, 185, 129, 0.20)",
    borderGradient: "from-emerald-400/50 to-teal-400/30",
  },
  {
    num: "02",
    role: "Receiver",
    roleColor: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    title: "Browse & request",
    desc: "NGOs find available donations on the map, review details, and send a pickup request in one click.",
    icon: MapPin,
    gradient: "from-amber-500 to-orange-500",
    glowColor: "rgba(245, 158, 11, 0.20)",
    borderGradient: "from-amber-400/50 to-orange-400/30",
  },
  {
    num: "03",
    role: "Both",
    roleColor: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
    title: "Confirm & collect",
    desc: "Donor accepts → both parties get confirmation with contact details. Food reaches those who need it.",
    icon: CheckCircle2,
    gradient: "from-blue-500 to-indigo-500",
    glowColor: "rgba(99, 102, 241, 0.20)",
    borderGradient: "from-blue-400/50 to-indigo-400/30",
  },
];

function StepCard({ step, delay, isLast }: { step: (typeof steps)[0]; delay: number; isLast: boolean }) {
  const { ref, isIntersecting } = useIntersectionObserver();
  const Icon = step.icon;

  return (
    <div className="relative flex flex-col items-center md:items-start">
      {/* Connector arrow (desktop, between cards) */}
      {!isLast && (
        <div
          className={`hidden md:flex absolute top-10 -right-4 z-10 items-center justify-center w-8 h-8 rounded-full bg-background border border-border/60 shadow-sm opacity-0 ${
            isIntersecting ? "animate-fade-in opacity-100" : ""
          }`}
          style={{ animationDelay: `${delay + 300}ms` }}
        >
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      )}

      <div
        ref={ref}
        className={`group relative w-full rounded-2xl border border-border/50 bg-card p-7 overflow-hidden
          hover:-translate-y-1 transition-all duration-300 opacity-0 ${isIntersecting ? "animate-fade-up-blur opacity-100" : ""}`}
        style={{
          animationDelay: `${delay}ms`,
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Gradient border top line */}
        <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${step.borderGradient} opacity-60`} />

        {/* Number watermark */}
        <span
          className="absolute top-4 right-5 text-6xl font-black text-foreground/[0.03] select-none pointer-events-none leading-none"
          aria-hidden
        >
          {step.num}
        </span>

        {/* Icon */}
        <div
          className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-105 group-hover:shadow-xl transition-all duration-300`}
          style={{ boxShadow: `0 8px 24px ${step.glowColor}` }}
        >
          <Icon className="w-7 h-7 text-white drop-shadow-sm" />
        </div>

        {/* Role Badge */}
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${step.roleColor} mb-3`}>
          {step.role}
        </span>

        {/* Title */}
        <h3 className="font-bold text-foreground text-xl mb-2.5">{step.title}</h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  const { ref, isIntersecting } = useIntersectionObserver();

  return (
    <section id="how-it-works" className="py-24 bg-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-5 relative z-10">
        {/* Section Header */}
        <div
          ref={ref}
          className={`text-center mb-16 opacity-0 ${isIntersecting ? "animate-fade-up-blur opacity-100" : ""}`}
        >
          <span className="eyebrow-tag mb-4 inline-flex">
            ⚡ How it works
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-4"
            style={{ lineHeight: "1.12" }}
          >
            Three steps,{" "}
            <span
              className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500"
            >
              zero waste
            </span>
          </h2>
          <p className="mt-5 text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
            From surplus to shelves in minutes — our streamlined flow makes food rescue effortless.
          </p>
        </div>

        {/* Step Cards */}
        <div className="grid md:grid-cols-3 gap-6 relative">
          {steps.map((s, i) => (
            <StepCard key={s.num} step={s} delay={i * 150} isLast={i === steps.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
