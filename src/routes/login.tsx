import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Leaf, Mail, Lock, Eye, EyeOff, KeyRound, Loader2, Send,
  User as UserIcon, ArrowLeft, CheckCircle2, UtensilsCrossed, Building2,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { OtpVerification } from "@/components/auth/OtpVerification";

async function getSupabase() {
  const { supabase } = await import("@/integrations/supabase/client");
  return supabase;
}

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const LOGIN_TESTIMONIALS = [
  {
    name: "Chef Rajeev Kumar",
    role: "The Grand Palace Hotel",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rajeev&backgroundColor=b6e3f4",
    quote: "Within 30 minutes of posting, an NGO collected our surplus food. ShareABite is a game-changer.",
  },
  {
    name: "Sister Maria Thomas",
    role: "Hope Shelter Trust",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria&backgroundColor=d1d4f9",
    quote: "Now we receive fresh, nutritious meals from restaurants near us every day. Life-changing.",
  },
  {
    name: "Priya Menon",
    role: "Green Leaf Bakery",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya&backgroundColor=ffd5dc",
    quote: "Listing a donation takes me 2 minutes. The map shows me the NGO picking it up.",
  },
  {
    name: "Ahmed Khan",
    role: "City Food Bank",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed&backgroundColor=c0aede",
    quote: "Real-time notifications mean we can dispatch a volunteer the moment a donation is confirmed.",
  },
];

