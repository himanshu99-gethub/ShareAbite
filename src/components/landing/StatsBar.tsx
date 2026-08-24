import { useState, useEffect, useRef } from "react";
import { UtensilsCrossed, Building2, Leaf, Sparkles, Activity } from "lucide-react";

function AnimatedCounter({ value, isFree = false, suffix = "" }: { value: number; isFree?: boolean; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started || isFree) return;
    if (value === 0) {
      setCount(0);
      return;
    }
    let current = 0;
    const duration = 1400;
    const increment = Math.max(1, Math.ceil(value / (duration / 16)));
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(current);
    }, 16);
    return () => clearInterval(timer);
  }, [started, value, isFree]);

  if (isFree) return <span>100% Free</span>;

  return (
    <span ref={ref} className="tabular-nums font-mono font-black">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export function StatsBar() {
  const { ref, isIntersecting } = useStatsVisible();

  const [realStats, setRealStats] = useState({
    meals: 0,
    donors: 0,
    ngos: 0,
    isLoading: true,
  });

  useEffect(() => {
    let channel: any = null;

    async function loadStats() {
      try {
        const { supabase } = await import("@/integrations/supabase/client");

        const [donationsRes, donorsRes, ngosRes] = await Promise.all([
          supabase.from("donations").select("id", { count: "exact", head: true }),
          supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "donor"),
          supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "receiver"),
        ]);

        setRealStats({
          meals: donationsRes.count ?? 0,
          donors: donorsRes.count ?? 0,
          ngos: ngosRes.count ?? 0,
          isLoading: false,
        });
      } catch (err) {
        console.error("Failed to load real stats:", err);
      }
    }

    loadStats();

    // Live realtime updates from Supabase database
    import("@/integrations/supabase/client").then(({ supabase }) => {
      channel = supabase
        .channel("realtime-stats-bar")
        .on("postgres_changes", { event: "*", schema: "public", table: "donations" }, () => loadStats())
        .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => loadStats())
        .subscribe();
    });

    return () => {
      if (channel) {
        import("@/integrations/supabase/client").then(({ supabase }) => {
          supabase.removeChannel(channel);
        });
      }
    };
  }, []);

  const statsList = [
    {
      value: realStats.meals,
      suffix: realStats.meals > 0 ? "+" : "",
      label: "Meals Saved & Shared",
      sublabel: "Redirected from waste",
      icon: UtensilsCrossed,
      color: "text-emerald-500",
      bgGlow: "from-emerald-500/20 to-teal-500/5",
      isFree: false,
    },
    {
      value: realStats.donors,
      suffix: realStats.donors > 0 ? "+" : "",
      label: "Verified Food Donors",
      sublabel: "Hotels, caterers, homes",
      icon: Leaf,
      color: "text-teal-500",
      bgGlow: "from-teal-500/20 to-emerald-500/5",
      isFree: false,
    },
    {
      value: realStats.ngos,
      suffix: realStats.ngos > 0 ? "+" : "",
      label: "Active Partner NGOs",
      sublabel: "Shelters & food banks",
      icon: Building2,
      color: "text-amber-500",
      bgGlow: "from-amber-500/20 to-orange-500/5",
      isFree: false,
    },
    {
      value: 0,
      suffix: "",
      label: "Community Cost",
      sublabel: "Non-profit initiative",
      icon: Sparkles,
      color: "text-sky-500",
      bgGlow: "from-sky-500/20 to-blue-500/5",
      isFree: true,
    },
  ];

  return (
    <section className="relative z-20 py-12 bg-background border-b border-border/40 overflow-hidden">
      {/* Top ambient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      
      {/* Real-time sync indicator badge */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-xs">
          <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
          <span>Live Database Telemetry Active</span>
        </div>
      </div>

      <div
        ref={ref}
        className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {statsList.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`group relative p-6 rounded-3xl border border-border/60 bg-card/80 dark:bg-card/40 backdrop-blur-xl transition-all duration-400 hover:-translate-y-1.5 cursor-default overflow-hidden ${
                isIntersecting ? "animate-fade-up-blur opacity-100" : "opacity-0"
              }`}
              style={{ 
                animationDelay: `${i * 100}ms`,
                boxShadow: "var(--shadow-neumorphic)",
              }}
            >
              {/* Card top specular rim */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent opacity-80" />

              {/* Dynamic hover gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none`} />

              <div className="relative z-10 flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-muted/80 border border-border/80 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider bg-muted/60 px-2 py-0.5 rounded-md">
                  0{i + 1}
                </span>
              </div>

              {/* Number */}
              <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-1">
                <AnimatedCounter value={stat.value} isFree={stat.isFree} suffix={stat.suffix} />
              </p>

              {/* Label */}
              <p className="text-sm font-bold text-foreground leading-tight">
                {stat.label}
              </p>

              {/* Sub-label */}
              <p className="text-xs text-muted-foreground mt-1">
                {stat.sublabel}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function useStatsVisible() {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsIntersecting(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, isIntersecting };
}
