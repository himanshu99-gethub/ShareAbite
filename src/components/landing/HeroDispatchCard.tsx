import { useState, useEffect, useRef } from "react";
import { 
  Navigation, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Truck, 
  UtensilsCrossed, 
  HeartHandshake,
  Crosshair,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useRealTimeLocation } from "@/hooks/use-realtime-location";

interface RouteData {
  id: string;
  source: string;
  sourceType: string;
  destination: string;
  destinationType: string;
  servings: number;
  items: string;
  eta: string;
  distance: string;
  // Simulated donor coords (near Delhi for demo)
  donorLat: number;
  donorLng: number;
  status: "In Transit" | "Dispatching" | "Verified";
  co2Kg: number;
}

/** Haversine distance in km */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Format speed m/s → readable */
function fmtSpeed(mps: number | null): string {
  if (mps === null) return "—";
  const kmh = mps * 3.6;
  return kmh < 1 ? "Stationary" : `${kmh.toFixed(1)} km/h`;
}

const mockRoutes: RouteData[] = [
  {
    id: "RT-8941",
    source: "Green Harvest Bakery",
    sourceType: "Artisan Bakery",
    destination: "St. Jude Shelter Hub",
    destinationType: "Community Kitchen",
    servings: 48,
    items: "Fresh Brioche, Croissants, Quiche",
    eta: "5 mins",
    distance: "1.4 km",
    donorLat: 28.6159,
    donorLng: 77.2090,
    status: "In Transit",
    co2Kg: 18.2,
  },
  {
    id: "RT-8942",
    source: "The Grand Banquet Hall",
    sourceType: "Event Catering",
    destination: "Hope Children's Home",
    destinationType: "Shelter Care",
    servings: 120,
    items: "Rice Bowls, Steamed Veggies, Dal",
    eta: "12 mins",
    distance: "3.1 km",
    donorLat: 28.6289,
    donorLng: 77.2310,
    status: "Dispatching",
    co2Kg: 46.5,
  },
  {
    id: "RT-8943",
    source: "Urban Organics Market",
    sourceType: "Produce Grocery",
    destination: "Grace Elder Center",
    destinationType: "Food Pantry",
    servings: 65,
    items: "Crisp Apples, Salad Greens, Bread",
    eta: "Arrived",
    distance: "0.8 km",
    donorLat: 28.6052,
    donorLng: 77.1985,
    status: "Verified",
    co2Kg: 24.8,
  },
];