// ── Left brand panel (desktop only) ──────────────────────────────────────────
function BrandPanel() {
  const [reviewsList, setReviewsList] = useState(LOGIN_TESTIMONIALS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [realStats, setRealStats] = useState({
    meals: 0,
    donors: 0,
    ngos: 0,
  });

  useEffect(() => {
    // Load live real stats from Supabase
    async function loadLiveStats() {
      try {
        const supabase = await getSupabase();
        const [donationsRes, donorsRes, ngosRes] = await Promise.all([
          supabase.from("donations").select("id", { count: "exact", head: true }),
          supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "donor"),
          supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "receiver"),
        ]);

        setRealStats({
          meals: donationsRes.count ?? 0,
          donors: donorsRes.count ?? 0,
          ngos: ngosRes.count ?? 0,
        });
      } catch (err) {
        console.error("Failed to load login live stats:", err);
      }
    }

    loadLiveStats();
  }, []);

  useEffect(() => {
    // 1. Load user submitted reviews if available
    try {
      const localStr = localStorage.getItem("shareabite_user_reviews");
      if (localStr) {
        const localReviews = JSON.parse(localStr);
        if (localReviews.length > 0) {
          const userFormatted = localReviews.map((r: any) => ({
            name: r.name,
            role: r.role || "Community Member",
            avatar: r.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(r.name)}`,
            quote: r.quote,
          }));
          setReviewsList([...userFormatted, ...LOGIN_TESTIMONIALS]);
        }
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (reviewsList.length <= 1) return;

    // Auto-rotate reviews every 5 minutes (300,000 ms)
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % reviewsList.length);
        setFade(true);
      }, 400);
    }, 300000);

    return () => clearInterval(interval);
  }, [reviewsList.length]);

  const activeReview = reviewsList[currentIndex] || LOGIN_TESTIMONIALS[0];

  const statsDisplay = [
    { value: realStats.meals > 0 ? `${realStats.meals.toLocaleString()}+` : "0", label: "Meals" },
    { value: realStats.donors > 0 ? `${realStats.donors.toLocaleString()}+` : "0", label: "Donors" },
    { value: realStats.ngos > 0 ? `${realStats.ngos.toLocaleString()}+` : "0", label: "NGOs" },
  ];

  return (
    <div className="hidden lg:flex flex-col justify-between p-10 relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-[#071a0e] min-h-full">
      {/* Decorative orbs */}
      <div className="absolute top-[-80px] right-[-60px] w-72 h-72 rounded-full bg-emerald-500/15 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[-40px] w-56 h-56 rounded-full bg-amber-400/10 blur-[70px] pointer-events-none" />
      <div className="absolute inset-0 dot-grid opacity-[0.07]" />

      {/* Top: Logo */}
      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg border border-white/20">
            <Leaf className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">
            Share<span className="text-emerald-400">A</span>Bite
          </span>
        </div>

        <h2 className="text-3xl font-bold text-white leading-tight">
          Fight hunger.
          <br />
          <span className="text-emerald-400">One meal</span> at a time.
        </h2>
        <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-xs">
          Connect your surplus food with NGOs and shelters nearby.
          Real-time, zero cost, massive impact.
        </p>
      </div>

      {/* Middle: Auto-Rotating Testimonial */}
      <div className="relative z-10 my-auto">
        <div className={`bg-white/8 border border-white/12 rounded-2xl p-5 backdrop-blur-sm transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"}`}>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-amber-400 text-sm">★</span>
              ))}
            </div>
            {/* Dots navigation */}
            <div className="flex items-center gap-1">
              {reviewsList.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setFade(false);
                    setTimeout(() => {
                      setCurrentIndex(idx);
                      setFade(true);
                    }, 200);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === (currentIndex % 5) ? "w-4 bg-emerald-400" : "w-1.5 bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="text-sm text-white/80 leading-relaxed italic min-h-[44px]">
            "{activeReview.quote}"
          </p>

          <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-white/10">
            <img
              src={activeReview.avatar}
              alt={activeReview.name}
              className="w-8 h-8 rounded-full border border-white/20 object-cover"
            />
            <div>
              <p className="text-xs font-bold text-white">{activeReview.name}</p>
              <p className="text-[11px] text-white/50">{activeReview.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Live Real Stats */}
      <div className="relative z-10 flex items-center gap-6">
        {statsDisplay.map((s) => (
          <div key={s.label}>
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-white/50">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main LoginPage ────────────────────────────────────────────────────────────
function LoginPage() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot_password">("signin");
  const [authMethod, setAuthMethod] = useState<"password" | "otp">("password");
  const [step, setStep] = useState<"email" | "verify">("email");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [resetStep, setResetStep] = useState<"request" | "verify">("request");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [role, setRole] = useState<"donor" | "receiver">("donor");

  const isDonor = role === "donor";

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/app?role=${role}` },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const sendOtpToEmail = async (emailInput: string, otpType: "signup" | "login" = "login"): Promise<boolean> => {
    // For signup: only use our custom backend OTP (NOT signInWithOtp which creates a passwordless account)
    // For login OTP tab: use both Supabase magic-link AND custom backend
    const cleanEmail = emailInput.trim().toLowerCase();

    if (otpType === "signup") {
      // Only send via custom backend — password-based signup handles account creation separately
      try {
        const res = await fetch("/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, role, type: "signup" }),
        });
        const data = await res.json();
        return !!data.success;
      } catch {
        return false;
      }
    }

    // Login OTP flow: try Supabase magic-link first, fallback to custom backend
    const supabase = await getSupabase();
    const [supaResult, customResult] = await Promise.allSettled([
      supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: { shouldCreateUser: false },
      }),
      fetch("/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, role, type: otpType }),
      }).then((r) => r.json()),
    ]);

    const supaOk = supaResult.status === "fulfilled" && !supaResult.value.error;
    const customOk = customResult.status === "fulfilled" && (customResult.value as any).success;

    return supaOk || customOk;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Please enter your email address."); return; }
    setOtpSending(true);
    try {
      const supabase = await getSupabase();
      const emailLower = email.trim().toLowerCase();

      // Block OTP login if account doesn't exist
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("email")
        .eq("email" as any, emailLower)
        .maybeSingle();

      if (!existingProfile) {
        toast.error("❌ No account found with this email. Please create an account first.", {
          duration: 5000,
          action: {
            label: "Create Account",
            onClick: () => { setAuthMode("signup"); },
          },
        });
        setAuthMode("signup");
        return;
      }

      const ok = await sendOtpToEmail(email);
      if (!ok) { toast.error("Failed to send OTP. Please try again."); return; }
      toast.success("Verification OTP sent to your email!");
      setStep("verify");
    } catch (err: any) {
      toast.error(err.message || "Network error.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { toast.error("Please enter your name."); return; }
    if (!email.trim()) { toast.error("Please enter your email."); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters."); return; }

    const emailLower = email.trim().toLowerCase();

    try {
      const supabase = await getSupabase();

      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("email")
        .eq("email" as any, emailLower)
        .maybeSingle();

      if (existingProfile) {
        toast.error("⚠️ Account already exists! Please Sign In instead.", {
          duration: 5000,
          action: {
            label: "Go to Sign In",
            onClick: () => { setAuthMode("signin"); setAuthMethod("password"); },
          },
        });
        setAuthMode("signin");
        setAuthMethod("password");
        return;
      }
    } catch (_) {}

    if (typeof window !== "undefined") {
      localStorage.setItem(`registered_name_${emailLower}`, fullName.trim());
      localStorage.setItem(`registered_role_${emailLower}`, role);
    }

    setOtpSending(true);
    try {
      const supabase = await getSupabase();

      // Step 1: Create the Supabase account with email + password (NOT signInWithOtp)
      // This ensures the user can log in with password later without OTP being required
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: emailLower,
        password,
        options: {
          data: { full_name: fullName.trim(), role },
        },
      });

      if (signUpError) {
        // If user already exists in Supabase auth but not in profiles, let them sign in
        if (signUpError.message?.toLowerCase().includes("already registered") ||
            signUpError.message?.toLowerCase().includes("already exists")) {
          toast.error("⚠️ Account already exists! Please Sign In instead.", {
            duration: 5000,
            action: {
              label: "Go to Sign In",
              onClick: () => { setAuthMode("signin"); setAuthMethod("password"); },
            },
          });
          setAuthMode("signin");
          setAuthMethod("password");
          return;
        }
        // For other errors, fall through to custom OTP-only registration
        console.warn("[Signup] Supabase signUp error:", signUpError.message);
      }

      // Step 2: Send OTP only via our custom backend for email verification
      // Do NOT call signInWithOtp — that would overwrite the password-based account
      const ok = await sendOtpToEmail(email, "signup");
      if (!ok) { toast.error("Failed to send verification OTP."); return; }
      toast.success("Verification code sent! Check your email.");
      setStep("verify");
    } catch (err: any) {
      toast.error(err.message || "Network error.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleOtpSuccess = async (token: string, user: any) => {
    const emailLower = (user.email || email).trim().toLowerCase();
    const savedName = typeof window !== "undefined"
      ? localStorage.getItem(`registered_name_${emailLower}`) || ""
      : "";
    const finalName = user.full_name || savedName || fullName.trim() || emailLower.split("@")[0];

    if (typeof window !== "undefined") {
      if (finalName && !finalName.includes("@")) {
        localStorage.setItem(`registered_name_${emailLower}`, finalName);
      }
      localStorage.setItem(`registered_role_${emailLower}`, user.role || role);
    }

    if (token === "supabase-session") {
      navigate({ to: "/app" });
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("otp_user", JSON.stringify({
        id: user.id,
        email: emailLower,
        role: user.role || role,
        full_name: finalName,
      }));
      localStorage.setItem("otp_access_token", token || `token-${Date.now()}`);
      window.dispatchEvent(new Event("otp_auth_change"));
    }
    navigate({ to: "/app" });
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);

    try {
      const supabase = await getSupabase();
      const emailLower = email.trim().toLowerCase();

      // Block login if no account exists for this email
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("email")
        .eq("email" as any, emailLower)
        .maybeSingle();

      if (!existingProfile) {
        toast.error("❌ No account found with this email. Please create an account first.", {
          duration: 5000,
          action: {
            label: "Create Account",
            onClick: () => { setAuthMode("signup"); },
          },
        });
        setAuthMode("signup");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailLower,
        password,
      });

      if (!error && data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", data.user.id)
          .maybeSingle();

        const savedName = typeof window !== "undefined"
          ? localStorage.getItem(`registered_name_${emailLower}`) || ""
          : "";
        const finalName = profile?.full_name || savedName || data.user.user_metadata?.full_name || emailLower.split("@")[0];

        if (typeof window !== "undefined") {
          localStorage.setItem(`registered_name_${emailLower}`, finalName);
        }

        navigate({ to: "/app" });
        return;
      }

      const response = await fetch("/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailLower, password }),
      });
      const resData = await response.json();

      if (response.ok && resData.success) {
        handleOtpSuccess(resData.token, resData.user);
        return;
      }

      toast.error(error?.message || resData.error || "Invalid email or password.");
    } catch (err: any) {
      toast.error(err.message || "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Please enter your email."); return; }
    setResetLoading(true);
    try {
      const supabase = await getSupabase();
      const emailLower = email.trim().toLowerCase();

      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("email")
        .eq("email" as any, emailLower)
        .maybeSingle();

      if (!existingProfile) {
        toast.error("❌ No account found with this email. Please create an account first.", {
          duration: 5000,
          action: {
            label: "Create Account",
            onClick: () => { setAuthMode("signup"); setAuthMode("forgot_password"); },
          },
        });
        setAuthMode("signup");
        setResetLoading(false);
        return;
      }

      const response = await fetch("/auth/reset-password-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      if (!data.success) { toast.error(data.error || "Failed to send reset OTP."); return; }
      toast.success("Password reset OTP sent to your email!");
      setResetStep("verify");
    } catch (err: any) {
      toast.error(err.message || "Network error.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetOtp.length !== 6) { toast.error("Please enter the 6-digit OTP code."); return; }
    if (newPassword.length < 6) { toast.error("New password must be at least 6 characters."); return; }
    setResetLoading(true);
    try {
      const response = await fetch("/auth/verify-reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: resetOtp.trim(), newPassword: newPassword.trim() }),
      });
      const data = await response.json();
      if (!data.success) { toast.error(data.error || "Failed to reset password."); return; }
      toast.success("Password reset successful! Logging you in...");

      try {
        const supabase = await getSupabase();
        await supabase.auth.updateUser({ password: newPassword.trim() });
      } catch (_) {}

      if (data.token && data.user) {
        handleOtpSuccess(data.token, data.user);
      } else {
        setAuthMode("signin");
        setAuthMethod("password");
        setPassword(newPassword);
        setResetStep("request");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error.");
    } finally {
      setResetLoading(false);
    }
  };

  // ── Shared input field style ──
  const inputCls = "w-full rounded-xl border border-input bg-background pl-11 pr-4 py-2.5 sm:py-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all placeholder:text-muted-foreground/70";
  const submitBtnCls = (isLoading: boolean) =>
    `w-full rounded-xl py-3 text-sm font-bold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-40 shadow-lg flex items-center justify-center gap-2 ${
      isDonor ? "bg-primary hover:bg-primary/90 shadow-primary/20" : "bg-accent hover:bg-accent/90 shadow-accent/20"
    } ${isLoading ? "pointer-events-none" : ""}`;

  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-primary/4 -translate-x-1/2 -translate-y-1/2 blur-[80px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-accent/6 translate-x-1/3 translate-y-1/3 blur-[100px]" />
      </div>

      {/* Card container */}
      <div className="relative z-10 w-full max-w-[900px] grid lg:grid-cols-[1fr_1fr] rounded-2xl overflow-hidden shadow-2xl border border-border/50 animate-fade-up-blur">

        {/* Left brand panel */}
        <BrandPanel />

        {/* Right form panel */}
        <div className="bg-card p-5 sm:p-8 md:p-10 flex flex-col justify-center min-h-[520px] sm:min-h-[600px]">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center justify-center gap-2.5 mb-6 sm:mb-8 lg:hidden hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-md border border-primary/20">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">
              Share<span className="text-primary">A</span>Bite
            </span>
          </Link>

          {/* ── FORGOT PASSWORD ── */}
          {authMode === "forgot_password" ? (
            <div className="space-y-5 animate-fade-in">
              <button
                type="button"
                onClick={() => { setAuthMode("signin"); setResetStep("request"); }}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>

              <div className="mb-2">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Reset Password</h1>
                <p className="text-sm text-muted-foreground mt-1.5">
                  {resetStep === "request" ? "Enter your email to receive a reset code" : "Enter the OTP and your new password"}
                </p>
              </div>

              {resetStep === "request" ? (
                <form onSubmit={handleRequestPasswordReset} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter registered email"
                      className={inputCls} required
                    />
                  </div>
                  <button type="submit" disabled={resetLoading || !email.trim()} className={submitBtnCls(resetLoading)}>
                    {resetLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Reset Code</>}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmPasswordReset} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="email" value={email} readOnly className="w-full rounded-xl border border-input bg-muted/40 pl-11 pr-4 py-3 text-sm text-muted-foreground cursor-not-allowed" />
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text" value={resetOtp} onChange={(e) => setResetOtp(e.target.value)}
                      placeholder="6-digit OTP code" maxLength={6}
                      className={`${inputCls} font-mono`} required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password (min. 6 chars)"
                      className={`${inputCls} pr-11`} required minLength={6}
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button type="submit" disabled={resetLoading || resetOtp.length !== 6 || newPassword.length < 6} className={submitBtnCls(resetLoading)}>
                    {resetLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : <><CheckCircle2 className="w-4 h-4" /> Update Password & Login</>}
                  </button>
                </form>
              )}
            </div>

          ) : step === "verify" ? (
            /* ── OTP VERIFY STEP ── */
            <OtpVerification
              email={email} role={role} fullName={fullName} password={password}
              onSuccess={handleOtpSuccess} onBack={() => setStep("email")}
            />

          ) : (
            /* ── MAIN AUTH FORM ── */
            <div className="space-y-5 animate-fade-in">
              {/* Tab: Sign in / Sign up */}
              <div className="flex bg-muted/60 p-1 rounded-xl gap-1">
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m} type="button" onClick={() => setAuthMode(m)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                      authMode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m === "signin" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>

              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  {authMode === "signup"
                    ? isDonor ? "Register as Donor 🍽️" : "Register as NGO 🏠"
                    : authMethod === "otp" ? "Email OTP Login"
                    : isDonor ? "Welcome back 👋" : "NGO Login"}
                </h1>
                <p className="text-sm text-muted-foreground mt-1.5">
                  {authMode === "signup"
                    ? isDonor ? "Share surplus food with nearby shelters" : "Find and rescue food for families in need"
                    : authMethod === "otp" ? "Secure passwordless email verification"
                    : "Sign in to access your dashboard"}
                </p>
              </div>

              {/* Role selector */}
              <div className="grid grid-cols-2 gap-2">
                {(["donor", "receiver"] as const).map((r) => (
                  <button
                    key={r} type="button" onClick={() => setRole(r)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                      role === r
                        ? r === "donor"
                          ? "border-primary bg-primary/6 text-primary"
                          : "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                        : "border-border/60 text-muted-foreground hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    {r === "donor"
                      ? <UtensilsCrossed className="w-4 h-4" />
                      : <Building2 className="w-4 h-4" />}
                    <span className="text-xs">{r === "donor" ? "Restaurant / Donor" : "NGO / Shelter"}</span>
                  </button>
                ))}
              </div>

              {/* Auth method tabs (sign-in only) */}
              {authMode === "signin" && (
                <div className="grid grid-cols-2 gap-1 p-1 bg-muted/50 rounded-xl text-xs font-semibold">
                  {(["password", "otp"] as const).map((m) => (
                    <button key={m} type="button" onClick={() => setAuthMethod(m)}
                      className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                        authMethod === m ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {m === "password" ? <><Lock className="w-3.5 h-3.5" /> Password</> : <><KeyRound className="w-3.5 h-3.5 text-primary" /> Email OTP</>}
                    </button>
                  ))}
                </div>
              )}

              {/* Google OAuth */}
              <button
                type="button" onClick={handleGoogleSignIn} disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-input bg-background py-3 text-sm font-medium hover:bg-muted/30 transition-all disabled:opacity-40 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {googleLoading ? "Please wait..." : "Continue with Google"}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border/60" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-border/60" />
              </div>

              {/* ── Sign Up Form ── */}
              {authMode === "signup" ? (
                <form onSubmit={handleSignUpSubmit} className="space-y-3">
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name / Organisation Name"
                      className={inputCls} required
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className={inputCls} required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"} value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create Password (min 6 chars)"
                      className={`${inputCls} pr-11`} required minLength={6}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button type="submit" disabled={otpSending || !fullName.trim() || !email.trim() || password.length < 6} className={submitBtnCls(otpSending)}>
                    {otpSending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</> : <><Send className="w-4 h-4" /> Create Account via OTP</>}
                  </button>
                </form>

              /* ── OTP Login ── */
              ) : authMethod === "otp" ? (
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className={inputCls} required
                    />
                  </div>
                  <button type="submit" disabled={otpSending || !email.trim()} className={submitBtnCls(otpSending)}>
                    {otpSending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</> : <><Send className="w-4 h-4" /> Send OTP Code</>}
                  </button>
                </form>

              /* ── Password Login ── */
              ) : (
                <form onSubmit={handlePasswordSignIn} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      className={inputCls} required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"} value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className={`${inputCls} pr-11`} required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => { setAuthMode("forgot_password"); setResetStep("request"); }}
                      className="text-xs font-semibold text-primary hover:text-primary/80 hover:underline transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <button type="submit" disabled={loading} className={submitBtnCls(loading)}>
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                      : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              )}

              {/* Switch mode link */}
              <p className="text-center text-sm text-muted-foreground pt-1">
                {authMode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => { setAuthMode(authMode === "signup" ? "signin" : "signup"); if (authMode === "signup") setAuthMethod("password"); }}
                  className="text-primary font-semibold hover:underline"
                >
                  {authMode === "signup" ? "Sign in" : "Sign up free"}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
