import { useState, useEffect } from "react";
import { MapView, NGOProfile } from "@/components/MapView";
import { useDonations } from "@/hooks/use-donations";
import { MapPin, ShieldCheck, Clock, Loader2 } from "lucide-react";

export function LiveMapSection() {
  const { donations, isLoading: isLoadingDonations } = useDonations({ statusFilter: ['pending', 'accepted'] });
  const [ngos, setNgos] = useState<NGOProfile[]>([]);
  const [isLoadingNgos, setIsLoadingNgos] = useState(true);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

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

        // Since we don't have lat/lng in the database for NGOs currently,
        // we will generate some dummy coordinates near the center for demo purposes.
        // Default center used in MapView is 20.5937, 78.9629 (India).
        const dummyNgos = (data || []).map((ngo, idx) => ({
          ...ngo,
          // Generate a slight offset for each NGO around the center
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
    <section className="py-20 relative overflow-hidden bg-muted/30">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-foreground">
            Live Impact Map
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            See real-time food rescue operations happening right now. Watch as surplus food 
            connects with verified NGOs in your community.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start max-w-6xl mx-auto">
          
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{isLoadingDonations ? <Loader2 className="w-5 h-5 animate-spin" /> : totalActive}</h3>
                  <p className="text-sm text-muted-foreground">Active Food Donations</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground/80 leading-relaxed">
                These are real-time, pending or newly accepted food packages waiting for pickup from donors.
              </p>
            </div>

            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{isLoadingNgos ? <Loader2 className="w-5 h-5 animate-spin" /> : totalNgos}</h3>
                  <p className="text-sm text-muted-foreground">Verified NGOs</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground/80 leading-relaxed">
                Registered non-profits and shelters standing by to distribute food to those in need.
              </p>
            </div>
            
            <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> How to read the map
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs shadow-md border-2 border-white">🍱</span>
                  Available Food Donation
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-md border-2 border-white">🏥</span>
                  Verified NGO / Shelter
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2 bg-card rounded-[2.5rem] p-4 shadow-xl border border-border/50 relative group h-[500px] lg:h-full min-h-[500px]">
            {isLoadingDonations || isLoadingNgos ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-muted/20 rounded-3xl">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-medium">Loading Live Data...</p>
              </div>
            ) : (
              <div className="w-full h-full rounded-3xl overflow-hidden relative z-0">
                <MapView 
                  donations={donations} 
                  ngos={ngos}
                  userLat={userLat}
                  userLng={userLng}
                />
              </div>
            )}
            
            {/* Pulsing indicator */}
            <div className="absolute top-8 right-8 bg-background/90 backdrop-blur-md px-4 py-2 rounded-full border border-border/50 shadow-sm flex items-center gap-2 z-10 pointer-events-none">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold tracking-wide uppercase text-foreground">Live Updates</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
