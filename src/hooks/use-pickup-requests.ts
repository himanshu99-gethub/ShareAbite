import { useState, useEffect, useCallback } from "react";
import type { Tables } from "@/integrations/supabase/types";

export type PickupRequest = Tables<"pickup_requests"> & {
  donations?: {
    id: string;
    food_type: string;
    quantity: string;
    pickup_address: string;
    latitude: number | null;
    longitude: number | null;
    description: string | null;
    photo_url: string | null;
    pickup_window_start: string;
    pickup_window_end: string;
    status: string;
    donor_id: string;
    profiles?: { full_name: string | null; phone: string | null; org_name: string | null } | null;
  } | null;
  profiles?: { full_name: string | null; phone: string | null; org_name: string | null } | null;
};

export function usePickupRequests(options: { donationIds?: string[]; receiverId?: string }) {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!options.donationIds?.length && !options.receiverId) {
      setRequests([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      let query = supabase
        .from("pickup_requests")
        .select(`
          *,
          donations(id, food_type, quantity, pickup_address, latitude, longitude, description, photo_url, pickup_window_start, pickup_window_end, status, donor_id, profiles(full_name, phone, org_name)),
          profiles(full_name, phone, org_name)
        `)
        .order("created_at", { ascending: false });

      if (options.receiverId) {
        query = query.eq("receiver_id", options.receiverId);
      } else if (options.donationIds && options.donationIds.length > 0) {
        query = query.in("donation_id", options.donationIds);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRequests((data as PickupRequest[]) ?? []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [options.donationIds?.join(","), options.receiverId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Realtime subscription
  useEffect(() => {
    let subscription: any = null;

    import("@/integrations/supabase/client").then(({ supabase }) => {
      subscription = supabase
        .channel("pickup-requests-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "pickup_requests" }, () => {
          fetchRequests();
        })
        .subscribe();
    });

    return () => {
      if (subscription) {
        import("@/integrations/supabase/client").then(({ supabase }) => {
          supabase.removeChannel(subscription);
        });
      }
    };
  }, [fetchRequests]);

  const refetch = useCallback(() => fetchRequests(), [fetchRequests]);

  return { requests, isLoading, error, refetch };
}
