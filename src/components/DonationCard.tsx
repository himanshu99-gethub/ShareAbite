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
      className={`relative rounded-2xl bg-white border transition-all duration-300 ease-out overflow-hidden group animate-fade-up-blur
        ${isPickedUp || isExpired 
          ? "opacity-60 border-border/40" 
          : "border-border/60 hover:border-primary/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:scale-[1.008] active:scale-[0.99]"}
      `}
    >
      {/* Premium Glassmorphic Shimmer Effect */}
      <div 
        className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.3)_45%,rgba(255,255,255,0.35)_50%,rgba(255,255,255,0.3)_55%,transparent_65%)] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] transition-opacity duration-300" 
        style={{ transform: "skewX(-15deg)" }} 
      />

      {/* Photo */}
      {donation.photo_url && (
        <div className="h-44 overflow-hidden relative">
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300 z-10" />
          <img
            src={donation.photo_url}
            alt={donation.food_type}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </div>
      )}

      <div className="p-5">
        {/* Header Badges: Urgency & Distance */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Urgent Badge if expiring < 2h */}
            {remaining.isUrgent && !isPickedUp && !isExpired && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 animate-pulse">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                Urgent: {remaining.text}
              </span>
            )}

            {/* Non-urgent remaining time */}
            {!remaining.isUrgent && !isExpired && !isPickedUp && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
                <Clock className="w-3 h-3 text-gray-500" />
                {remaining.text}
              </span>
            )}

            {/* Distance Pill if available */}
            {distanceKm != null && !isNaN(distanceKm) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Navigation className="w-3 h-3 text-emerald-600" />
                {distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m away` : `${distanceKm.toFixed(1)} km away`}
              </span>
            )}
          </div>

          <StatusBadge status={donation.status} />
        </div>

        {/* Title and Quantity */}
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
        </div>

        {/* Description */}
        {donation.description && (
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed line-clamp-2">
            {donation.description}
          </p>
        )}

        {/* Details: Address & Pickup Window */}
        <div className="space-y-2 text-xs text-muted-foreground bg-gray-50/70 p-3 rounded-xl border border-gray-100">
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary/70" />
            <span className="leading-snug text-gray-700">{donation.pickup_address}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 flex-shrink-0 text-primary/70" />
            <span className="text-gray-700">{formatWindow(donation.pickup_window_start, donation.pickup_window_end)}</span>
          </div>

          {/* Contact phone (shown to receiver) */}
          {viewAs === "receiver" && contactPhone && (
            <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <Phone className="w-3 h-3 text-emerald-600" />
                <span>{contactPhone}</span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium">Donor Contact</span>
            </div>
          )}
        </div>

        {/* Step-by-Step Status Timeline */}
        {donation.status !== "expired" && (
          <div className="mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
              <span className="font-semibold text-primary">Progress Timeline</span>
              <span className="capitalize">{donation.status.replace("_", " ")}</span>
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
            <p className="text-xs font-semibold text-foreground mb-1.5">Confirmed Donor</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              {donation.profiles.full_name && (
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {donation.profiles.full_name}
                  {donation.profiles.org_name && ` · ${donation.profiles.org_name}`}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 1-Click Coordination Actions (WhatsApp, Call, Directions) */}
        {viewAs === "receiver" && (isAvailable || isConfirmed) && (
          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-gray-100">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-all active:scale-[0.98]"
                title="Chat on WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                WhatsApp
              </a>
            )}

            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-semibold transition-all active:scale-[0.98]"
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
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition-all active:scale-[0.98]"
              title="Get Directions on Google Maps"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              Route
            </a>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="mt-3 flex flex-wrap gap-2">
          {viewAs === "receiver" && isAvailable && !hasRequestedByMe && onRequestPickup && (
            <button
              onClick={() => onRequestPickup(donation.id)}
              disabled={isRequesting}
              className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm cursor-pointer"
            >
              {isRequesting ? "Requesting…" : "Request Pickup"}
            </button>
          )}

          {viewAs === "receiver" && hasRequestedByMe && donation.status === "requested" && (
            <div className="w-full text-xs text-amber-700 font-medium px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-center">
              Pickup request sent — waiting for donor approval
            </div>
          )}

          {viewAs === "receiver" && isConfirmed && onMarkPickedUp && (
            <button
              onClick={() => onMarkPickedUp(donation.id)}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Food Picked Up
            </button>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
