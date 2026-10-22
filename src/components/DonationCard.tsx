import { useState, useEffect } from "react";
import { 
  MapPin, 
  Clock, 
  Package, 
  UtensilsCrossed, 
  User, 
  Phone, 
  MessageSquare, 
  AlertTriangle, 
  Navigation,
  CheckCircle2
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { Donation } from "@/hooks/use-donations";

interface DonationCardProps {
  donation: Donation;
  distanceKm?: number | null;
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

function getRemainingTime(endIso: string) {
  const diff = new Date(endIso).getTime() - Date.now();
  if (diff <= 0) return { isExpired: true, text: "Expired", isUrgent: false };

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const isUrgent = diff < 2 * 60 * 60 * 1000; // less than 2 hours remaining

  let text = "";
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    text = `${days}d ${hours % 24}h left`;
  } else if (hours > 0) {
    text = `${hours}h ${minutes}m left`;
  } else {
    text = `${minutes}m left`;
  }

  return { isExpired: false, text, isUrgent };
}

export function DonationCard({
  donation,
  distanceKm,
  viewAs = "receiver",
  onRequestPickup,
  onMarkPickedUp,
  hasRequestedByMe = false,
  isRequesting = false,
  children,
}: DonationCardProps) {
  const [remaining, setRemaining] = useState(() => getRemainingTime(donation.pickup_window_end));

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(getRemainingTime(donation.pickup_window_end));
    }, 30000);
    return () => clearInterval(timer);
  }, [donation.pickup_window_end]);

  const isExpired = donation.status === "expired" || remaining.isExpired;
  const isAvailable = donation.status === "available" && !isExpired;
  const isConfirmed = donation.status === "confirmed";
  const isPickedUp = donation.status === "picked_up";

  // Contact details for pickup coordination
  const contactPhone = (donation as any).contact_phone || donation.profiles?.phone || "";
  const cleanPhone = contactPhone.replace(/[^0-9]/g, "");
  const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const waMessage = encodeURIComponent(
    `Hello! Reaching out via ShareABite regarding food donation: "${donation.food_type}" (${donation.quantity}). Is this still ready for pickup?`
  );
  const waUrl = cleanPhone ? `https://wa.me/${waPhone}?text=${waMessage}` : null;

  const directionsUrl = donation.latitude && donation.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${donation.latitude},${donation.longitude}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(donation.pickup_address)}`;

  return (
    <div
      className={`relative rounded-2xl bg-card border transition-all duration-300 ease-out overflow-hidden group animate-fade-up-blur flex flex-col justify-between
        ${isPickedUp || isExpired 
          ? "opacity-60 border-border/40" 
          : "border-border/70 hover:border-primary/40 hover:shadow-[0_16px_36px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_16px_36px_rgba(0,0,0,0.3)] hover:-translate-y-1 active:scale-[0.99]"}
      `}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Top Specular Rim */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Photo */}
      {donation.photo_url && (
        <div className="h-44 overflow-hidden relative flex-shrink-0">
          <div className="absolute inset-0 bg-black/5 dark:bg-black/20 group-hover:bg-transparent transition-colors duration-300 z-10" />
          <img
            src={donation.photo_url}
            alt={donation.food_type}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Badges: Urgency & Distance */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Urgent Badge if expiring < 2h */}
              {remaining.isUrgent && !isPickedUp && !isExpired && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 animate-pulse">
                  <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  Urgent: {remaining.text}
                </span>
              )}

              {/* Non-urgent remaining time */}
              {!remaining.isUrgent && !isExpired && !isPickedUp && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border/40">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  {remaining.text}
                </span>
              )}

              {/* Distance Pill if available */}
              {distanceKm != null && !isNaN(distanceKm) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                  <Navigation className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  {distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m away` : `${distanceKm.toFixed(1)} km away`}
                </span>
              )}
            </div>

            <StatusBadge status={donation.status} />
          </div>

          {/* Title and Quantity */}
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                <UtensilsCrossed className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-foreground text-[15px] truncate leading-tight">
                  {donation.food_type}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 font-medium">
                  <Package className="w-3 h-3" />
                  {donation.quantity}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {donation.description && (
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 leading-relaxed line-clamp-2">
              {donation.description}
            </p>
          )}

          {/* Details: Address & Pickup Window */}
          <div className="space-y-2 text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border/50">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary" />
              <span className="leading-snug text-foreground/90 font-medium">{donation.pickup_address}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
              <span className="text-foreground/90 font-medium">{formatWindow(donation.pickup_window_start, donation.pickup_window_end)}</span>
            </div>

            {/* Contact phone (shown to receiver) */}
            {viewAs === "receiver" && contactPhone && (
              <div className="flex items-center justify-between pt-1.5 border-t border-border/40">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{contactPhone}</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">Donor Contact</span>
              </div>
            )}
          </div>

          {/* Step-by-Step Status Timeline */}
          {donation.status !== "expired" && (
            <div className="mt-4 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
                <span className="font-semibold text-primary">Progress Timeline</span>
                <span className="capitalize font-medium">{donation.status.replace("_", " ")}</span>
              </div>
              <div className="relative flex items-center justify-between px-2">
                <div className="absolute left-2 right-2 h-0.5 bg-border -z-0" />
                <div 
                  className="absolute left-2 h-0.5 bg-primary transition-all duration-500 -z-0" 
                  style={{ 
                    width: donation.status === "available" ? "0%" 
                         : donation.status === "requested" ? "33%" 
                         : donation.status === "confirmed" ? "66%" 
                         : donation.status === "picked_up" ? "100%" : "0%"
                  }}
                />
                
                {[
                  { key: "available", label: "Listed" },
                  { key: "requested", label: "Requested" },
                  { key: "confirmed", label: "Confirmed" },
                  { key: "picked_up", label: "Picked" }
                ].map((step) => {
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
                            ? 'bg-primary border-primary text-primary-foreground scale-110' 
                            : 'bg-card border-border text-muted-foreground'
                        }`}
                      >
                        {isCompleted && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black animate-pulse" />
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
              <p className="text-xs font-semibold text-foreground mb-1.5">Confirmed Donor</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                {donation.profiles.full_name && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span className="text-foreground font-medium">{donation.profiles.full_name}</span>
                    {donation.profiles.org_name && ` · ${donation.profiles.org_name}`}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 1-Click Coordination Actions (WhatsApp, Call, Directions) */}
        <div className="mt-4 pt-3 border-t border-border/40">
          {viewAs === "receiver" && (isAvailable || isConfirmed) && (
            <div className="flex items-center gap-2 mb-2.5">
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/25 text-xs font-semibold transition-all active:scale-[0.98]"
                  title="Chat on WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  WhatsApp
                </a>
              )}

              {cleanPhone && (
                <a
                  href={`tel:${cleanPhone}`}
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-muted text-foreground hover:bg-muted/80 border border-border/50 text-xs font-semibold transition-all active:scale-[0.98]"
                  title="Direct Call"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call
                </a>
              )}

              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 border border-blue-500/25 text-xs font-semibold transition-all active:scale-[0.98]"
                title="Get Directions on Google Maps"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Route
              </a>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {viewAs === "receiver" && isAvailable && !hasRequestedByMe && onRequestPickup && (
              <button
                onClick={() => onRequestPickup(donation.id)}
                disabled={isRequesting}
                className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {isRequesting ? "Requesting…" : "Request Pickup"}
              </button>
            )}

            {viewAs === "receiver" && hasRequestedByMe && donation.status === "requested" && (
              <div className="w-full text-xs text-amber-700 dark:text-amber-300 font-semibold px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-center">
                Pickup request sent — waiting for donor approval
              </div>
            )}

            {viewAs === "receiver" && isConfirmed && onMarkPickedUp && (
              <button
                onClick={() => onMarkPickedUp(donation.id)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Food Picked Up
              </button>
            )}

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
