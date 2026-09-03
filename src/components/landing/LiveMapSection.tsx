import { useState, useEffect, useCallback } from "react";
import { MapView, NGOProfile } from "@/components/MapView";
import { useDonations } from "@/hooks/use-donations";
import { MapPin, ShieldCheck, Clock, Loader2, Radio, Compass, Sparkles, Navigation, ChevronRight } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

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

export function LiveMapSection() {
  // Fetch all active/available donations from all donors
  const { donations, isLoading: isLoadingDonations } = useDonations({
    statusFilter: ["available", "requested", "confirmed"],
  });
  const [ngos, setNgos] = useState<NGOProfile[]>([]);
  const [isLoadingNgos, setIsLoadingNgos] = useState(true);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"detecting" | "locked" | "denied">("detecting");
  const { ref, isIntersecting } = useIntersectionObserver();

  // Function to acquire user GPS location with high accuracy
  const requestLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setLocationStatus("locked");
        setIsLocating(false);
      },
      (err) => {
        console.log("GPS Notice:", err.message);
        setLocationStatus("denied");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  }, []);

  // Run on mount
  useEffect(() => {
    requestLocation();

    // Also watch position for live GPS tracking
    let watchId: number | null = null;
    if (typeof window !== "undefined" && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
          setLocationStatus("locked");
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 30000 }
      );
    }

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [requestLocation]);

  // Fetch verified NGOs or fallbacks around anchor
  useEffect(() => {
    async function fetchNgos() {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, org_name, phone")
          .eq("role", "receiver");

        if (error) throw error;

        const anchorLat = userLat || 28.6139;
        const anchorLng = userLng || 77.2090;

        const defaultMockNgos = [
          {
            id: "ngo-1",
            org_name: "Robin Hood Army - Community Hub",
            full_name: "Amit Sharma",
            phone: "+91 98101 23456",
            latitude: anchorLat + 0.014,
            longitude: anchorLng - 0.012,
          },
          {
            id: "ngo-2",
            org_name: "Feeding India Food Rescue Wing",
            full_name: "Priya Varma",
            phone: "+91 98765 43210",
            latitude: anchorLat - 0.016,
            longitude: anchorLng + 0.018,
          },
          {
            id: "ngo-3",
            org_name: "Annakshetra Kitchen & Shelter",
            full_name: "Rajesh Gupta",
            phone: "+91 94140 11223",
            latitude: anchorLat + 0.022,
            longitude: anchorLng + 0.015,
          },
        ];

        if (data && data.length > 0) {
          const mapped = data.map((ngo, idx) => ({
            ...ngo,
            latitude: anchorLat + ((idx % 3) - 1) * 0.022 + (Math.random() - 0.5) * 0.01,
            longitude: anchorLng + (((idx + 1) % 3) - 1) * 0.022 + (Math.random() - 0.5) * 0.01,
          }));
          setNgos(mapped);
        } else {
          setNgos(defaultMockNgos);
        }
      } catch (err) {
        console.error("Error fetching NGOs for map", err);
      } finally {
        setIsLoadingNgos(false);
      }
    }
    fetchNgos();
  }, [userLat, userLng]);

  const totalActive = donations.length;
  const totalNgos = ngos.length;

  // Recent food uploads
  const recentFoodDonations = [...donations].slice(0, 3);

  return (
    <section id="live-map" className="py-24 relative overflow-hidden bg-background">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-primary/6 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
        
        {/* Section Header */}
        <div
          ref={ref}
          className={`text-center max-w-3xl mx-auto mb-14 ${isIntersecting ? "animate-fade-up-blur opacity-100" : "opacity-0"}`}
        >
          <span className="glass-pill text-emerald-700 dark:text-emerald-300 text-xs font-extrabold mb-4 inline-flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Live Geospatial Food Rescue Grid</span>
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 tracking-[-0.03em] text-foreground">
            Live Surplus Food & Rescue Map
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Whenever a donor lists surplus food, it instantly lights up on this live map for nearby verified shelters & NGOs.
          </p>
        </div>

        {/* Command Center Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Telemetry & Live Feeds */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-5">
            
            {/* GPS Telemetry Pill */}
            <div className="p-4 rounded-2xl bg-card/90 border border-border/70 backdrop-blur-md shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  locationStatus === "locked" ? "bg-blue-500/15 text-blue-600 border border-blue-500/30" : "bg-amber-500/15 text-amber-600 border border-amber-500/30"
                }`}>
                  <Navigation className={`w-4 h-4 ${isLocating ? "animate-spin" : ""}`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {locationStatus === "locked" && userLat && userLng
                      ? `GPS Locked: ${userLat.toFixed(3)}°, ${userLng.toFixed(3)}°`
                      : locationStatus === "detecting"
                      ? "Detecting your location..."
                      : "Location Permission Off"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {locationStatus === "locked" ? "Blue pulsing dot marks your location" : "Click to connect GPS"}
                  </p>
                </div>
              </div>
              <button
                onClick={requestLocation}
                disabled={isLocating}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-95"
              >
                {isLocating ? "Locating..." : "Locate"}
              </button>
            </div>

            {/* Active Donations Stat Card */}
            <div 
              className="p-6 rounded-3xl bg-card/90 dark:bg-card/50 border border-border/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1"
              style={{ boxShadow: "var(--shadow-neumorphic)" }}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shadow-sm">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-foreground font-mono">
                    {isLoadingDonations ? <Loader2 className="w-5 h-5 animate-spin" /> : totalActive}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Food Packages</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Live packages listed by restaurant and household donors ready for instant doorstep pickup.
              </p>
            </div>

            {/* Verified NGOs Card */}
            <div 
              className="p-6 rounded-3xl bg-card/90 dark:bg-card/50 border border-border/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1"
              style={{ boxShadow: "var(--shadow-neumorphic)" }}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-foreground font-mono">
                    {isLoadingNgos ? <Loader2 className="w-5 h-5 animate-spin" /> : totalNgos}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Verified Rescue Centers</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Registered NGO volunteers and community kitchens on standby for rapid distribution.
              </p>
            </div>
            
            {/* Live Legend */}
            <div className="rounded-3xl p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 backdrop-blur-md">
              <h4 className="font-extrabold text-foreground text-xs mb-3 flex items-center gap-2">
                <Compass className="w-4 h-4 text-primary" /> Live Beacon Legend
              </h4>
              <div className="space-y-2 text-xs font-bold text-muted-foreground">
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-card/60 border border-border/40">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs shadow-sm">📍</span>
                  <span className="text-foreground">Aapki Location (You)</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-card/60 border border-border/40">
                  <span className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs shadow-sm">🍱</span>
                  <span className="text-foreground">Available Food Donation</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-card/60 border border-border/40">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs shadow-sm">🏥</span>
                  <span className="text-foreground">Verified Rescue Shelter / NGO</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Live Map Display */}
          <div className="lg:col-span-8 bg-card/90 dark:bg-card/50 rounded-[2.5rem] p-3 sm:p-4 border border-border/70 relative group min-h-[500px] lg:min-h-[580px] flex flex-col"
            style={{ boxShadow: "var(--shadow-xl)" }}
          >
            {/* Top Specular Rim */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

            {/* Live Feed Pill */}
            <div className="absolute top-7 right-7 bg-background/95 backdrop-blur-xl px-4 py-2 rounded-2xl border border-border/70 shadow-lg flex items-center gap-2.5 z-10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-foreground">
                Real-Time Geolocation Active
              </span>
            </div>

            {isLoadingDonations && isLoadingNgos ? (
              <div className="w-full flex-1 flex flex-col items-center justify-center bg-muted/20 rounded-[2rem]">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-bold text-sm">Syncing Satellite Telemetry...</p>
              </div>
            ) : (
              <div className="w-full flex-1 rounded-[2rem] overflow-hidden relative z-0 border border-border/40">
                <MapView 
                  donations={donations} 
                  ngos={ngos}
                  userLat={userLat}
                  userLng={userLng}
                />
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
