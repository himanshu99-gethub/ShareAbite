import { Link, useNavigate } from "@tanstack/react-router";
import {
  Leaf, LogOut, UtensilsCrossed, MapPin, LayoutDashboard
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Profile } from "@/hooks/use-profile";

interface NavbarProps {
  profile: Profile | null;
}

export function Navbar({ profile }: NavbarProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const isDonor = profile?.role === "donor";

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-85 transition-opacity flex-shrink-0 group"
        >
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-lg bg-primary/15 blur-sm group-hover:blur-md transition-all" />
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-sm border border-primary/20">
              <Leaf className="w-4 h-4 text-white" />
            </div>
          </div>
          <span className="text-base font-bold text-foreground tracking-tight">
            Share<span className="text-primary">A</span>Bite
          </span>
        </Link>

        {/* ── Nav links (logged-in) ── */}
        {profile && (
          <nav className="hidden md:flex items-center gap-0.5">
            <Link
              to="/app"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150"
              activeProps={{ className: "!text-primary !bg-primary/8 font-semibold" }}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            {isDonor && (
              <Link
                to="/app"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                My Donations
              </Link>
            )}
            {!isDonor && (
              <Link
                to="/app"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150"
              >
                <MapPin className="w-3.5 h-3.5" />
                Browse Donations
              </Link>
            )}
          </nav>
        )}

        {/* ── Right Side ── */}
        <div className="flex items-center gap-2 ml-auto">

          {profile && (
            <>
              {/* Role Pill */}
              <div
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  isDonor
                    ? "bg-emerald-50 border-emerald-200/60 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400"
                    : "bg-amber-50 border-amber-200/60 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isDonor ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
                {isDonor ? "Donor" : "Receiver"}
              </div>

              {/* Avatar + Name */}
              <div className="flex items-center gap-2 pl-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-sm ${
                    isDonor
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                      : "bg-gradient-to-br from-amber-500 to-amber-600"
                  }`}
                >
                  {initials}
                </div>
                <span className="hidden sm:block text-sm font-medium text-foreground truncate max-w-[100px]">
                  {profile.full_name?.split(" ")[0] || "User"}
                </span>
              </div>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                aria-label="Sign out"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all duration-150"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}

          {!profile && (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
