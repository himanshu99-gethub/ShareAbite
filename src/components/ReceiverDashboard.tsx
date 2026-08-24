import { useState, useEffect } from "react";
import { MapPin, List, Clock, Loader2, Search, Package, History, UserCog, CheckCircle2, Users } from "lucide-react";
import { toast } from "sonner";
import { useDonations } from "@/hooks/use-donations";
import { usePickupRequests } from "@/hooks/use-pickup-requests";
import { DonationCard } from "./DonationCard";
import { MapView } from "./MapView";

interface ReceiverDashboardProps {
  receiverId: string;
  receiverName: string | null;
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function ReceiverDashboard({ receiverId, receiverName }: ReceiverDashboardProps) {
  const [activeTab, setActiveTab] = useState<"browse" | "requests" | "history" | "profile">("browse");
  const [viewMode, setViewMode] = useState<"map" | "list">("list");
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { donations, isLoading: donationsLoading, refetch: refetchDonations } = useDonations({
    statusFilter: ["available"],
  });

  const { requests, isLoading: requestsLoading, refetch: refetchRequests } = usePickupRequests({
    receiverId,
  });

  // Request geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
        },
        () => {} // silent fail
      );
    }
  }, []);

  const myRequestedDonationIds = new Set(requests.map((r) => r.donation_id));

  // Sort by distance if we have user location
  const sortedDonations = [...donations]
    .filter((d) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        d.food_type.toLowerCase().includes(q) ||
        d.pickup_address.toLowerCase().includes(q) ||
        (d.description?.toLowerCase().includes(q) ?? false)
      );
    })
    .sort((a, b) => {
      if (userLat && userLng && a.latitude && a.longitude && b.latitude && b.longitude) {
        return (
          getDistanceKm(userLat, userLng, a.latitude, a.longitude) -
          getDistanceKm(userLat, userLng, b.latitude, b.longitude)
        );
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const handleRequestPickup = async (donationId: string) => {
    setRequestingId(donationId);
    try {
      const { supabase } = await import("@/integrations/supabase/client");

      // Create pickup request
      const { error: reqErr } = await supabase.from("pickup_requests").insert({
        donation_id: donationId,
        receiver_id: receiverId,
        status: "pending",
      });
      if (reqErr) throw reqErr;

      // Update donation status to requested
      const { error: donErr } = await supabase
        .from("donations")
        .update({ status: "requested" })
        .eq("id", donationId)
        .eq("status", "available");
      if (donErr) throw donErr;

      toast.success("Pickup request sent! The donor will be notified. 🎉");
      refetchDonations();
      refetchRequests();
    } catch (err: any) {
      if (err.code === "23505") {
        toast.error("You already have a request for this donation");
      } else {
        toast.error(err.message || "Failed to send pickup request");
      }
    } finally {
      setRequestingId(null);
    }
  };

  const handleMarkPickedUp = async (donationId: string) => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase
        .from("donations")
        .update({ status: "picked_up" })
        .eq("id", donationId);
      if (error) throw error;
      toast.success("Marked as picked up! Thank you for making a difference 💚");
      refetchDonations();
      refetchRequests();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  // For my requests tab — fetch donations for confirmed/pending requests
  const requestDonations = requests
    .filter((r) => r.donations)
    .map((r) => ({
      ...r.donations!,
      created_at: r.created_at,
      _requestStatus: r.status,
      _requestId: r.id,
    }));

  const historyPickups = requestDonations.filter((d) => d.status === "picked_up");
  const uniqueDonors = new Set(historyPickups.map((d) => d.donor_id)).size;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="text-2xl font-bold text-foreground mt-0.5">
          {receiverName ?? "Receiver"} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {sortedDonations.length} donation{sortedDonations.length !== 1 ? "s" : ""} available nearby.
          {userLat ? " Sorted by distance." : " Enable location for distance-based sorting."}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1 mb-6 w-fit">
        <button
          onClick={() => setActiveTab("browse")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "browse"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Search className="w-4 h-4" />
          Browse Donations
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "requests"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="w-4 h-4" />
          My Requests
          {requests.length > 0 && (
            <span className="ml-1 bg-primary/15 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {requests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "history"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="w-4 h-4" />
          History
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "profile"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserCog className="w-4 h-4" />
          Profile
        </button>
      </div>

      {activeTab === "browse" && (
        <div>
          {/* Search + View Toggle */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by food type, location..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
            <div className="flex gap-1 bg-muted/50 rounded-xl p-1 flex-shrink-0">
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === "map" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                <MapPin className="w-4 h-4" /> Map
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === "list" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                <List className="w-4 h-4" /> List
              </button>
            </div>
          </div>

          {/* Map view */}
          {viewMode === "map" && (
            <div className="mb-6">
              <MapView
                donations={sortedDonations}
                userLat={userLat}
                userLng={userLng}
              />
            </div>
          )}

          {/* Donation list */}
          {donationsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : sortedDonations.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
              <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-semibold text-foreground">
                {searchQuery ? "No matching donations found" : "No donations available right now"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery ? "Try a different search term." : "Check back soon — donors are adding food regularly."}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedDonations.map((d) => {
                const dist =
                  userLat && userLng && d.latitude && d.longitude
                    ? getDistanceKm(userLat, userLng, d.latitude, d.longitude)
                    : null;
                return (
                  <div key={d.id} className="relative">
                    {dist !== null && (
                      <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm border border-border/60 text-xs font-semibold text-muted-foreground px-2 py-1 rounded-lg">
                        📍 {dist < 1 ? `${(dist * 1000).toFixed(0)}m` : `${dist.toFixed(1)}km`}
                      </div>
                    )}
                    <DonationCard
                      donation={d}
                      viewAs="receiver"
                      onRequestPickup={handleRequestPickup}
                      hasRequestedByMe={myRequestedDonationIds.has(d.id)}
                      isRequesting={requestingId === d.id}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "requests" && (
        <div>
          {requestsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
              <Clock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-semibold text-foreground">No requests yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Browse available donations and send a pickup request.
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {requestDonations.map((d) => {
                // Determine step in the flow
                // 1. Pending (Requested)
                // 2. Confirmed (Accepted by donor)
                // 3. Picked Up (Completed)
                const isPending = d._requestStatus === "pending" || d.status === "requested";
                const isConfirmed = d.status === "confirmed";
                const isPickedUp = d.status === "picked_up";
                const step = isPickedUp ? 3 : isConfirmed ? 2 : 1;

                return (
                  <div key={d._requestId} className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                    {/* Status Tracker */}
                    <div className="bg-muted/30 px-6 py-4 border-b border-border/50">
                      <div className="flex items-center justify-between text-xs font-semibold mb-2">
                        <span className={step >= 1 ? "text-primary" : "text-muted-foreground"}>Requested</span>
                        <span className={step >= 2 ? "text-primary" : "text-muted-foreground"}>Confirmed</span>
                        <span className={step >= 3 ? "text-primary" : "text-muted-foreground"}>Picked Up</span>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out rounded-full" 
                          style={{ width: step === 1 ? '15%' : step === 2 ? '50%' : '100%' }}
                        />
                      </div>
                      {step === 2 && (
                        <p className="text-xs text-amber-600 font-medium mt-3 flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                          </span>
                          Volunteer En Route / Ready for Pickup
                        </p>
                      )}
                    </div>
                    
                    {/* Card Content */}
                    <div className="p-4 flex-1">
                      <DonationCard
                        donation={d}
                        viewAs="receiver"
                        hasRequestedByMe={true}
                        onMarkPickedUp={isConfirmed ? handleMarkPickedUp : undefined}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div>
          {requestsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : historyPickups.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
              <History className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-semibold text-foreground">No completed pickups yet</p>
              <p className="text-sm text-muted-foreground mt-1">When you mark a donation as picked up, it will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-primary/10 rounded-2xl border border-primary/20 p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-primary">Total Pickups</h3>
                    <p className="text-2xl font-bold text-foreground">
                      {historyPickups.length}
                    </p>
                  </div>
                </div>
                <div className="bg-accent/10 rounded-2xl border border-accent/20 p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-accent">Donors Helped</h3>
                    <p className="text-2xl font-bold text-foreground">
                      {uniqueDonors}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-border/60 overflow-hidden mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Donor</th>
                        <th className="px-5 py-3">Food & Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {historyPickups.map((d) => (
                        <tr key={d.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">
                            {new Date(d.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-semibold text-foreground">{d.profiles?.full_name ?? "Unknown Donor"}</div>
                            {d.profiles?.org_name && <div className="text-xs text-muted-foreground">{d.profiles.org_name}</div>}
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-medium text-foreground">{d.food_type}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{d.quantity}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "profile" && (
        <div className="max-w-xl">
          <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <UserCog className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{receiverName ?? "Receiver"}</h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/10 text-accent text-xs font-semibold mt-1">
                  NGO / Shelter
                </span>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Account Info</h3>
                <p className="text-sm text-muted-foreground">To update your details, please contact support or check back later for the edit profile feature.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
