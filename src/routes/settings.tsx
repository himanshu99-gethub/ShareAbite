import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, User, Phone, Building2, Save, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [{ title: "ShareABite — Settings" }],
  }),
});

function SettingsPage() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { profile, isLoading: profileLoading, refetch } = useProfile(user?.id);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [orgName, setOrgName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (authLoading || profileLoading) return;
    if (!user) { navigate({ to: "/login" }); return; }
    if (!profile?.role) { navigate({ to: "/onboarding" }); return; }
    setFullName(profile.full_name ?? "");
    setPhone(profile.phone ?? "");
    setOrgName(profile.org_name ?? "");
  }, [user, authLoading, profile, profileLoading, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim() || null,
          phone: phone.trim() || null,
          org_name: orgName.trim() || null,
        })
        .eq("id", user.id);
      if (error) throw error;
      toast.success("Profile updated!");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar profile={profile} />
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your ShareABite profile.</p>
        </div>

        <div className="bg-white rounded-2xl border border-border/60 p-6 mb-4">
          {/* Role badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 ${
            profile?.role === "donor" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
          }`}>
            {profile?.role === "donor" ? "Donor Account" : "Receiver Account"}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-primary" />Full Name</span>
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-primary" />Phone Number</span>
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                type="tel"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-primary" />Organization Name</span>
              </label>
              <input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Restaurant, NGO, or shelter name"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
              <input
                value={user?.email ?? ""}
                disabled
                className="w-full rounded-xl border border-input bg-muted/30 px-4 py-3 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-bold hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm shadow-primary/20 flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-destructive/20 p-6">
          <h2 className="font-semibold text-foreground mb-1">Sign Out</h2>
          <p className="text-sm text-muted-foreground mb-4">You'll be redirected to the home page.</p>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-destructive/30 text-destructive text-sm font-semibold hover:bg-destructive/8 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign out of ShareABite
          </button>
        </div>
      </div>
    </div>
  );
}
