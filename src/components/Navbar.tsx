import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Leaf, LogOut, UtensilsCrossed, MapPin, LayoutDashboard, TrendingUp, Settings, Menu, X
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Profile } from "@/hooks/use-profile";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface NavbarProps {
  profile: Profile | null;
}

export function Navbar({ profile }: NavbarProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const isDonor = profile?.role === "donor";

  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">

        {/* ── Logo ── */}
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-85 transition-opacity flex-shrink-0 group"
        >
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-xl bg-primary/20 blur-sm group-hover:blur-md transition-all" />
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-xs border border-primary/25">
              <Leaf className="w-4 h-4 text-white" />
            </div>
          </div>
          <span className="text-base font-bold text-foreground tracking-tight">
            Share<span className="text-primary">A</span>Bite
          </span>
        </Link>

        {/* ── Nav links (Desktop) ── */}
        {profile && (
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/app"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-150"
              activeProps={{ className: "!text-primary !bg-primary/10 font-bold" }}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </Link>

            {isDonor ? (
              <Link
                to="/app"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-150"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                My Donations
              </Link>
            ) : (
              <Link
                to="/app"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-150"
              >
                <MapPin className="w-3.5 h-3.5" />
                Browse Radar
              </Link>
            )}

            <Link
              to="/insights"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-150"
              activeProps={{ className: "!text-primary !bg-primary/10 font-bold" }}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Insights
            </Link>

            <Link
              to="/settings"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-150"
              activeProps={{ className: "!text-primary !bg-primary/10 font-bold" }}
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </Link>
          </nav>
        )}

        {/* ── Right Side ── */}
        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />

          {profile && (
            <>
              {/* Role Pill */}
              <div
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  isDonor
                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300"
                    : "bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-300"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isDonor ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
                {isDonor ? "Donor" : "NGO Shelter"}
              </div>

              {/* Avatar + Name */}
              <Link
                to="/settings"
                title="View Account Settings"
                className="flex items-center gap-2 pl-1 py-1 rounded-lg hover:bg-muted/60 transition-colors"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-xs ${
                    isDonor
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                      : "bg-gradient-to-br from-amber-500 to-amber-600"
                  }`}
                >
                  {initials}
                </div>
                <span className="hidden sm:block text-xs font-bold text-foreground truncate max-w-[90px]">
                  {profile.full_name?.split(" ")[0] || "User"}
                </span>
              </Link>

              {/* Sign Out (Desktop) */}
              <button
                onClick={handleSignOut}
                aria-label="Sign out"
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileOpen((prev) => !prev)}
                aria-label="Toggle navigation"
                className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          )}

          {!profile && (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* ── Mobile Navigation Drawer ── */}
      {profile && mobileOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 border-t border-border/50 bg-background/95 backdrop-blur-xl animate-fade-down space-y-1">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-xs ${
                  isDonor
                    ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                    : "bg-gradient-to-br from-amber-500 to-amber-600"
                }`}
              >
                {initials}
              </div>
              <div>
                <p className="text-xs font-bold text-foreground leading-tight">{profile.full_name || "User"}</p>
                <p className="text-[10px] text-muted-foreground">{isDonor ? "Donor Account" : "NGO Receiver"}</p>
              </div>
            </div>
            <div
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                isDonor
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400"
              }`}
            >
              {isDonor ? "Donor" : "Receiver"}
            </div>
          </div>

          <Link
            to="/app"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-muted/70 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-primary" />
            Dashboard
          </Link>

          <Link
            to="/insights"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-muted/70 transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-primary" />
            Impact & Insights
          </Link>

          <Link
            to="/settings"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-muted/70 transition-colors"
          >
            <Settings className="w-4 h-4 text-primary" />
            Profile & Settings
          </Link>

          <div className="pt-2 border-t border-border/40">
            <button
              onClick={() => {
                setMobileOpen(false);
                handleSignOut();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
