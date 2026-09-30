import { useEffect, useRef, useState, useCallback } from "react";
import type { Donation } from "@/hooks/use-donations";
import { loadLeaflet } from "@/lib/leaflet-loader";
import { Compass, Locate, ZoomIn, ZoomOut, Loader2, Navigation, Route, Clock, Ruler, Layers } from "lucide-react";

/** Free OSRM routing — no API key needed */
async function fetchOsrmRoute(
  fromLat: number, fromLng: number,
  toLat: number, toLng: number
): Promise<{ coordinates: [number, number][]; distanceKm: number; durationMin: number } | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${fromLng},${fromLat};${toLng},${toLat}` +
      `?overview=full&geometries=geojson&steps=false`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) return null;
    return {
      coordinates: route.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]),
      distanceKm: route.distance / 1000,
      durationMin: Math.ceil(route.duration / 60),
    };
  } catch {
    return null;
  }
}

export interface NGOProfile {
  id: string;
  org_name: string | null;
  full_name: string | null;
  phone: string | null;
  latitude?: number;
  longitude?: number;
}

interface MapViewProps {
  donations: Donation[];
  ngos?: NGOProfile[];
  userLat?: number | null;
  userLng?: number | null;
  onMarkerClick?: (donation: Donation) => void;
  onNgoClick?: (ngo: NGOProfile) => void;
  showTracking?: boolean;
}

function formatWindow(start: string, end: string) {
  try {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${s.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} – ${e.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  } catch {
    return "Flexible Pickup";
  }
}

export function MapView({
  donations,
  ngos = [],
  userLat,
  userLng,
  onMarkerClick,
  onNgoClick,
  showTracking = false,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);          // OSRM road route layer
  const [isLeafletReady, setIsLeafletReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; durationMin: number } | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const initialCenterDoneRef = useRef(false);

  const [mapStyle, setMapStyle] = useState<"streets" | "satellite" | "hot">("streets");
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const tileLayerRef = useRef<any>(null);

  // 1. Dynamic Leaflet loader
  useEffect(() => {
    let isMounted = true;
    loadLeaflet()
      .then(() => {
        if (isMounted) setIsLeafletReady(true);
      })
      .catch((err) => {
        console.error("Leaflet load error:", err);
        if (isMounted) setLoadError("Map assets loading failed. Check your internet connection.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Initialize Map Instance
  useEffect(() => {
    if (!isLeafletReady || !mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Center on user's current location if available, else India default (28.6139, 77.2090)
    const initialLat = userLat ?? 28.6139;
    const initialLng = userLng ?? 77.2090;
    const initialZoom = userLat && userLng ? 13 : 6;

    try {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: true,
      }).setView([initialLat, initialLng], initialZoom);

      mapInstanceRef.current = map;

      // Handle resize and dimension recalculations
      setTimeout(() => {
        map.invalidateSize(true);
      }, 100);

      const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize(true);
      });
      resizeObserver.observe(mapContainerRef.current);

      return () => {
        resizeObserver.disconnect();
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    } catch (err) {
      console.error("Error creating Leaflet map instance:", err);
    }
  }, [isLeafletReady]);

  // 2b. Dynamic Tile Layer Switcher (OpenStreetMap Real Map, Satellite, Humanitarian)
  useEffect(() => {
    if (!mapInstanceRef.current || !isLeafletReady) return;
    const L = (window as any).L;
    if (!L) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
      tileLayerRef.current = null;
    }

    let url = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    let options: any = {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    };

    if (mapStyle === "satellite") {
      url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      options = {
        attribution: "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
        maxZoom: 19,
      };
    } else if (mapStyle === "hot") {
      url = "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png";
      options = {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Humanitarian OSM Team',
        subdomains: "abc",
        maxZoom: 19,
      };
    }

    const layer = L.tileLayer(url, options).addTo(mapInstanceRef.current);
    tileLayerRef.current = layer;
  }, [mapStyle, isLeafletReady]);

  // 3. Pan to user's location when detected
  useEffect(() => {
    if (!mapInstanceRef.current || !userLat || !userLng) return;
    if (!initialCenterDoneRef.current) {
      initialCenterDoneRef.current = true;
      mapInstanceRef.current.flyTo([userLat, userLng], 14, { duration: 1.5 });
    }
  }, [userLat, userLng]);

  // 3b. OSRM real road routing — free, no API key
  useEffect(() => {
    if (!isLeafletReady || !mapInstanceRef.current) return;
    if (!showTracking || !userLat || !userLng) return;

    // Find first NGO with coords to route to
    const targetNgo = ngos.find((n) => n.latitude && n.longitude);
    if (!targetNgo?.latitude || !targetNgo?.longitude) return;

    const L = (window as any).L;
    if (!L) return;

    // Remove old route layer
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }
    setRouteInfo(null);
    setRouteLoading(true);

    fetchOsrmRoute(userLat, userLng, targetNgo.latitude, targetNgo.longitude)
      .then((result) => {
        if (!result || !mapInstanceRef.current) return;

        // Animated dashed route line (Zomato style)
        const routeLine = L.polyline(result.coordinates, {
          color: "#10b981",
          weight: 5,
          opacity: 0.9,
          dashArray: "12, 8",
          lineJoin: "round",
          lineCap: "round",
        }).addTo(mapInstanceRef.current);

        // Animated moving dot on the route
        const glowLine = L.polyline(result.coordinates, {
          color: "#6ee7b7",
          weight: 2,
          opacity: 0.5,
          dashArray: "4, 20",
        }).addTo(mapInstanceRef.current);

        routeLayerRef.current = L.layerGroup([routeLine, glowLine]);
        routeLayerRef.current.addTo = () => {}; // already added

        setRouteInfo({ distanceKm: result.distanceKm, durationMin: result.durationMin });

        // Fit map to show full route
        mapInstanceRef.current.fitBounds(
          L.latLngBounds(result.coordinates).pad(0.15),
          { maxZoom: 15, duration: 1 }
        );
      })
      .finally(() => setRouteLoading(false));

    return () => {
      if (routeLayerRef.current) {
        try { routeLayerRef.current.eachLayer?.((l: any) => l.remove()); } catch {}
        routeLayerRef.current = null;
      }
    };
  }, [isLeafletReady, showTracking, userLat, userLng, ngos]);

  // 4. Update all Pins (User Live Location, Food Donations, and NGOs)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const map = mapInstanceRef.current;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    // ─── A. USER'S LIVE CURRENT LOCATION PIN ───────────────────────────
    if (userLat && userLng) {
      const userHtml = showTracking
        ? `<div class="relative flex items-center justify-center" style="width:40px;height:40px;">
            <div style="width:38px;height:38px;border-radius:50%;background:#ef4444;border:3px solid #ffffff;box-shadow:0 4px 14px rgba(239,68,68,0.5);display:flex;align-items:center;justify-content:center;font-size:18px;">🏪</div>
          </div>`
        : `<div class="relative flex items-center justify-center" style="width:44px;height:44px;">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-70"></span>
            <span class="animate-pulse absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-50"></span>
            <div style="position:relative;width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);border:3.5px solid #ffffff;box-shadow:0 2px 14px rgba(37,99,235,0.6);display:flex;align-items:center;justify-content:center;z-index:10;">
              <div style="width:8px;height:8px;border-radius:50%;background:#ffffff;"></div>
            </div>
          </div>`;

      const userIcon = L.divIcon({
        html: userHtml,
        iconSize: showTracking ? [40, 40] : [44, 44],
        iconAnchor: showTracking ? [20, 20] : [22, 22],
        className: "custom-leaflet-pin",
      });

      const userPopup = `
        <div style="font-family:system-ui;padding:6px 2px;min-width:180px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#2563eb;"></span>
            <strong style="font-size:14px;color:#1e3a8a;">${showTracking ? 'Pickup Spot (You)' : 'Aapki Live Location (You)'}</strong>
          </div>
          <p style="font-size:12px;color:#475569;margin:0 0 4px;">📍 GPS: ${userLat.toFixed(4)}, ${userLng.toFixed(4)}</p>
          <span style="display:inline-block;background:#eff6ff;color:#1d4ed8;font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;">
            🟢 LIVE GPS ACTIVE
          </span>
        </div>
      `;

      const userMarker = L.marker([userLat, userLng], { icon: userIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup(userPopup);

      userMarkerRef.current = userMarker;
      markersRef.current.push(userMarker);
    }

    // ─── B. FOOD DONATIONS PINS (Uploaded by ANY Donor) ───────────────
    donations.forEach((d) => {
      if (!d.latitude || !d.longitude) return;

      const isAvailable = d.status === "available";
      const isRecent = Date.now() - new Date(d.created_at).getTime() < 86400000; // 24 hours

      const donationHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width:46px;height:46px;">
          ${isRecent ? '<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80"></span>' : ''}
          <div style="position:relative;width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%);border:3px solid #ffffff;box-shadow:0 6px 16px rgba(217,119,6,0.5);display:flex;align-items:center;justify-content:center;font-size:19px;transition:transform 0.2s ease;">
            🍱
          </div>
          ${isRecent ? '<span style="position:absolute;top:-4px;right:-4px;background:#ef4444;color:#ffffff;font-size:9px;font-weight:900;padding:1px 5px;border-radius:999px;border:1.5px solid #ffffff;box-shadow:0 1px 4px rgba(0,0,0,0.3);">LIVE</span>' : ''}
        </div>
      `;

      const donationIcon = L.divIcon({
        html: donationHtml,
        iconSize: [46, 46],
        iconAnchor: [23, 23],
        className: "custom-leaflet-pin",
      });

      const popupHtml = `
        <div style="font-family:system-ui;min-width:220px;padding:6px 2px;color:#1e293b;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
            <span style="font-weight:800;font-size:15px;color:#0f172a;line-height:1.2;">${d.food_type}</span>
            <span style="background:${isAvailable ? '#ecfdf5' : '#fef3c7'};color:${isAvailable ? '#059669' : '#d97706'};font-size:10px;font-weight:800;padding:2px 7px;border-radius:999px;text-transform:uppercase;">
              ${d.status}
            </span>
          </div>
          <p style="font-size:12px;font-weight:700;color:#475569;margin:0 0 4px;display:flex;align-items:center;gap:4px;">
            <span>📦 Quantity:</span> <span style="color:#0f172a;">${d.quantity}</span>
          </p>
          ${d.description ? `<p style="font-size:11px;color:#64748b;margin:0 0 4px;font-style:italic;">"${d.description}"</p>` : ''}
          <p style="font-size:12px;color:#475569;margin:0 0 4px;line-height:1.3;">
            <span>📍</span> ${d.pickup_address}
          </p>
          <p style="font-size:11px;color:#0284c7;font-weight:600;margin:0 0 4px;">
            <span>⏰</span> ${formatWindow(d.pickup_window_start, d.pickup_window_end)}
          </p>
          ${d.contact_phone ? `<p style="font-size:11px;color:#059669;font-weight:700;margin:4px 0 0;">📞 ${d.contact_phone}</p>` : ''}
        </div>
      `;

      const marker = L.marker([d.latitude, d.longitude], { icon: donationIcon })
        .addTo(map)
        .bindPopup(popupHtml);

      if (onMarkerClick) {
        marker.on("click", () => onMarkerClick(d));
      }
      markersRef.current.push(marker);
    });

    // ─── C. NGO / SHELTER PINS ─────────────────────────────────────────
    ngos.forEach((ngo) => {
      if (!ngo.latitude || !ngo.longitude) return;

      const ngoHtml = showTracking
        ? `<div class="relative flex items-center justify-center cursor-pointer" style="width:44px;height:44px;">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <div style="position:relative;width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg, #10b981 0%, #059669 100%);border:3px solid #ffffff;box-shadow:0 6px 16px rgba(5,150,105,0.45);display:flex;align-items:center;justify-content:center;font-size:18px;z-index:10;">🛵</div>
          </div>`
        : `<div class="relative flex items-center justify-center cursor-pointer" style="width:40px;height:40px;">
            <div style="position:relative;width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg, #10b981 0%, #047857 100%);border:3px solid #ffffff;box-shadow:0 4px 14px rgba(4,120,87,0.35);display:flex;align-items:center;justify-content:center;font-size:17px;">🏥</div>
          </div>`;

      const ngoIcon = L.divIcon({
        html: ngoHtml,
        iconSize: showTracking ? [44, 44] : [40, 40],
        iconAnchor: showTracking ? [22, 22] : [20, 20],
        className: "custom-leaflet-pin",
      });

      const ngoPopupHtml = `
        <div style="font-family:system-ui;min-width:200px;padding:6px 2px;color:#1e293b;">
          <p style="font-weight:800;font-size:14px;margin:0 0 4px;color:#065f46;">
            ${ngo.org_name || ngo.full_name || "Verified Community Rescue Center"}
          </p>
          <p style="font-size:12px;color:#475569;margin:0 0 4px;">
            📞 Contact: <strong>${ngo.phone || "Verified Partner"}</strong>
          </p>
          ${
            showTracking
              ? '<p style="font-size:12px;color:#059669;font-weight:700;margin:4px 0 0;display:flex;align-items:center;gap:4px;">🛵 Rescue Volunteer En Route</p>'
              : '<p style="font-size:11px;color:#059669;font-weight:600;margin:2px 0 0;">✨ Authorized Food Distribution Shelter</p>'
          }
        </div>
      `;

      const marker = L.marker([ngo.latitude, ngo.longitude], { icon: ngoIcon })
        .addTo(map)
        .bindPopup(ngoPopupHtml);

      if (onNgoClick) {
        marker.on("click", () => onNgoClick(ngo));
      }
      markersRef.current.push(marker);

      // Tracking polyline
      if (showTracking && userLat && userLng) {
        polylineRef.current = L.polyline(
          [
            [userLat, userLng],
            [ngo.latitude, ngo.longitude],
          ],
          {
            color: "#10b981",
            weight: 4,
            opacity: 0.85,
            dashArray: "8, 8",
            lineJoin: "round",
          }
        ).addTo(map);
      }
    });

    // ─── D. AUTO FIT BOUNDS ─────────────────────────────────────────────
    if (markersRef.current.length > 1 && !initialCenterDoneRef.current) {
      try {
        const groupElements = [...markersRef.current];
        if (polylineRef.current) groupElements.push(polylineRef.current);
        const group = L.featureGroup(groupElements);
        map.fitBounds(group.getBounds().pad(0.2), { maxZoom: 15 });
      } catch {
        // ignore
      }
    }
  }, [donations, ngos, userLat, userLng, onMarkerClick, onNgoClick, showTracking]);

  // Controls Handlers
  const handleZoomIn = useCallback(() => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  }, []);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(
            [pos.coords.latitude, pos.coords.longitude],
            15,
            { duration: 1.2 }
          );
        }
      },
      (err) => console.log("Geolocation error:", err),
      { enableHighAccuracy: true }
    );
  }, []);

  const handleResetBounds = useCallback(() => {
    if (!mapInstanceRef.current || markersRef.current.length === 0) return;
    const L = (window as any).L;
    if (!L) return;
    try {
      const group = L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.2), { maxZoom: 15 });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-emerald-950/10">
      {/* Loading state before Leaflet is ready */}
      {!isLeafletReady && !loadError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Initializing Live Satellite Map...
          </p>
        </div>
      )}

      {/* Load error message */}
      {loadError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-card/90">
          <p className="text-sm font-bold text-destructive mb-2">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-xl shadow"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Floating Modern Map Controls */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
        <button
          type="button"
          onClick={handleLocateMe}
          title="Center on My Live Location"
          className="w-10 h-10 rounded-xl bg-background/95 hover:bg-background text-foreground border border-border/80 shadow-lg backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
        >
          <Locate className="w-5 h-5 text-blue-600 group-hover:animate-pulse" />
        </button>

        {markersRef.current.length > 1 && (
          <button
            type="button"
            onClick={handleResetBounds}
            title="Fit All Food & Rescue Pins"
            className="w-10 h-10 rounded-xl bg-background/95 hover:bg-background text-foreground border border-border/80 shadow-lg backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            <Compass className="w-5 h-5 text-primary" />
          </button>
        )}

        {/* Layer Switcher (Streets, Satellite, Humanitarian) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStyleMenu((prev) => !prev)}
            title="Switch Map Layers (Street / Satellite)"
            className="w-10 h-10 rounded-xl bg-background/95 hover:bg-background text-foreground border border-border/80 shadow-lg backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
          >
            <Layers className="w-5 h-5 text-emerald-600 group-hover:rotate-12 transition-transform" />
          </button>

          {showStyleMenu && (
            <div className="absolute left-12 top-0 z-[500] w-52 p-1.5 rounded-2xl bg-background/95 backdrop-blur-xl border border-border/80 shadow-2xl flex flex-col gap-1 text-xs animate-in fade-in slide-in-from-left-2 duration-150">
              <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Map Layer
              </div>
              <button
                type="button"
                onClick={() => { setMapStyle("streets"); setShowStyleMenu(false); }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                  mapStyle === "streets" ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted text-foreground font-medium"
                }`}
              >
                <span className="text-base">🗺️</span>
                <div>
                  <p className="leading-tight font-semibold">Real Street Map</p>
                  <p className="text-[10px] text-muted-foreground">Detailed roads & landmarks</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setMapStyle("satellite"); setShowStyleMenu(false); }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                  mapStyle === "satellite" ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted text-foreground font-medium"
                }`}
              >
                <span className="text-base">🛰️</span>
                <div>
                  <p className="leading-tight font-semibold">Satellite Imagery</p>
                  <p className="text-[10px] text-muted-foreground">Real aerial photography</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setMapStyle("hot"); setShowStyleMenu(false); }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                  mapStyle === "hot" ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted text-foreground font-medium"
                }`}
              >
                <span className="text-base">🏥</span>
                <div>
                  <p className="leading-tight font-semibold">Humanitarian Map</p>
                  <p className="text-[10px] text-muted-foreground">High contrast NGO relief</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-[400] flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-8 h-8 rounded-lg bg-background/95 hover:bg-background text-foreground border border-border/70 shadow-md backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          <ZoomIn className="w-3.5 h-3.5 text-foreground" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-8 h-8 rounded-lg bg-background/95 hover:bg-background text-foreground border border-border/70 shadow-md backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          <ZoomOut className="w-3.5 h-3.5 text-foreground" />
        </button>
      </div>

      {/* ── OSRM Route Loading Spinner ── */}
      {routeLoading && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-2 px-4 py-2 rounded-full bg-background/95 backdrop-blur-md border border-border shadow-lg text-xs font-semibold text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
          Calculating road route…
        </div>
      )}

      {/* ── Zomato-style Route Info Panel ── */}
      {routeInfo && showTracking && !routeLoading && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-3 px-5 py-3 rounded-2xl bg-background/95 backdrop-blur-md border border-emerald-500/30 shadow-[0_8px_30px_rgba(16,185,129,0.2)] text-sm">
          {/* Route icon */}
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <Route className="w-4 h-4 text-emerald-500" />
          </div>

          {/* Distance */}
          <div className="flex items-center gap-1.5 text-foreground">
            <Ruler className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-black text-base">{routeInfo.distanceKm.toFixed(1)} km</span>
          </div>

          <div className="w-px h-5 bg-border" />

          {/* ETA */}
          <div className="flex items-center gap-1.5 text-foreground">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-black text-base text-amber-600">{routeInfo.durationMin} min</span>
          </div>

          <div className="w-px h-5 bg-border" />

          {/* Free badge */}
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            🛣 Road Route
          </span>
        </div>
      )}

      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px] z-0" />

    </div>
  );
}
