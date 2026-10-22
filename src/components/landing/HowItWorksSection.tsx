import { useState } from "react";
import { 
  UtensilsCrossed, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Sparkles,
  Zap
} from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const workflowRoles = {
  donor: {
    badge: "Food Donor Journey",
    steps: [
      {
        num: "01",
        role: "Step 1: List",
        title: "Snap & Post Surplus",
        desc: "Enter meal quantity, packaging type, expiration window, and pickup coordinates. Add a photo in under 60 seconds.",
        icon: UtensilsCrossed,
        gradient: "from-emerald-500 to-teal-500",
        glowColor: "rgba(16, 185, 129, 0.3)",
      },
      {
        num: "02",
        role: "Step 2: Match",
        title: "Instant NGO Notification",
        desc: "The system alerts all verified shelters within a 10km radius. An NGO claims the donation with one click.",
        icon: Zap,
        gradient: "from-amber-500 to-orange-500",
        glowColor: "rgba(245, 158, 11, 0.3)",
      },
      {
        num: "03",
        role: "Step 3: Handoff",
        title: "Verified Pickup & Impact",
        desc: "Volunteer arrives with pickup code. You confirm handoff and instantly view meals saved and CO₂ offset.",
        icon: CheckCircle2,
        gradient: "from-blue-500 to-indigo-500",
        glowColor: "rgba(99, 102, 241, 0.3)",
      },
    ],
  },
  receiver: {
    badge: "NGO / Shelter Journey",
    steps: [
      {
        num: "01",
        role: "Step 1: Explore",
        title: "Browse Live Radar",
        desc: "View verified surplus postings on the interactive live map, filtered by distance and meal category.",
        icon: MapPin,
        gradient: "from-teal-500 to-emerald-600",
        glowColor: "rgba(20, 184, 166, 0.3)",
      },
      {
        num: "02",
        role: "Step 2: Request",
        title: "Claim in 1-Tap",
        desc: "Submit an instant request with estimated pickup time and volunteer contact details. Donor gets notified immediately.",
        icon: Truck,
        gradient: "from-purple-500 to-indigo-500",
        glowColor: "rgba(168, 85, 247, 0.3)",
      },
      {
        num: "03",
        role: "Step 3: Distribute",
        title: "Feed Your Community",
        desc: "Collect the meal boxes directly from the donor and distribute them to families and shelters in need.",
        icon: ShieldCheck,
        gradient: "from-emerald-500 to-green-600",
        glowColor: "rgba(16, 185, 129, 0.3)",
      },
    ],
  },
};

export function HowItWorksSection() {
  const { ref, isIntersecting } = useIntersectionObserver();
  const [activeRole, setActiveRole] = useState<"donor" | "receiver">("donor");

  const currentWorkflow = workflowRoles[activeRole];

  return (
    <section id="how-it-works" className="py-12 sm:py-16 bg-muted/20 relative overflow-hidden border-y border-border/40">
      {/* Background grid */}
      <div className="absolute inset-0 line-grid opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
        
        {/* Section Header */}
        <div
          ref={ref}
          className={`text-center mb-8 sm:mb-10 ${isIntersecting ? "animate-fade-up-blur opacity-100" : "opacity-0"}`}
        >
          <span className="glass-pill text-amber-700 dark:text-amber-300 text-xs font-extrabold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Seamless Coordination Flow</span>
          </span>

          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground mt-2 tracking-[-0.03em]"
            style={{ lineHeight: "1.12" }}
          >
            Three simple steps.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600">
              Zero food wasted.
            </span>
          </h2>

          <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Choose your role to see how ShareABite streamlines food rescue in real-time.
          </p>

          {/* Interactive Role Switcher */}
          <div className="mt-5 inline-flex items-center p-1 rounded-2xl bg-card border border-border/80 shadow-md">
            <button
              type="button"
              onClick={() => setActiveRole("donor")}
              className={`flex items-center gap-2 px-4.5 sm:px-5 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 ${
                activeRole === "donor"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              I'm a Food Donor
            </button>

            <button
              type="button"
              onClick={() => setActiveRole("receiver")}
              className={`flex items-center gap-2 px-4.5 sm:px-5 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 ${
                activeRole === "receiver"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              I'm an NGO / Shelter
            </button>
          </div>
        </div>

        {/* 3D Step Cards with SVG Connectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
          {currentWorkflow.steps.map((step, i) => {
            const Icon = step.icon;
            const isLast = i === currentWorkflow.steps.length - 1;

            return (
              <div key={step.num} className="relative flex flex-col">
                {/* Desktop connecting arrow */}
                {!isLast && (
                  <div
                    className="hidden md:flex absolute top-10 -right-3 z-20 items-center justify-center w-7 h-7 rounded-full bg-card border border-border/80 shadow-md text-muted-foreground"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`group relative h-full rounded-2xl border border-border/60 bg-card/90 dark:bg-card/40 backdrop-blur-xl p-5 sm:p-6 transition-all duration-400 hover:-translate-y-1.5 cursor-default overflow-hidden ${
                    isIntersecting ? "animate-fade-up-blur opacity-100" : "opacity-0"
                  }`}
                  style={{
                    animationDelay: `${i * 120}ms`,
                    boxShadow: "var(--shadow-neumorphic)",
                  }}
                >
                  {/* Top Specular Rim */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />

                  {/* Watermark Step Number */}
                  <span
                    className="absolute top-3 right-5 text-6xl font-black text-foreground/[0.04] select-none pointer-events-none"
                    aria-hidden
                  >
                    {step.num}
                  </span>

                  {/* Icon */}
                  <div
                    className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform duration-300`}
                    style={{ boxShadow: `0 8px 20px ${step.glowColor}` }}
                  >
                    <Icon className="w-6 h-6 text-white drop-shadow-sm" />
                  </div>

                  {/* Role Sub-Badge */}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-primary/10 text-primary mb-2">
                    {step.role}
                  </span>

                  {/* Step Title */}
                  <h3 className="font-black text-foreground text-lg sm:text-xl mb-2 tracking-tight">
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
