import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, User, Phone, Building2, Save, LogOut, ArrowLeft, ShieldCheck, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [{ title: "ShareABite — Account Settings" }],
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
      toast.success("Profile updated successfully! ✨");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const isDonor = profile?.role === "donor";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar profile={profile} />
      <div className="max-w-xl mx-auto px-4 py-8 sm:py-10 animate-page-enter">
        {/* Back Link */}
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-5 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Account Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update your ShareABite donor or shelter organization information.
          </p>
        </div>

        {/* Form Card */}
        <div
          className="bg-card rounded-2xl border border-border/60 p-6 sm:p-7 mb-6 shadow-xs"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          {/* Role badge */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Account Classification</span>
            </div>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isDonor 
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300" 
                  : "bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-300"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isDonor ? "bg-emerald-500" : "bg-amber-500"}`} />
              {isDonor ? "Verified Food Donor" : "Registered NGO / Shelter"}
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  Full Name
                </span>
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all placeholder:text-muted-foreground/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  Direct Phone Number
                </span>
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                type="tel"
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all placeholder:text-muted-foreground/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  Organization / Entity Name
                </span>
              </label>
              <input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Restaurant, Banquet, NGO, or Community Shelter"
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all placeholder:text-muted-foreground/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  Registered Email (Fixed)
                </span>
              </label>
              <input
                value={user?.email ?? ""}
                disabled
                className="w-full rounded-xl border border-input bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed font-mono text-xs"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-bold hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? "Updating Profile…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Danger zone */}
        <div className="bg-card rounded-2xl border border-destructive/25 p-6 shadow-xs">
          <h2 className="font-bold text-foreground text-sm mb-1">Session Management</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Sign out of your active session on this browser.
          </p>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-destructive/30 text-destructive text-xs font-bold hover:bg-destructive/10 transition-all active:scale-[0.98] cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign out of ShareABite
          </button>
        </div>
      </div>
    </div>
  );
}
