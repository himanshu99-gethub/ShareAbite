import { useEffect, useRef, useState, useCallback } from "react";
import type { Donation } from "@/hooks/use-donations";
import { loadLeaflet } from "@/lib/leaflet-loader";
import { Compass, Locate, ZoomIn, ZoomOut, Loader2, Navigation } from "lucide-react";

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
  const [isLeafletReady, setIsLeafletReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const initialCenterDoneRef = useRef(false);

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

      // CartoDB Voyager raster tiles for crisp modern look
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        }
      ).addTo(map);

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

  // 3. Pan to user's location when detected
  useEffect(() => {
    if (!mapInstanceRef.current || !userLat || !userLng) return;
    if (!initialCenterDoneRef.current) {
      initialCenterDoneRef.current = true;
      mapInstanceRef.current.flyTo([userLat, userLng], 14, { duration: 1.5 });
    }
  }, [userLat, userLng]);

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

      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px] z-0" />
    </div>
  );
}
