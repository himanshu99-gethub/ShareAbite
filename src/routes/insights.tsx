import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, UtensilsCrossed, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { useDonations } from "@/hooks/use-donations";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/insights")({
  component: InsightsPage,
  head: () => ({
    meta: [{ title: "ShareABite — Impact & Insights" }],
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
      <div className="min-h-screen flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar profile={profile} />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Impact & Insights</h1>
          <p className="text-muted-foreground mt-1">
            {profile?.role === "donor"
              ? "See the impact of your food donations."
              : "Track your food rescue activity."}
          </p>
        </div>

        {donationsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stat grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Donations", value: stats.total, icon: UtensilsCrossed, color: "text-primary bg-primary/10" },
                { label: "Picked Up", value: stats.pickedUp, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
                { label: "In Progress", value: stats.confirmed + stats.requested, icon: Clock, color: "text-amber-600 bg-amber-50" },
                { label: "Success Rate", value: `${successRate}%`, icon: TrendingUp, color: "text-blue-600 bg-blue-50" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-border/60 p-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Status breakdown */}
            <div className="bg-white rounded-2xl border border-border/60 p-6">
              <h2 className="font-bold text-foreground mb-5">Status Breakdown</h2>
              {[
                { label: "Available", count: stats.available, color: "bg-emerald-500", total: stats.total },
                { label: "Requested", count: stats.requested, color: "bg-amber-500", total: stats.total },
                { label: "Confirmed", count: stats.confirmed, color: "bg-blue-500", total: stats.total },
                { label: "Picked Up", count: stats.pickedUp, color: "bg-gray-400", total: stats.total },
                { label: "Expired", count: stats.expired, color: "bg-red-500", total: stats.total },
              ].map((s) => (
                <div key={s.label} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                    <span className="text-sm font-semibold text-foreground">{s.count}</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${s.color} rounded-full transition-all duration-700`}
                      style={{ width: s.total > 0 ? `${(s.count / s.total) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
