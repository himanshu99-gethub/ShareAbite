import { useState, useEffect, useCallback } from "react";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;

export function useProfile(userId: string | null | undefined, userEmail?: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId && !userEmail) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // ── 1. Gather every hint about who this user is ──────────────────────────
      let localRole: "donor" | "receiver" = "donor";
      let localEmail = (userEmail || "").trim().toLowerCase();
      let localFullName = "";

      if (typeof window !== "undefined") {
        const otpUserStr = localStorage.getItem("otp_user");
        if (otpUserStr) {
          try {
            const parsed = JSON.parse(otpUserStr);
            if (parsed.role) localRole = parsed.role;
            if (parsed.email && !localEmail) localEmail = parsed.email.trim().toLowerCase();
            if (parsed.full_name) localFullName = parsed.full_name;
          } catch (_) {}
        }

        if (localEmail) {
          const savedName = localStorage.getItem(`registered_name_${localEmail}`);
          if (savedName?.trim()) localFullName = savedName.trim();

          const savedRole = localStorage.getItem(`registered_role_${localEmail}`) as "donor" | "receiver" | null;
          if (savedRole) localRole = savedRole;
        }
      }

      const { supabase } = await import("@/integrations/supabase/client");
      let data: Profile | null = null;

      // ── 2. Look up by EMAIL first (unifies Google + Email accounts) ───────────
      // This is the key: BOTH Google OAuth and Email OTP users share the same
      // profile row because profiles.email is unique.
      if (localEmail) {
        try {
          const { data: byEmail } = await supabase
            .from("profiles")
            .select("*")
            .eq("email" as any, localEmail)
            .maybeSingle();

          if (byEmail) data = byEmail as Profile;
        } catch (_) {}
      }

      // ── 3. Fall back to ID lookup (handles freshly-created Google OAuth users) ─
      if (!data && userId) {
        try {
          const { data: byId } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

          if (byId) {
            data = byId as Profile;
            // Back-fill email on the row so future email lookups succeed
            if (localEmail && !(data as any).email) {
              await supabase
                .from("profiles")
                .update({ email: localEmail } as any)
                .eq("id", userId);
            }
          }
        } catch (_) {}
      }

      // ── 4. If still nothing, create a new profile row anchored to the Supabase UID ─
      if (!data && userId && localEmail) {
        const newProfile = {
          id: userId,
          email: localEmail,
          full_name: localFullName || localEmail.split("@")[0],
          role: localRole,
          created_at: new Date().toISOString(),
        };
        try {
          await supabase.from("profiles").upsert(newProfile as any);
        } catch (_) {}
        data = {
          id: userId,
          full_name: newProfile.full_name,
          role: localRole,
          phone: null,
          org_name: null,
          created_at: newProfile.created_at,
        };
      }

      // ── 5. Determine final values ─────────────────────────────────────────────
      // Always prefer the Supabase user.id (the real UUID) as the canonical ID.
      // This ensures donations created while logged in via Google are shown when
      // the same user logs in via OTP/password.
      const canonicalId = data?.id || userId || "user-anonymous";
      const finalName = data?.full_name || localFullName || (localEmail ? localEmail.split("@")[0] : "User");
      const finalRole = data?.role || localRole;

      // Persist for offline / next load
      if (typeof window !== "undefined" && localEmail) {
        if (finalName && !finalName.includes("@")) {
          localStorage.setItem(`registered_name_${localEmail}`, finalName);
        }
        localStorage.setItem(`registered_role_${localEmail}`, finalRole);
        localStorage.setItem(`canonical_user_id_${localEmail}`, canonicalId);
      }

      setProfile({
        ...(data ?? {}),
        id: canonicalId,
        full_name: finalName,
        role: finalRole,
        phone: (data as any)?.phone ?? null,
        org_name: (data as any)?.org_name ?? null,
        created_at: data?.created_at ?? new Date().toISOString(),
      });
    } catch (err) {
      setError(err as Error);
      setProfile({
        id: userId || "user-anonymous",
        full_name: "User",
        role: "donor",
        phone: null,
        org_name: null,
        created_at: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, userEmail]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const refetch = useCallback(() => fetchProfile(), [fetchProfile]);

  return { profile, isLoading, error, refetch };
}
