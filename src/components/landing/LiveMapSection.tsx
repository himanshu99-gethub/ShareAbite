import { useState, useEffect } from "react";
import { MapView, NGOProfile } from "@/components/MapView";
import { useDonations } from "@/hooks/use-donations";
import { MapPin, ShieldCheck, Clock, Loader2, Radio, Compass, Sparkles } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export function LiveMapSection() {
  const { donations, isLoading: isLoadingDonations } = useDonations({ statusFilter: ['pending', 'accepted'] });
  const [ngos, setNgos] = useState<NGOProfile[]>([]);
  const [isLoadingNgos, setIsLoadingNgos] = useState(true);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const { ref, isIntersecting } = useIntersectionObserver();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
        },
        () => {
          console.log("Geolocation permission denied or failed.");
        }
      );
    }
  }, []);

  useEffect(() => {
    async function fetchNgos() {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, org_name, phone")
          .eq("role", "receiver");

        if (error) throw error;

        const dummyNgos = (data || []).map((ngo) => ({
          ...ngo,
          latitude: 20.5937 + (Math.random() - 0.5) * 5,
          longitude: 78.9629 + (Math.random() - 0.5) * 5,
        }));
        setNgos(dummyNgos);
      } catch (err) {
        console.error("Error fetching NGOs for map", err);
      } finally {
        setIsLoadingNgos(false);
      }
    }
    fetchNgos();
  }, []);

  const totalActive = donations.length;
  const totalNgos = ngos.length;

  return (
    <section id="live-map" className="py-28 relative overflow-hidden bg-background">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-primary/6 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
        
        {/* Section Header */}
        <div
          ref={ref}
          className={`text-center max-w-3xl mx-auto mb-16 ${isIntersecting ? "animate-fade-up-blur opacity-100" : "opacity-0"}`}
        >
          <span className="glass-pill text-emerald-700 dark:text-emerald-300 text-xs font-extrabold mb-4">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Real-Time Geospatial Network</span>
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 tracking-[-0.03em] text-foreground">
            Live Surplus Rescue Map
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Watch real-time surplus food packages connect with verified shelters and community kitchens across the city.
          </p>
        </div>

        {/* Command Center Layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Realtime Telemetry Panels */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-5">
            
            {/* Active Donations HUD Card */}
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
                Freshly prepared meals, bakery surplus, and groceries waiting for immediate pickup by registered teams.
              </p>
            </div>

            {/* Verified NGOs HUD Card */}
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
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Verified NGOs & Shelters</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Vetted non-profit distributors equipped to handle food safety and immediate doorstep collection.
              </p>
            </div>
            
            {/* Map Legend */}
            <div className="rounded-3xl p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 backdrop-blur-md">
              <h4 className="font-extrabold text-foreground text-sm mb-3.5 flex items-center gap-2">
                <Compass className="w-4 h-4 text-primary" /> Live Beacon Legend
              </h4>
              <div className="space-y-2.5 text-xs font-bold text-muted-foreground">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-card/60 border border-border/40">
                  <span className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xs shadow-sm">🍱</span>
                  <span className="text-foreground">Available Surplus Food Package</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-xl bg-card/60 border border-border/40">
                  <span className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xs shadow-sm">🏥</span>
                  <span className="text-foreground">Verified NGO / Rescue Center</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: 3D Command-Center Map Screen */}
          <div className="lg:col-span-8 bg-card/90 dark:bg-card/50 rounded-[2.5rem] p-3 sm:p-4 border border-border/70 relative group min-h-[480px] lg:min-h-[560px] flex flex-col"
            style={{ boxShadow: "var(--shadow-xl)" }}
          >
            {/* Specular Rim Light */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

            {/* Live Indicator Pill in HUD */}
            <div className="absolute top-7 right-7 bg-background/95 backdrop-blur-xl px-4 py-2 rounded-2xl border border-border/70 shadow-lg flex items-center gap-2.5 z-10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-foreground">
                Live Geolocation Feed
              </span>
            </div>

            {isLoadingDonations || isLoadingNgos ? (
              <div className="w-full flex-1 flex flex-col items-center justify-center bg-muted/20 rounded-[2rem]">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-bold text-sm">Syncing Satellite Coordinates...</p>
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