export function HeroDispatchCard() {
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // ── Real-time GPS via Geolocation API ──────────────────────────────────
  const gps = useRealTimeLocation({
    enableHighAccuracy: true,
    updateIntervalMs: 3000,
    autoStart: true,
  });

  const route = mockRoutes[activeRouteIndex];

  // Compute real distance from user to this route's donor location
  const realDistKm =
    gps.lat && gps.lng
      ? haversineKm(gps.lat, gps.lng, route.donorLat, route.donorLng)
      : null;

  const displayDistance =
    realDistKm !== null
      ? realDistKm < 1
        ? `${(realDistKm * 1000).toFixed(0)} m`
        : `${realDistKm.toFixed(2)} km`
      : route.distance;

  // Rough ETA at avg 20 km/h delivery speed
  const displayEta =
    realDistKm !== null
      ? realDistKm < 0.05
        ? "Arrived"
        : `~${Math.ceil((realDistKm / 20) * 60)} min`
      : route.eta;

  // Auto-cycle through routes
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveRouteIndex((prev) => (prev + 1) % mockRoutes.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered]);

  // 3D Card Tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: (y / (rect.height / 2)) * -9,
      y: (x / (rect.width / 2)) * 9,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      className="relative w-full max-w-md mx-auto lg:max-w-none perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ambient Backdrop Glow */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500/20 via-amber-400/20 to-teal-500/20 rounded-3xl blur-2xl opacity-70 pointer-events-none" />

      {/* 3D Glassmorphic HUD Shell */}
      <div
        ref={cardRef}
        className="relative rounded-3xl p-6 sm:p-7 bg-[#07130e]/85 backdrop-blur-2xl border border-white/12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.15)_inset] transition-transform duration-200 ease-out text-left overflow-hidden will-change-transform"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Specular Highlight Sheen */}
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-70"
          style={{ transform: `translate(${tilt.y * 3}px, ${tilt.x * 3}px)` }}
        />

        {/* ── Top Header Bar ── */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            {/* Live pulse dot */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_#10B981]" />
            </span>
            <div>
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-emerald-400">
                Live Spatial Dispatch
              </span>
              <span className="block text-[10px] text-white/50 font-mono">
                Telemetry ID: {route.id}
                {gps.lat && gps.lng && (
                  <span className="ml-1.5 text-emerald-400/70">
                    · {gps.lat.toFixed(4)}°N {gps.lng.toFixed(4)}°E
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* GPS Status Badge + Route Switcher */}
          <div className="flex items-center gap-2">
            {/* GPS status pill */}
            {gps.isTracking && gps.lat ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-[9px] font-mono font-bold text-blue-300">
                <Wifi className="w-2.5 h-2.5" />
                GPS
              </span>
            ) : gps.error ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-400/30 text-[9px] font-mono font-bold text-red-300">
                <WifiOff className="w-2.5 h-2.5" />
                NO GPS
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-mono text-white/40">
                <Crosshair className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: "3s" }} />
                Locating…
              </span>
            )}

            {/* Route Switcher Pills */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/8">
              {mockRoutes.map((r, idx) => (
                <button
                  key={r.id}
                  onClick={() => setActiveRouteIndex(idx)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold transition-all ${
                    idx === activeRouteIndex
                      ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                      : "text-white/40 hover:text-white/80"
                  }`}
                >
                  0{idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── GPS Accuracy Ring (shown when active) ── */}
        {gps.isTracking && gps.accuracy !== null && (
          <div className="mt-3 mb-1 px-3 py-2 rounded-xl bg-blue-950/30 border border-blue-500/20 flex items-center justify-between text-[10px] font-mono">
            <span className="flex items-center gap-1.5 text-blue-300">
              <Crosshair className="w-3 h-3 text-blue-400" />
              <span>GPS Accuracy: <strong className="text-white">{gps.accuracy.toFixed(0)} m</strong></span>
            </span>
            <span className="flex items-center gap-2 text-white/50">
              {gps.speed !== null && (
                <span>🚗 <strong className="text-amber-300">{fmtSpeed(gps.speed)}</strong></span>
              )}
              {gps.heading !== null && (
                <span>
                  <Navigation
                    className="inline w-3 h-3 text-emerald-400 mr-0.5"
                    style={{ transform: `rotate(${gps.heading}deg)` }}
                  />
                  {Math.round(gps.heading)}°
                </span>
              )}
            </span>
          </div>
        )}

        {/* ── Visual Routing Conduit ── */}
        <div className="my-4 relative p-4 rounded-2xl bg-white/[0.03] border border-white/6 overflow-hidden">
          {/* Grid Watermark */}
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

          {/* Source & Destination Nodes */}
          <div className="relative z-10 flex items-start justify-between gap-4">
            {/* Origin Node */}
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400/90 mb-1">
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Donor Kitchen</span>
              </div>
              <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1">
                {route.source}
              </h4>
              <p className="text-[11px] text-white/50 mt-0.5 font-mono">{route.sourceType}</p>
              {/* Real coordinates of donor */}
              <p className="text-[9px] text-white/30 mt-0.5 font-mono">
                {route.donorLat.toFixed(4)}°N {route.donorLng.toFixed(4)}°E
              </p>
            </div>

            {/* Kinetic Transit Vector — truck rotates with heading */}
            <div className="flex flex-col items-center justify-center px-1 pt-2">
              <div className="relative w-16 sm:w-20 h-5 flex items-center">
                <div className="w-full h-0.5 bg-gradient-to-r from-emerald-500/40 via-amber-400 to-emerald-500/40 rounded-full" />
                <div
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-pulse"
                >
                  <Truck
                    className="w-3.5 h-3.5 text-amber-300 transition-transform duration-1000"
                    style={{ transform: gps.heading !== null ? `rotate(${gps.heading}deg)` : "none" }}
                  />
                </div>
              </div>
              {/* Real distance */}
              <span className="text-[9px] font-mono text-amber-300/90 font-bold mt-1.5">
                {displayDistance}
                {realDistKm !== null && (
                  <span className="text-blue-400/80 ml-1">● GPS</span>
                )}
              </span>
            </div>

            {/* Destination Node */}
            <div className="flex-1 text-right">
              <div className="flex items-center justify-end gap-1.5 text-[11px] font-medium text-amber-400/90 mb-1">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Recipient NGO</span>
              </div>
              <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1">
                {route.destination}
              </h4>
              <p className="text-[11px] text-white/50 mt-0.5 font-mono">{route.destinationType}</p>
            </div>
          </div>

          {/* Progress Timeline Indicator */}
          <div className="mt-4 pt-3 border-t border-white/8 flex items-center justify-between text-[11px]">
            <span className="text-white/60 flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Est. Arrival: <span className="font-bold text-white ml-1">{displayEta}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              {route.status}
            </span>
          </div>
        </div>

        {/* ── Key Metrics Bento Strip ── */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/6 hover:border-emerald-500/30 transition-colors">
            <span className="text-[10px] uppercase font-mono tracking-wider text-white/50 block">
              Meals Saved
            </span>
            <span className="text-lg font-black font-mono text-white mt-0.5 block">
              {route.servings}
            </span>
            <span className="text-[10px] text-emerald-400/90 font-medium">Ready to serve</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/6 hover:border-amber-500/30 transition-colors">
            <span className="text-[10px] uppercase font-mono tracking-wider text-white/50 block">
              CO₂ Offset
            </span>
            <span className="text-lg font-black font-mono text-amber-300 mt-0.5 block">
              {route.co2Kg} kg
            </span>
            <span className="text-[10px] text-amber-400/80 font-medium">Methane saved</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/6 hover:border-emerald-500/30 transition-colors">
            <span className="text-[10px] uppercase font-mono tracking-wider text-white/50 block">
              Food Safety
            </span>
            <div className="flex items-center gap-1 text-emerald-400 mt-1 font-bold text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified</span>
            </div>
            <span className="text-[10px] text-white/40 block mt-0.5">FSSAI compliant</span>
          </div>
        </div>

        {/* ── Live Food Items Tag ── */}
        <div className="mt-3.5 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-between text-xs">
          <span className="text-white/70 truncate mr-2">
            <strong className="text-white">Contains:</strong> {route.items}
          </span>
          <span className="flex-shrink-0 text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            FRESH
          </span>
        </div>
      </div>
    </div>
  );
}

