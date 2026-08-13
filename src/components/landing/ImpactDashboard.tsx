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
import { TrendingUp, Utensils, Target, BarChart3 } from "lucide-react";

interface MonthlyData {
  name: string;
  meals: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border/60 rounded-xl p-3 shadow-lg text-sm">
        <p className="text-muted-foreground font-medium mb-1">{label}</p>
        <p className="font-bold text-emerald-600 dark:text-emerald-400">
          {payload[0].value.toLocaleString()} meals
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

        // Fetch all donations and NGOs
        const [donationsRes, ngosRes] = await Promise.all([
          supabase.from("donations").select("created_at, status"),
          supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "receiver"),
        ]);

        const donations = donationsRes.data || [];
        const ngosCount = ngosRes.count || 0;
        const totalMeals = donations.length;

        // Generate last 6 months list
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

        // Count real donations per month
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

        // Calculate month over month growth
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

    // Supabase Realtime updates
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
    { label: "Peak Month", value: stats.peakMonth.toLocaleString(), icon: TrendingUp, color: "text-emerald-500" },
    { label: "Monthly Avg", value: stats.monthlyAvg.toLocaleString(), icon: BarChart3, color: "text-blue-500" },
    { label: "Total Meals", value: stats.totalMeals.toLocaleString(), icon: Utensils, color: "text-amber-500" },
    { label: "NGOs Served", value: stats.ngosCount > 0 ? `${stats.ngosCount}+` : "0", icon: Target, color: "text-purple-500" },
  ];

  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden border-y border-border/30">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/4 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-400/4 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-5 relative z-10">
        {/* Section Header */}
        <div
          ref={ref}
          className={`text-center mb-16 opacity-0 ${isIntersecting ? "animate-fade-up-blur opacity-100" : ""}`}
        >
          <span className="eyebrow-tag mb-4 inline-flex">📈 Analytics</span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-4"
            style={{ lineHeight: "1.12" }}
          >
            Our Growing{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">
              Impact
            </span>
          </h2>
          <p className="mt-5 text-muted-foreground text-lg max-w-lg mx-auto">
            Every number represents real meals reaching people who need them most.
          </p>
        </div>

        {/* Main Chart Card */}
        <div
          className={`bg-card border border-border/50 rounded-3xl overflow-hidden opacity-0 ${
            isIntersecting ? "animate-fade-up-blur opacity-100" : ""
          }`}
          style={{
            animationDelay: "200ms",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 sm:p-8 pb-0">
            <div>
              <h3 className="text-xl font-bold text-foreground">Meals Redistributed</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Total meals saved from wasting — last 6 months
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl border border-emerald-200/60 dark:border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
              <span className="font-bold text-sm">
                {stats.growthPercent >= 0 ? `+${stats.growthPercent}%` : `${stats.growthPercent}%`} this month
              </span>
            </div>
          </div>

          {/* Mini stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-y border-border/40 mt-6 mx-6 sm:mx-8 rounded-2xl overflow-hidden">
            {miniStats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className={`flex flex-col items-center py-4 px-3 bg-muted/40 border-r border-border/40 last:border-r-0
                    opacity-0 ${isIntersecting ? "animate-fade-up-blur opacity-100" : ""}`}
                  style={{ animationDelay: `${350 + i * 60}ms` }}
                >
                  <Icon className={`w-4 h-4 ${s.color} mb-1.5`} />
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Chart */}
          <div className="h-[280px] sm:h-[320px] w-full px-4 sm:px-8 pt-6 pb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMeals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-[0.07]" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "currentColor", opacity: 0.45, fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "currentColor", opacity: 0.45, fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#10b981", strokeWidth: 1, strokeDasharray: "4 4" }} />
                <Area
                  type="monotone"
                  dataKey="meals"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorMeals)"
                  animationDuration={1800}
                  dot={{ fill: "#10b981", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#10b981", stroke: "white", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
