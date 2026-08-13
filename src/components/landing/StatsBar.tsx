import { useState, useEffect, useRef } from "react";
import { UtensilsCrossed, Building2, Leaf, TrendingUp } from "lucide-react";

function AnimatedCounter({ value, isFree = false, suffix = "" }: { value: number; isFree?: boolean; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.6 }
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
    const duration = 1200;
    const increment = Math.max(1, Math.ceil(value / (duration / 16)));
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(current);
    }, 16);
    return () => clearInterval(timer);
  }, [started, value, isFree]);

  if (isFree) return <span>Free</span>;

  return (
    <span ref={ref} className="tabular-nums">
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
      label: "Meals Redistributed",
      icon: UtensilsCrossed,
      color: "text-emerald-500",
      isFree: false,
    },
    {
      value: realStats.donors,
      suffix: realStats.donors > 0 ? "+" : "",
      label: "Donor Restaurants",
      icon: Leaf,
      color: "text-emerald-600",
      isFree: false,
    },
    {
      value: realStats.ngos,
      suffix: realStats.ngos > 0 ? "+" : "",
      label: "NGOs & Shelters",
      icon: Building2,
      color: "text-amber-500",
      isFree: false,
    },
    {
      value: 0,
      suffix: "",
      label: "Service Cost",
      icon: TrendingUp,
      color: "text-sky-500",
      isFree: true,
    },
  ];

  return (
    <section className="relative z-20 py-10 bg-background border-y border-border/40">
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div
        ref={ref}
        className="max-w-4xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8"
      >
        {statsList.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`group flex flex-col items-center text-center opacity-0 ${
                isIntersecting ? "animate-fade-up-blur opacity-100" : ""
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center bg-muted border border-border/60 group-hover:scale-110 group-hover:border-primary/30 transition-all duration-200">
                <Icon className={`w-4.5 h-4.5 ${stat.color}`} />
              </div>

              {/* Number */}
              <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                <AnimatedCounter value={stat.value} isFree={stat.isFree} suffix={stat.suffix} />
              </p>

              {/* Label */}
              <p className="text-xs text-muted-foreground mt-1 font-medium leading-tight">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
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
