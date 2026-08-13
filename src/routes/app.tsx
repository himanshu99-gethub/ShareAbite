import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Navbar } from "@/components/Navbar";
import { DonorDashboard } from "@/components/DonorDashboard";
import { ReceiverDashboard } from "@/components/ReceiverDashboard";

export const Route = createFileRoute("/app")({
  component: AppPage,
  head: () => ({
    meta: [
      { title: "ShareABite — Dashboard" },
      { name: "description", content: "Manage your food donations and pickup requests on ShareABite." },
    ],
  }),
});

function AppPage() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile(user?.id, user?.email);
  const [redirectChecked, setRedirectChecked] = useState(false);

  useEffect(() => {
    if (authLoading || profileLoading) return;

    if (!user) {
      navigate({ to: "/login" });
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const queryRole = params.get("role") as "donor" | "receiver" | null;

    const saveRole = async (newRole: "donor" | "receiver") => {
      try {
        const userEmail = (user.email || "").toLowerCase();
        // Always use the real Supabase user.id as the canonical profile ID
        const canonicalId = profile?.id || user.id;

        if (typeof window !== "undefined" && userEmail) {
          localStorage.setItem(`registered_role_${userEmail}`, newRole);
        }
        const { supabase } = await import("@/integrations/supabase/client");
        await supabase.from("profiles").upsert({
          id: canonicalId,
          email: userEmail,
          role: newRole,
          full_name: profile?.full_name || user.user_metadata?.full_name || userEmail.split("@")[0]
        } as any);
      } catch (_) {
        // Non-blocking
      } finally {
        window.history.replaceState({}, "", "/app");
        refetchProfile();
        setRedirectChecked(true);
      }
    };

    if (queryRole && (queryRole === "donor" || queryRole === "receiver")) {
      if (!profile?.role) {
        saveRole(queryRole);
        return;
      } else {
        window.history.replaceState({}, "", "/app");
      }
    }

    setRedirectChecked(true);
  }, [user, authLoading, profile, profileLoading, navigate, refetchProfile]);

  const isLoading = authLoading || profileLoading || !redirectChecked;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          {/* Premium loading animation */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-primary/15 blur-md animate-glow-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg border border-primary/20">
              <Leaf className="w-8 h-8 text-white drop-shadow-sm" />
            </div>
            {/* Spinning ring */}
            <div className="absolute -inset-1.5 rounded-[20px] border-2 border-transparent border-t-primary/50 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">ShareABite</p>
            <p className="text-xs text-muted-foreground mt-0.5">Loading your dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile?.role) return null;

  // Use the canonical profile.id (which is always the real Supabase UUID from the profiles table)
  const accountUserId = profile.id;

  return (
    <div className="min-h-screen bg-background">
      <Navbar profile={profile} />
      {profile.role === "donor" ? (
        <DonorDashboard donorId={accountUserId} donorName={profile.full_name || "Restaurant"} />
      ) : (
        <ReceiverDashboard receiverId={accountUserId} receiverName={profile.full_name || "NGO"} />
      )}
    </div>
  );
}
