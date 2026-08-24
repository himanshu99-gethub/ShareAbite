import { useState, useEffect } from "react";
import { KeyRound, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface OtpVerificationProps {
  email: string;
  role: "donor" | "receiver";
  fullName?: string;
  password?: string;
  onSuccess: (token: string, user: any) => void;
  onBack: () => void;
}

async function getSupabase() {
  const { supabase } = await import("@/integrations/supabase/client");
  return supabase;
}

export function OtpVerification({ email, role, fullName, password, onSuccess, onBack }: OtpVerificationProps) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      setCanResend(false);
      timer = setInterval(() => setCountdown((p) => p - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otp || otp.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the OTP.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const supabase = await getSupabase();
      const emailLower = email.trim().toLowerCase();

      // If user signed up with a password, they already have a Supabase account.
      // Try signing them in with password after OTP verification (custom backend).
      // This avoids the "OTP sent on every login" loop caused by unconfirmed email.
      if (password) {
        // First verify OTP via custom backend (to validate the code they entered)
        const response = await fetch("/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, role, fullName, password }),
        });
        const resData = await response.json();

        if (!response.ok || !resData.success) {
          // Also try Supabase native OTP as fallback
          const { data: supaData, error: supaError } = await supabase.auth.verifyOtp({
            email: emailLower,
            token: otp,
            type: "email",
          });

          if (supaError || !supaData.user) {
            setErrorMessage(resData.error || "Invalid OTP code. Please try again.");
            toast.error(resData.error || "Invalid OTP code.");
            return;
          }

          // Supabase OTP verified — update user and sign in with password
          await supabase.auth.updateUser({
            data: { full_name: fullName?.trim() || emailLower.split("@")[0], role },
            password,
          });
          await supabase.from("profiles").upsert({
            id: supaData.user.id,
            email: emailLower,
            full_name: fullName?.trim() || supaData.user.user_metadata?.full_name || emailLower.split("@")[0],
            role,
            created_at: new Date().toISOString(),
          } as any);

          toast.success("Email verified & account ready!");
          onSuccess("supabase-session", {
            id: supaData.user.id,
            email: emailLower,
            role,
            full_name: fullName?.trim() || supaData.user.user_metadata?.full_name || emailLower.split("@")[0],
          });
          return;
        }

        // Custom OTP verified — now sign in with password to get a real Supabase session
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: emailLower,
          password,
        });

        if (!signInError && signInData.user) {
          // Update profile in DB
          await supabase.from("profiles").upsert({
            id: signInData.user.id,
            email: emailLower,
            full_name: fullName?.trim() || signInData.user.user_metadata?.full_name || emailLower.split("@")[0],
            role,
            created_at: new Date().toISOString(),
          } as any);

          if (typeof window !== "undefined") {
            localStorage.setItem(`registered_name_${emailLower}`, fullName?.trim() || emailLower.split("@")[0]);
            localStorage.setItem(`registered_role_${emailLower}`, role);
          }

          toast.success("Email verified & account ready!");
          onSuccess("supabase-session", {
            id: signInData.user.id,
            email: emailLower,
            role,
            full_name: fullName?.trim() || signInData.user.user_metadata?.full_name || emailLower.split("@")[0],
          });
          return;
        }

        // signInWithPassword failed (e.g. email not confirmed yet) — use custom token
        toast.success("Email verified successfully!");
        onSuccess(resData.token, resData.user);
        return;
      }

      // No password (OTP login tab) — use Supabase native OTP verification
      const { data, error } = await supabase.auth.verifyOtp({
        email: emailLower,
        token: otp,
        type: "email",
      });

      if (error || !data.user) {
        // Fallback: try our custom backend OTP verification
        const response = await fetch("/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, role, fullName, password }),
        });
        const resData = await response.json();

        if (!response.ok || !resData.success) {
          setErrorMessage(resData.error || "Invalid OTP code. Please try again.");
          toast.error(resData.error || "Invalid OTP code.");
          return;
        }

        toast.success("Email verified successfully!");
        onSuccess(resData.token, resData.user);
        return;
      }

      // Save profile metadata after real Supabase session created
      const realUser = data.user;
      const finalName = fullName?.trim() || realUser.user_metadata?.full_name || email.split("@")[0];

      // Update user metadata (name, role)
      await supabase.auth.updateUser({
        data: { full_name: finalName, role },
      });

      // Upsert profile row with email column for future email-based lookup
      await supabase.from("profiles").upsert({
        id: realUser.id,
        email: emailLower,
        full_name: finalName,
        role,
        created_at: new Date().toISOString(),
      } as any);

      // Save to localStorage for immediate use
      if (typeof window !== "undefined") {
        localStorage.setItem(`registered_name_${emailLower}`, finalName);
        localStorage.setItem(`registered_role_${emailLower}`, role);
      }

      toast.success("Email verified & account ready!");
      onSuccess("supabase-session", {
        id: realUser.id,
        email: emailLower,
        role,
        full_name: finalName,
      });
    } catch (err: any) {
      const msg = err.message || "Network error. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify as soon as all 6 digits are typed or pasted
  useEffect(() => {
    if (otp.length === 6 && !loading) {
      handleVerify();
    }
  }, [otp]);

  const handleResend = async () => {
    if (!canResend || resendLoading) return;
    setResendLoading(true);
    setErrorMessage(null);

    // Instant optimistic UI reset — 0ms delay!
    setCountdown(60);
    setCanResend(false);
    setOtp("");

    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Call high-speed Resend API directly (<200ms)
      const response = await fetch("/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, role }),
      });
      const resData = await response.json();

      // 2. Background Supabase trigger without blocking UI
      getSupabase().then((supabase) => {
        supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: { shouldCreateUser: false },
        }).catch(() => {});
      });

      if (resData?.success) {
        toast.success("⚡ Fresh OTP code dispatched to your inbox!");
      } else {
        toast.error(resData?.error || "Failed to resend OTP.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error while resending OTP.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Change Email
      </button>

      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Verify Your Email</h2>
        <p className="text-xs text-muted-foreground mt-1.5">
          We sent a 6-digit verification code to <br />
          <span className="font-semibold text-foreground">{email}</span>
        </p>
      </div>

      {errorMessage && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-xl flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-5">
        <div className="flex justify-center my-2 w-full overflow-x-auto py-1">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(val) => { setOtp(val); if (errorMessage) setErrorMessage(null); }}
            pattern={REGEXP_ONLY_DIGITS}
          >
            <InputOTPGroup className="gap-1.5 sm:gap-2 justify-center">
              {[0,1,2,3,4,5].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="w-9 h-11 sm:w-11 sm:h-12 text-base sm:text-lg font-bold rounded-xl border border-input bg-background text-center focus:ring-2 focus:ring-primary shadow-xs transition-all"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <p className="text-[11px] text-center text-muted-foreground">
          ⏱️ Code expires in <strong>5 minutes</strong>
        </p>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className={`w-full rounded-xl py-3 text-xs font-bold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none shadow-lg flex items-center justify-center gap-2 ${
            role === "donor"
              ? "bg-primary hover:bg-primary/90 shadow-primary/20"
              : "bg-accent hover:bg-accent/90 shadow-accent/20"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Verify & Continue
            </>
          )}
        </button>
      </form>

      <div className="pt-2 text-center border-t border-border/40">
        <p className="text-xs text-muted-foreground mb-2">Didn't receive the email?</p>
        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend || resendLoading}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline disabled:opacity-50 disabled:no-underline transition-all"
        >
          {resendLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Sending OTP...
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              {canResend ? "Resend OTP" : `Resend OTP in ${countdown}s`}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
