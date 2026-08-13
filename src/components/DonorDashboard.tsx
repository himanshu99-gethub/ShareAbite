import { useState } from "react";
import { Plus, UtensilsCrossed, Bell, CheckCircle2, XCircle, Loader2, Package, ChevronRight, History, UserCog } from "lucide-react";
import { toast } from "sonner";
import { useDonations } from "@/hooks/use-donations";
import { usePickupRequests } from "@/hooks/use-pickup-requests";
import { DonationCard } from "./DonationCard";
import { NewDonationForm } from "./NewDonationForm";
import { StatusBadge } from "./StatusBadge";
import { MapView } from "./MapView";

interface DonorDashboardProps {
  donorId: string;
  donorName: string | null;
}

export function DonorDashboard({ donorId, donorName }: DonorDashboardProps) {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"donations" | "requests" | "history" | "profile">("donations");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { donations, isLoading: donationsLoading, refetch: refetchDonations } = useDonations({
    donorId,
  });

  const donationIds = donations.map((d) => d.id);
  const { requests, isLoading: requestsLoading, refetch: refetchRequests } = usePickupRequests({
    donationIds,
  });

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const historyDonations = donations.filter((d) => d.status === "picked_up" || d.status === "expired" || new Date(d.pickup_window_end) < new Date());

  const handleAcceptReject = async (requestId: string, action: "accept" | "reject", donationId: string) => {
    setProcessingId(requestId);
    try {
      const { supabase } = await import("@/integrations/supabase/client");

      if (action === "accept") {
        // Update the request to accepted
        const { error: reqErr } = await supabase
          .from("pickup_requests")
          .update({ status: "accepted" })
          .eq("id", requestId);
        if (reqErr) throw reqErr;

        // Reject all other pending requests for this donation
        await supabase
          .from("pickup_requests")
          .update({ status: "rejected" })
          .eq("donation_id", donationId)
          .eq("status", "pending")
          .neq("id", requestId);

        // Update donation status to confirmed
        const { error: donErr } = await supabase
          .from("donations")
          .update({ status: "confirmed" })
          .eq("id", donationId);
        if (donErr) throw donErr;

        toast.success("Pickup request accepted! 🎉");
      } else {
        const { error } = await supabase
          .from("pickup_requests")
          .update({ status: "rejected" })
          .eq("id", requestId);
        if (error) throw error;
        toast("Request rejected");
      }

      refetchDonations();
      refetchRequests();
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  const stats = {
    total: donations.length,
    active: donations.filter((d) => d.status === "available" || d.status === "requested" || d.status === "confirmed").length,
    pickedUp: donations.filter((d) => d.status === "picked_up").length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-page-enter">
      {/* Greeting */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Welcome back,</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5 tracking-tight">
            {donorName ?? "Donor"} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Your donations are helping fight food waste and hunger.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all duration-200 shadow-md shadow-primary/20 active:scale-[0.98] flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Donation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
        {[
          { label: "Total Donated", value: stats.total, icon: UtensilsCrossed, gradient: "from-emerald-500 to-teal-500", glow: "shadow-emerald-500/20" },
          { label: "Active Now", value: stats.active, icon: Package, gradient: "from-amber-500 to-orange-500", glow: "shadow-amber-500/20" },
          { label: "Delivered", value: stats.pickedUp, icon: CheckCircle2, gradient: "from-blue-500 to-indigo-500", glow: "shadow-blue-500/20" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-2xl border border-border/50 p-4 sm:p-5 text-center hover:-translate-y-0.5 transition-transform duration-200" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mx-auto mb-3 shadow-lg ${s.glow}`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Premium Tabs */}
      <div className="flex gap-1 bg-muted/60 rounded-xl p-1 mb-6 w-fit overflow-x-auto">
        {[
          { id: 'donations', label: 'My Donations', icon: UtensilsCrossed, badge: 0 },
          { id: 'requests',  label: 'Requests',     icon: Bell, badge: pendingRequests.length },
          { id: 'history',   label: 'History',      icon: History, badge: 0 },
          { id: 'profile',   label: 'Profile',      icon: UserCog, badge: 0 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.badge > 0 && (
                <span className="ml-0.5 min-w-[18px] h-[18px] px-1 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-badge-pop">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "donations" && (
        <div>
          {donationsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-2xl bg-muted/20">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <UtensilsCrossed className="w-8 h-8 text-white" />
              </div>
              <p className="font-bold text-foreground text-lg">No donations yet</p>
              <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-xs mx-auto">Share your surplus food and make a real difference in your community.</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
              >
                <Plus className="w-4 h-4" /> Create your first donation
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {donations.map((d) => (
                <DonationCard key={d.id} donation={d} viewAs="donor" />
              ))}
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
            <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-2xl bg-muted/20">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <p className="font-bold text-foreground text-lg">No pickup requests yet</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">Requests from NGOs and shelters will appear here once you post a donation.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Tracking Maps for Accepted Requests */}
              {requests.filter(r => r.status === "accepted" && r.donations).map(req => {
                const d = req.donations!;
                // Simulate volunteer location slightly offset from donor location to show "En Route"
                const ngoLat = (d.latitude || 20.5937) - 0.005;
                const ngoLng = (d.longitude || 78.9629) + 0.005;
                
                return (
                  <div key={`tracking-${req.id}`} className="bg-card rounded-3xl border border-border/60 overflow-hidden shadow-sm flex flex-col mb-6">
                    <div className="bg-muted/30 px-6 py-4 border-b border-border/50 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                        Live Tracking: Volunteer En Route
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {req.profiles?.org_name || req.profiles?.full_name} is on the way
                      </div>
                    </div>
                    <div className="h-[250px] w-full relative">
                      <MapView 
                        donations={[]} 
                        ngos={[{
                          id: req.receiver_id,
                          org_name: req.profiles?.org_name || null,
                          full_name: req.profiles?.full_name || null,
                          phone: req.profiles?.phone || null,
                          latitude: ngoLat,
                          longitude: ngoLng
                        }]}
                        userLat={d.latitude}
                        userLng={d.longitude}
                        showTracking={true}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="space-y-3">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-card rounded-2xl border border-border/50 p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-border transition-all duration-200"
                    style={{ boxShadow: 'var(--shadow-card)' }}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                      {(req.profiles?.full_name ?? "?")[0].toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground text-sm">
                          {req.profiles?.full_name ?? "Unknown Receiver"}
                        </span>
                        {req.profiles?.org_name && (
                          <span className="text-xs text-muted-foreground">· {req.profiles.org_name}</span>
                        )}
                        <StatusBadge status={req.status} />
                      </div>
                      {req.donations && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <UtensilsCrossed className="w-3.5 h-3.5 flex-shrink-0 text-primary/60" />
                          <span className="truncate font-medium">
                            {req.donations.food_type} · {req.donations.quantity}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                          <span className="truncate">{req.donations.pickup_address}</span>
                        </div>
                      )}
                      {req.profiles?.phone && (
                        <p className="text-xs text-muted-foreground mt-1">📞 {req.profiles.phone}</p>
                      )}
                    </div>

                    {req.status === "pending" && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleAcceptReject(req.id, "reject", req.donation_id)}
                          disabled={processingId === req.id}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-destructive/30 text-destructive text-xs font-semibold hover:bg-destructive/8 transition-all disabled:opacity-50"
                        >
                          {processingId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                          Reject
                        </button>
                        <button
                          onClick={() => handleAcceptReject(req.id, "accept", req.donation_id)}
                          disabled={processingId === req.id}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 shadow-sm"
                        >
                          {processingId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Accept
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div>
          {donationsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : historyDonations.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-2xl bg-muted/20">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <History className="w-8 h-8 text-white" />
              </div>
              <p className="font-bold text-foreground text-lg">No history yet</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">Your completed or expired donations will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-primary/10 rounded-2xl border border-primary/20 p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-primary">Your Total Impact</h3>
                  <p className="text-2xl font-bold text-foreground">
                    {historyDonations.filter(d => d.status === "picked_up").length} <span className="text-lg font-medium text-muted-foreground">Pickups Completed</span>
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-border/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Food & Quantity</th>
                        <th className="px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {historyDonations.map((d) => (
                        <tr key={d.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">
                            {new Date(d.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-semibold text-foreground">{d.food_type}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{d.quantity}</div>
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={d.status} />
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
          <div className="bg-card rounded-2xl border border-border/50 p-8" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-5 mb-8">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-emerald-600 blur opacity-20" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {(donorName ?? "D")[0].toUpperCase()}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{donorName ?? "Donor"}</h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 text-xs font-semibold mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Restaurant / Donor
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
                <h3 className="text-sm font-semibold text-foreground mb-1">Account Info</h3>
                <p className="text-sm text-muted-foreground">To update your details, please contact support or check back later for the edit profile feature.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <NewDonationForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onCreated={refetchDonations}
        donorId={donorId}
      />
    </div>
  );
}
