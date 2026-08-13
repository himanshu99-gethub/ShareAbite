import { useState, useEffect, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkOtpSession = useCallback(() => {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("otp_access_token");
    const userJson = localStorage.getItem("otp_user");

    if (token && userJson) {
      try {
        const parsedUser = JSON.parse(userJson);
        const syntheticUser: Partial<User> = {
          id: parsedUser.id,
          email: parsedUser.email,
          user_metadata: { role: parsedUser.role },
          aud: "authenticated",
          created_at: new Date().toISOString(),
          app_metadata: { provider: "email_otp" },
        };

        const syntheticSession: Partial<Session> = {
          access_token: token,
          token_type: "bearer",
          user: syntheticUser as User,
          expires_in: 7 * 24 * 3600,
        };

        setUser(syntheticUser as User);
        setSession(syntheticSession as Session);
        setIsLoading(false);
        return true;
      } catch (e) {
        localStorage.removeItem("otp_access_token");
        localStorage.removeItem("otp_user");
      }
    }
    return false;
  }, []);

  useEffect(() => {
    // Check local OTP session first
    const hasOtpSession = checkOtpSession();

    // Listen to custom OTP auth change events
    const handleOtpAuthChange = () => {
      checkOtpSession();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("otp_auth_change", handleOtpAuthChange);
      window.addEventListener("storage", handleOtpAuthChange);
    }

    // Dynamic import to avoid SSR issues with supabase client
    import("@/integrations/supabase/client").then(({ supabase }) => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          setIsLoading(false);
        } else if (!hasOtpSession) {
          setSession(null);
          setUser(null);
          setIsLoading(false);
        }
      });

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          setIsLoading(false);
        } else if (!hasOtpSession) {
          checkOtpSession();
        }
      });

      return () => {
        subscription.unsubscribe();
        if (typeof window !== "undefined") {
          window.removeEventListener("otp_auth_change", handleOtpAuthChange);
          window.removeEventListener("storage", handleOtpAuthChange);
        }
      };
    });
  }, [checkOtpSession]);

  const signOut = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("otp_access_token");
      localStorage.removeItem("otp_user");
      window.dispatchEvent(new Event("otp_auth_change"));
    }

    setUser(null);
    setSession(null);

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      await supabase.auth.signOut();
    } catch (e) {}
  }, []);

  return { user, session, isLoading, signOut };
}
