import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2, UtensilsCrossed, CheckCircle2, Clock, TrendingUp, ArrowLeft, BarChart3, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { useDonations } from "@/hooks/use-donations";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/insights")({
  component: InsightsPage,
  head: () => ({
    meta: [
      { title: "ShareABite — Impact & Insights" },
      { name: "description", content: "Track your food rescue metrics, success rates, and community impact." }
    ],
  }),
});

function InsightsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { profile, isLoading: profileLoading } = useProfile(user?.id);
  const { donations, isLoading: donationsLoading } = useDonations(
    profile?.role === "donor" ? { donorId: user?.id } : {}
  );

  useEffect(() => {
    if (authLoading || profileLoading) return;
    if (!user) navigate({ to: "/login" });
    else if (!profile?.role) navigate({ to: "/onboarding" });
  }, [user, authLoading, profile, profileLoading, navigate]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const stats = {
    total: donations.length,
    available: donations.filter((d) => d.status === "available").length,
    confirmed: donations.filter((d) => d.status === "confirmed").length,
    pickedUp: donations.filter((d) => d.status === "picked_up").length,
    requested: donations.filter((d) => d.status === "requested").length,
    expired: donations.filter((d) => d.status === "expired").length,
  };

  const successRate = stats.total > 0 ? Math.round((stats.pickedUp / stats.total) * 100) : 0;
  const isDonor = profile?.role === "donor";

  return (
    <div className="min-h-screen bg-background">
      <Navbar profile={profile} />
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10 animate-page-enter">
        {/* Back Link */}
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-5 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-3">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Community Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Impact & Insights
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            {isDonor
              ? "Comprehensive analytics of your surplus food contributions and shelter distributions."
              : "Overview of your food rescue operations, claimed postings, and community distributions."}
          </p>
        </div>

        {donationsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stat grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { 
                  label: "Total Postings", 
                  value: stats.total, 
                  icon: UtensilsCrossed, 
                  color: "text-primary", 
                  bg: "bg-primary/10 border-primary/20" 
                },
                { 
                  label: "Successfully Picked", 
                  value: stats.pickedUp, 
                  icon: CheckCircle2, 
                  color: "text-emerald-600 dark:text-emerald-400", 
                  bg: "bg-emerald-500/10 border-emerald-500/25" 
                },
                { 
                  label: "In Progress", 
                  value: stats.confirmed + stats.requested, 
                  icon: Clock, 
                  color: "text-amber-600 dark:text-amber-400", 
                  bg: "bg-amber-500/10 border-amber-500/25" 
                },
                { 
                  label: "Completion Rate", 
                  value: `${successRate}%`, 
                  icon: TrendingUp, 
                  color: "text-blue-600 dark:text-blue-400", 
                  bg: "bg-blue-500/10 border-blue-500/25" 
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-card rounded-2xl border border-border/60 p-5 shadow-xs transition-transform hover:-translate-y-0.5 duration-200"
                  style={{ boxShadow: 'var(--shadow-card)' }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3.5 border ${s.bg}`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums font-mono">
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Status breakdown */}
            <div
              className="bg-card rounded-2xl border border-border/60 p-6 sm:p-7 shadow-xs"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground">Status Distribution</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Real-time breakdown of all recorded food batches</p>
                </div>
                <span className="text-xs font-mono font-bold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md">
                  {stats.total} Total
                </span>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Available for Pickup", count: stats.available, color: "bg-emerald-500" },
                  { label: "Requested by Shelters", count: stats.requested, color: "bg-amber-500" },
                  { label: "Confirmed & En Route", count: stats.confirmed, color: "bg-blue-500" },
                  { label: "Picked Up & Distributed", count: stats.pickedUp, color: "bg-emerald-700 dark:bg-emerald-400" },
                  { label: "Expired", count: stats.expired, color: "bg-rose-500" },
                ].map((s) => {
                  const percentage = stats.total > 0 ? Math.round((s.count / stats.total) * 100) : 0;
                  return (
                    <div key={s.label}>
                      <div className="flex items-center justify-between mb-1.5 text-xs">
                        <span className="font-medium text-foreground">{s.label}</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-bold text-foreground">{s.count}</span>
                          <span className="text-muted-foreground text-[11px]">({percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-2.5 bg-muted/60 rounded-full overflow-hidden border border-border/40">
                        <div
                          className={`h-full ${s.color} rounded-full transition-all duration-700 ease-out`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Environmental & Humanitarian Estimate */}
            <div
              className="rounded-2xl bg-gradient-to-br from-primary/10 via-emerald-500/5 to-amber-500/10 border border-primary/20 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white shadow-xs flex-shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Estimated Ecological Impact</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Redirected food waste prevents roughly 2.5 kg of CO₂ equivalent per kilogram saved.
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <span className="text-2xl font-black text-primary font-mono tabular-nums">
                  ~{(stats.pickedUp * 42).toLocaleString()} kg
                </span>
                <p className="text-[11px] font-semibold text-muted-foreground">Est. CO₂ Offset</p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
