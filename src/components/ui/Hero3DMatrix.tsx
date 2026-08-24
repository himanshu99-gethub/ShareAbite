import { useState, useEffect, useRef } from "react";
import { 
  UtensilsCrossed, 
  Building2, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  Zap,
  TrendingUp,
  Heart,
  Radio,
  Navigation
} from "lucide-react";

export function Hero3DMatrix() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 8, y: -12 });
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<"match" | "ngo" | "speed">("match");

  // 3D Parallax Mouse Tracking with smooth spring responsiveness
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Smooth angle bounds
    const rotateY = ((x - centerX) / centerX) * 18;
    const rotateX = -((y - centerY) / centerY) * 18;
    
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 6, y: -10 });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[380px] sm:h-[430px] lg:h-[460px] flex items-center justify-center perspective-1200 cursor-pointer select-none"
    >
      {/* Dynamic ambient 3D back-glow */}
      <div 
        className="absolute w-80 h-80 rounded-full bg-emerald-500/25 blur-[100px] transition-all duration-700 pointer-events-none"
        style={{
          transform: `scale(${isHovered ? 1.2 : 1})`,
        }}
      />
      <div className="absolute w-64 h-64 rounded-full bg-amber-400/20 blur-[90px] -bottom-6 -right-6 pointer-events-none" />

      {/* Main 3D Tilted Matrix Stage */}
      <div 
        className="relative w-full max-w-[420px] sm:max-w-[460px] preserve-3d transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateZ(0px)`,
        }}
      >
        {/* Layer 0: 3D Base Platform Grid with Specular Rim */}
        <div 
          className="w-full rounded-3xl p-5 sm:p-6 backdrop-blur-2xl bg-gradient-to-b from-white/[0.16] via-emerald-950/60 to-black/80 border border-white/25 shadow-[0_30px_70px_rgba(0,0,0,0.55)] relative overflow-hidden"
          style={{
            transform: "translateZ(0px)",
          }}
        >
          {/* Top specular reflection beam */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400/90 to-transparent" />
          
          {/* Subtle live radar sweep */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(16,185,129,0.20),transparent_70%)] pointer-events-none" />

          {/* Matrix Header & Mode Selector */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
              <span className="text-xs font-black text-white tracking-wide uppercase">
                3D Live Rescue Matrix
              </span>
            </div>

            {/* Micro Tab Selector */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/40 border border-white/10">
              {(["match", "speed"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase transition-all ${
                    activeTab === tab 
                      ? "bg-emerald-500 text-white shadow-xs" 
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {tab === "match" ? "Live Match" : "Dispatch"}
                </button>
              ))}
            </div>
          </div>

          {/* Live Dynamic Node: Active Food Package */}
          <div className="space-y-2.5 relative z-10">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.09] border border-white/15 backdrop-blur-md hover:bg-white/[0.14] transition-all hover:scale-[1.01]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_4px_12px_rgba(251,191,36,0.4)]">
                  <UtensilsCrossed className="w-4.5 h-4.5 text-amber-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm font-extrabold text-white">45x Gourmet Meal Boxes</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-bold border border-emerald-400/30">Ready</span>
                  </div>
                  <p className="text-[11px] text-white/75 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-amber-400" /> Grand Palm Bistro • 1.2 km away
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-300">Just Now</span>
            </div>

            {/* Connecting Pulse Beam with Real-Time Routing Indicator */}
            <div className="flex items-center justify-center gap-2 py-0.5">
              <div className="h-4 w-0.5 bg-gradient-to-b from-amber-400 via-emerald-400 to-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300/80 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-400/20">
                Direct Volunteer Routing
              </span>
              <div className="h-4 w-0.5 bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 animate-pulse" />
            </div>

            {/* Live Matched NGO Receiver Card */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.09] border border-white/15 backdrop-blur-md hover:bg-white/[0.14] transition-all hover:scale-[1.01]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_4px_12px_rgba(16,185,129,0.4)]">
                  <Building2 className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs sm:text-sm font-extrabold text-white">City Hope Shelter</p>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-[11px] text-emerald-300 font-bold flex items-center gap-1 mt-0.5">
                    <Navigation className="w-3 h-3 text-emerald-400 animate-pulse" /> Assigned Volunteer • 8 min away
                  </p>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Matrix Telemetry Bar */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/80 relative z-10">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-medium">Distribution Success</span>
            </div>
            <span className="font-mono font-extrabold text-emerald-400 text-xs sm:text-sm">99.4% Verified</span>
          </div>
        </div>

        {/* Layer 1: 3D Floating Telemetry Chip 1 (Top Right) */}
        <div 
          className="absolute -top-5 -right-5 sm:-right-7 p-3 rounded-2xl bg-emerald-950/95 border border-emerald-400/50 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.6)] flex items-center gap-2.5 transition-all duration-300"
          style={{
            transform: `translateZ(${isHovered ? 85 : 55}px) translateY(${isHovered ? -6 : 0}px)`,
          }}
        >
          <div className="w-7 h-7 rounded-xl bg-emerald-400/20 flex items-center justify-center border border-emerald-400/40">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
          </div>
          <div>
            <p className="text-[9px] uppercase font-black text-emerald-300 tracking-wider">Rescue Pace</p>
            <p className="text-xs sm:text-sm font-extrabold text-white font-mono leading-tight">1,840+ Meals/mo</p>
          </div>
        </div>

        {/* Layer 2: 3D Floating Telemetry Chip 2 (Bottom Left) */}
        <div 
          className="absolute -bottom-5 -left-5 sm:-left-7 p-3 rounded-2xl bg-zinc-950/95 border border-amber-400/40 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.6)] flex items-center gap-2.5 transition-all duration-300"
          style={{
            transform: `translateZ(${isHovered ? 75 : 45}px) translateY(${isHovered ? 4 : 0}px)`,
          }}
        >
          <div className="w-7 h-7 rounded-xl bg-amber-400/20 flex items-center justify-center border border-amber-400/40">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <div>
            <p className="text-[9px] uppercase font-black text-amber-300 tracking-wider">Avg Handoff</p>
            <p className="text-xs sm:text-sm font-extrabold text-white font-mono leading-tight">18 Minutes</p>
          </div>
        </div>

        {/* Layer 3: Floating 3D Pulse Beacon Badge (Top Left) */}
        <div 
          className="absolute -top-3 left-4 px-2.5 py-1 rounded-full bg-black/80 border border-white/20 backdrop-blur-xl shadow-lg flex items-center gap-1.5"
          style={{
            transform: `translateZ(${isHovered ? 60 : 35}px)`,
          }}
        >
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="text-[9px] font-extrabold uppercase text-white/90">Live GPS Node</span>
        </div>

        {/* Layer 4: Specular Rim Light Core (Behind platform) */}
        <div 
          className="absolute inset-0 rounded-3xl border border-emerald-400/30 pointer-events-none opacity-50"
          style={{
            transform: "translateZ(-20px) scale(1.04)",
          }}
        />
      </div>
    </div>
  );
}
