import { MapPin, Clock, Package, UtensilsCrossed, User, Phone } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { Donation } from "@/hooks/use-donations";

interface DonationCardProps {
  donation: Donation;
  viewAs?: "donor" | "receiver";
  onRequestPickup?: (donationId: string) => void;
  onMarkPickedUp?: (donationId: string) => void;
  hasRequestedByMe?: boolean;
  isRequesting?: boolean;
  children?: React.ReactNode;
}

function formatWindow(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const dateStr = s.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const startTime = s.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const endTime = e.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${dateStr}, ${startTime} – ${endTime}`;
}

export function DonationCard({
  donation,
  viewAs = "receiver",
  onRequestPickup,
  onMarkPickedUp,
  hasRequestedByMe = false,
  isRequesting = false,
  children,
}: DonationCardProps) {
  const isExpired = donation.status === "expired" || new Date(donation.pickup_window_end) < new Date();
  const isAvailable = donation.status === "available" && !isExpired;
  const isConfirmed = donation.status === "confirmed";
  const isPickedUp = donation.status === "picked_up";

  return (
    <div
      className={`relative rounded-2xl bg-white border transition-all duration-300 ease-out overflow-hidden group animate-fade-up-blur
        ${isPickedUp || isExpired 
          ? "opacity-60 border-border/40" 
          : "border-border/60 hover:border-primary/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:scale-[1.01] active:scale-[0.99]"}
      `}
    >
      {/* Premium Glassmorphic Shimmer Effect */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.3)_45%,rgba(255,255,255,0.35)_50%,rgba(255,255,255,0.3)_55%,transparent_65%)] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] transition-opacity duration-300" style={{ transform: "skewX(-15deg)" }} />

      {/* Photo */}
      {donation.photo_url && (
        <div className="h-40 overflow-hidden relative">
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300 z-10" />
          <img
            src={donation.photo_url}
            alt={donation.food_type}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          />
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
              <UtensilsCrossed className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-[15px] truncate leading-tight">
                {donation.food_type}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <Package className="w-3 h-3" />
                {donation.quantity}
              </p>
            </div>
          </div>
          <StatusBadge status={donation.status} />
        </div>

        {/* Description */}
        {donation.description && (
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed line-clamp-2">
            {donation.description}
          </p>
        )}

        {/* Details */}
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary/60" />
            <span className="leading-snug">{donation.pickup_address}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 flex-shrink-0 text-primary/60" />
            <span>{formatWindow(donation.pickup_window_start, donation.pickup_window_end)}</span>
          </div>
          {/* Contact phone — receiver ko dikhe ga */}
          {viewAs === "receiver" && (donation as any).contact_phone && (
            <div className="flex items-center gap-1.5 mt-1 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5">
              <Phone className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">{(donation as any).contact_phone}</span>
              <span className="text-emerald-500 text-[10px] ml-auto">Donor ka number</span>
            </div>
          )}
        </div>

        {/* Step-by-Step Status Flow Progress Tracker */}
        {donation.status !== "expired" && (
          <div className="mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
              <span className="font-semibold text-primary">Status Timeline</span>
              <span className="capitalize">{donation.status.replace("_", " ")}</span>
            </div>
            <div className="relative flex items-center justify-between px-2">
              {/* Connector line */}
              <div className="absolute left-2 right-2 h-0.5 bg-border -z-0" />
              {/* Highlight line based on status */}
              <div 
                className="absolute left-2 h-0.5 bg-primary transition-all duration-500 -z-0" 
                style={{ 
                  width: donation.status === "available" ? "0%" 
                       : donation.status === "requested" ? "33%" 
                       : donation.status === "confirmed" ? "66%" 
                       : donation.status === "picked_up" ? "100%" : "0%"
                }}
              />
              
              {/* Steps */}
              {[
                { key: "available", label: "Listed" },
                { key: "requested", label: "Requested" },
                { key: "confirmed", label: "Confirmed" },
                { key: "picked_up", label: "Picked" }
              ].map((step, idx) => {
                const statuses = ["available", "requested", "confirmed", "picked_up"];
                const currentIdx = statuses.indexOf(donation.status);
                const stepIdx = statuses.indexOf(step.key);
                const isCompleted = stepIdx <= currentIdx;
                const isActive = stepIdx === currentIdx;

                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10">
                    <div 
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-primary border-primary text-white scale-110' 
                          : 'bg-white border-border text-muted-foreground'
                      }`}
                    >
                      {isCompleted && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      )}
                    </div>
                    <span 
                      className={`text-[9px] mt-1 tracking-tight font-medium ${
                        isActive ? 'text-primary font-bold scale-[1.03]' : 'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Donor info (for confirmed pickups shown to receiver) */}
        {isConfirmed && donation.profiles && viewAs === "receiver" && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs font-semibold text-foreground mb-1.5">Donor Contact</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              {donation.profiles.full_name && (
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {donation.profiles.full_name}
                  {donation.profiles.org_name && ` · ${donation.profiles.org_name}`}
                </div>
              )}
              {donation.profiles.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  {donation.profiles.phone}
                </div>
              )}

            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {viewAs === "receiver" && isAvailable && !hasRequestedByMe && onRequestPickup && (
            <button
              onClick={() => onRequestPickup(donation.id)}
              disabled={isRequesting}
              className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
            >
              {isRequesting ? "Requesting…" : "Request Pickup"}
            </button>
          )}
          {viewAs === "receiver" && hasRequestedByMe && donation.status === "requested" && (
            <span className="text-xs text-amber-600 font-medium px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
              Pickup request sent — waiting for approval
            </span>
          )}
          {viewAs === "receiver" && isConfirmed && onMarkPickedUp && (
            <>
              <a 
                href={donation.latitude && donation.longitude 
                  ? `https://www.google.com/maps/dir/?api=1&destination=${donation.latitude},${donation.longitude}`
                  : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(donation.pickup_address)}`
                }
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-all active:scale-[0.98] shadow-sm"
              >
                <MapPin className="w-4 h-4" />
                Live Location
              </a>
              <button
                onClick={() => onMarkPickedUp(donation.id)}
                className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all active:scale-[0.98] shadow-sm"
              >
                Mark as Picked Up
              </button>
            </>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
