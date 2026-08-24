import { useState, useEffect, useCallback } from "react";
import type { Tables } from "@/integrations/supabase/types";

export type Donation = Tables<"donations"> & {
  profiles?: { full_name: string | null; phone: string | null; org_name: string | null } | null;
};

export function useDonations(options?: { donorId?: string; statusFilter?: string[] }) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDonations = useCallback(async () => {
    setIsLoading(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      let query = supabase
        .from("donations")
        .select("*, profiles(full_name, phone, org_name)")
        .order("created_at", { ascending: false });

      if (options?.donorId) {
        query = query.eq("donor_id", options.donorId);
      }
      if (options?.statusFilter && options.statusFilter.length > 0) {
        query = query.in("status", options.statusFilter as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      setDonations((data as Donation[]) ?? []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [options?.donorId, options?.statusFilter?.join(",")]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  // Realtime subscription
  useEffect(() => {
    let subscription: any = null;

    import("@/integrations/supabase/client").then(({ supabase }) => {
      subscription = supabase
        .channel("donations-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "donations" }, () => {
          fetchDonations();
        })
        .subscribe();
    });

    return () => {
      if (subscription) {
        import("@/integrations/supabase/client").then(({ supabase }) => {
          supabase.removeChannel(subscription!);
        });
      }
    };
  }, [fetchDonations]);

  const refetch = useCallback(() => fetchDonations(), [fetchDonations]);

  return { donations, isLoading, error, refetch };
}
