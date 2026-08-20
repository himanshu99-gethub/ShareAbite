import { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { TrendingUp, Utensils, Target, BarChart3, Sparkles } from "lucide-react";

interface MonthlyData {
  name: string;
  meals: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 border border-border/80 rounded-2xl p-3.5 shadow-xl backdrop-blur-xl text-xs">
        <p className="text-muted-foreground font-bold uppercase tracking-wider mb-1">{label}</p>
        <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm font-mono">
          {payload[0].value.toLocaleString()} Meals Distributed
        </p>
      </div>
    );
  }
  return null;
};

export function ImpactDashboard() {
  const { ref, isIntersecting } = useIntersectionObserver();

  const [chartData, setChartData] = useState<MonthlyData[]>([]);
  const [stats, setStats] = useState({
    peakMonth: 0,
    monthlyAvg: 0,
    totalMeals: 0,
    ngosCount: 0,
    growthPercent: 0,
    isLoading: true,
  });

  useEffect(() => {
    let channel: any = null;

    async function loadImpactData() {
      try {
        const { supabase } = await import("@/integrations/supabase/client");

        const [donationsRes, ngosRes] = await Promise.all([
          supabase.from("donations").select("created_at, status"),
          supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "receiver"),
        ]);

        const donations = donationsRes.data || [];
        const ngosCount = ngosRes.count || 0;
        const totalMeals = donations.length;

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const now = new Date();
        const monthsMap: Record<string, number> = {};
        const monthsOrder: string[] = [];

        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthLabel = monthNames[d.getMonth()];
          monthsMap[monthLabel] = 0;
          monthsOrder.push(monthLabel);
        }

        donations.forEach((d) => {
          if (!d.created_at) return;
          const date = new Date(d.created_at);
          const monthLabel = monthNames[date.getMonth()];
          if (monthsMap[monthLabel] !== undefined) {
            monthsMap[monthLabel] += 1;
          }
        });

        const formattedChartData: MonthlyData[] = monthsOrder.map((name) => ({
          name,
          meals: monthsMap[name] || 0,
        }));

        const counts = Object.values(monthsMap);
        const peakMonth = Math.max(...counts, 0);
        const activeMonths = counts.filter((c) => c > 0).length || 1;
        const monthlyAvg = Math.round(totalMeals / activeMonths);

        const currentMonthCount = counts[counts.length - 1] || 0;
        const lastMonthCount = counts[counts.length - 2] || 0;
        let growthPercent = 0;
        if (lastMonthCount > 0) {
          growthPercent = Math.round(((currentMonthCount - lastMonthCount) / lastMonthCount) * 100);
        } else if (currentMonthCount > 0) {
          growthPercent = 100;
        }

        setChartData(formattedChartData);
        setStats({
          peakMonth,
          monthlyAvg,
          totalMeals,
          ngosCount,
          growthPercent,
          isLoading: false,
        });
      } catch (err) {
        console.error("Failed to load impact analytics:", err);
      }
    }

    loadImpactData();

    import("@/integrations/supabase/client").then(({ supabase }) => {
      channel = supabase
        .channel("realtime-impact-analytics")
        .on("postgres_changes", { event: "*", schema: "public", table: "donations" }, () => loadImpactData())
        .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => loadImpactData())
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

  const miniStats = [
    { label: "Peak Month Peak", value: stats.peakMonth.toLocaleString(), icon: TrendingUp, color: "text-emerald-500" },
    { label: "Monthly Average", value: stats.monthlyAvg.toLocaleString(), icon: BarChart3, color: "text-blue-500" },
    { label: "Total Meals Tracked", value: stats.totalMeals.toLocaleString(), icon: Utensils, color: "text-amber-500" },
    { label: "Shelters Supported", value: stats.ngosCount > 0 ? `${stats.ngosCount}+` : "0", icon: Target, color: "text-purple-500" },
  ];

  return (
    <section className="py-28 bg-muted/20 relative overflow-hidden border-y border-border/40">
      <div className="absolute top-0 right-0 w-[650px] h-[650px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-amber-400/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 relative z-10">
        
        {/* Section Header */}
        <div
          ref={ref}
          className={`text-center mb-16 ${isIntersecting ? "animate-fade-up-blur opacity-100" : "opacity-0"}`}
        >
          <span className="glass-pill text-teal-700 dark:text-teal-300 text-xs font-extrabold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            <span>Verifiable Impact Intelligence</span>
          </span>

          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mt-3 tracking-[-0.03em]"
            style={{ lineHeight: "1.10" }}
          >
            Measurable change across{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
              every community
            </span>
          </h2>
          <p className="mt-5 text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Every recorded surplus posting is accounted for and traced to local NGOs and hunger-relief centers.
          </p>
        </div>

        {/* Main 3D Chart Card */}
        <div
          className={`rounded-3xl border border-border/60 bg-card/90 dark:bg-card/40 backdrop-blur-2xl overflow-hidden transition-all duration-500 ${
            isIntersecting ? "animate-fade-up-blur opacity-100" : "opacity-0"
          }`}
          style={{
            animationDelay: "150ms",
            boxShadow: "var(--shadow-neumorphic)",
          }}
        >
          {/* Top Specular Rim */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

          {/* Card Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 sm:p-8 pb-4">
            <div>
              <h3 className="text-2xl font-black text-foreground tracking-tight">Meals Redistributed Velocity</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Real-time tracking of food packages diverted from landfills
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-2xl border border-emerald-500/20 shadow-xs">
              <TrendingUp className="w-4 h-4" />
              <span className="font-extrabold text-xs font-mono">
                {stats.growthPercent >= 0 ? `+${stats.growthPercent}%` : `${stats.growthPercent}%`} MoM Trajectory
              </span>
            </div>
          </div>

          {/* Mini Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-y border-border/40 mx-6 sm:mx-8 rounded-2xl overflow-hidden bg-muted/40 backdrop-blur-md">
            {miniStats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="flex flex-col items-center py-4 px-3 border-r border-border/40 last:border-r-0 hover:bg-card/40 transition-colors"
                >
                  <Icon className={`w-4 h-4 ${s.color} mb-1`} />
                  <p className="text-lg sm:text-xl font-black text-foreground font-mono">{s.value}</p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Chart Canvas Area */}
          <div className="h-[280px] sm:h-[340px] w-full px-4 sm:px-8 pt-8 pb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMeals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-[0.06]" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "currentColor", opacity: 0.5, fontSize: 12, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "currentColor", opacity: 0.5, fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#10b981", strokeWidth: 1.5, strokeDasharray: "4 4" }} />
                <Area
                  type="monotone"
                  dataKey="meals"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorMeals)"
                  animationDuration={1600}
                  dot={{ fill: "#10b981", r: 4, strokeWidth: 2, stroke: "#ffffff" }}
                  activeDot={{ r: 7, fill: "#10b981", stroke: "#ffffff", strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </section>
  );
}
