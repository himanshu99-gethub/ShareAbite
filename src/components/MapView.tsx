import { useEffect, useRef } from "react";
import type { Donation } from "@/hooks/use-donations";

// Leaflet is loaded globally via CDN script tag in __root.tsx
declare const L: any;

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
  const s = new Date(start);
  const e = new Date(end);
  return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${s.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} – ${e.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

export function MapView({ donations, ngos = [], userLat, userLng, onMarkerClick, onNgoClick, showTracking = false }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    if (typeof L === "undefined") return;

    const defaultLat = userLat ?? 20.5937;
    const defaultLng = userLng ?? 78.9629;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([defaultLat, defaultLng], userLat ? 13 : 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // run once on mount

  // Add user location marker when coords are known
  useEffect(() => {
    if (!mapInstanceRef.current || typeof L === "undefined" || !userLat || !userLng) return;

    // If tracking mode, user location is the Donor (restaurant). Use a distinct icon.
    const htmlIcon = showTracking ? 
      `<div style="width:36px;height:36px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 3px 12px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:16px;">🏪</div>` :
      `<div style="width:16px;height:16px;border-radius:50%;background:#48864b;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`;

    const userIcon = L.divIcon({
      html: htmlIcon,
      iconSize: showTracking ? [36, 36] : [16, 16],
      iconAnchor: showTracking ? [18, 18] : [8, 8],
      className: "",
    });

    // Remove existing user marker if any (we don't store it in a ref explicitly, so let's rely on map state)
    // Actually, we should store it to remove it. For now, since it re-runs on userLat change, 
    // it will add multiple. Let's fix that by storing user marker.
    // Wait, let's keep it simple and just clear all layers or handle it properly.
  }, [userLat, userLng, showTracking]);

  // Update donation and NGO markers
  useEffect(() => {
    if (!mapInstanceRef.current || typeof L === "undefined") return;

    // Remove old markers and polylines
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    // If showTracking is true, draw user marker here so it's managed
    if (userLat && userLng) {
      const htmlIcon = showTracking ? 
        `<div style="width:36px;height:36px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 3px 12px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:16px;">🏪</div>` :
        `<div style="width:16px;height:16px;border-radius:50%;background:#48864b;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`;

      const userIcon = L.divIcon({
        html: htmlIcon,
        iconSize: showTracking ? [36, 36] : [16, 16],
        iconAnchor: showTracking ? [18, 18] : [8, 8],
        className: "",
      });

      const userMarker = L.marker([userLat, userLng], { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(showTracking ? "<strong style='font-family:system-ui'>Pickup Location (You)</strong>" : "<strong style='font-family:system-ui'>Your location</strong>");
      
      markersRef.current.push(userMarker);
    }

    const donationIcon = L.divIcon({
      html: `<div style="width:36px;height:36px;border-radius:50%;background:#f59e0b;border:3px solid white;box-shadow:0 3px 12px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;">🍱</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      className: "",
    });

    const ngoHtmlIcon = showTracking ? 
      `<div class="relative flex items-center justify-center" style="width:40px;height:40px;">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <div style="position:relative;width:36px;height:36px;border-radius:50%;background:#10b981;border:3px solid white;box-shadow:0 3px 12px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;z-index:10;">🛵</div>
       </div>` :
      `<div style="width:36px;height:36px;border-radius:50%;background:#10b981;border:3px solid white;box-shadow:0 3px 12px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;">🏥</div>`;

    const ngoIcon = L.divIcon({
      html: ngoHtmlIcon,
      iconSize: showTracking ? [40, 40] : [36, 36],
      iconAnchor: showTracking ? [20, 20] : [18, 18],
      className: "",
    });

    donations.forEach((d) => {
      if (!d.latitude || !d.longitude) return;

      const popup = `
        <div style="font-family:system-ui;min-width:180px;padding:4px 2px;">
          <p style="font-weight:700;font-size:14px;margin:0 0 6px;color:#111;">${d.food_type}</p>
          <p style="font-size:12px;color:#555;margin:0 0 3px;">📦 ${d.quantity}</p>
          <p style="font-size:12px;color:#555;margin:0 0 3px;">📍 ${d.pickup_address}</p>
          <p style="font-size:12px;color:#555;margin:0;">⏰ ${formatWindow(d.pickup_window_start, d.pickup_window_end)}</p>
        </div>
      `;

      const marker = L.marker([d.latitude, d.longitude], { icon: donationIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(popup);

      if (onMarkerClick) marker.on("click", () => onMarkerClick(d));
      markersRef.current.push(marker);
    });

    ngos.forEach((ngo) => {
      if (!ngo.latitude || !ngo.longitude) return;

      const popup = `
        <div style="font-family:system-ui;min-width:180px;padding:4px 2px;">
          <p style="font-weight:700;font-size:14px;margin:0 0 6px;color:#111;">${ngo.org_name || ngo.full_name || 'Verified NGO'}</p>
          <p style="font-size:12px;color:#555;margin:0 0 3px;">📞 ${ngo.phone || 'N/A'}</p>
          ${showTracking ? '<p style="font-size:12px;color:#10b981;font-weight:600;margin:4px 0 0;">🛵 Volunteer En Route</p>' : ''}
        </div>
      `;

      const marker = L.marker([ngo.latitude, ngo.longitude], { icon: ngoIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(popup);

      if (onNgoClick) marker.on("click", () => onNgoClick(ngo));
      markersRef.current.push(marker);

      // Draw dotted line if tracking mode is on
      if (showTracking && userLat && userLng) {
        const lineCoords = [
          [userLat, userLng],
          [ngo.latitude, ngo.longitude]
        ];
        
        polylineRef.current = L.polyline(lineCoords, {
          color: '#10b981',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 8', // Dotted line effect
          lineJoin: 'round'
        }).addTo(mapInstanceRef.current);
      }
    });

    // Fit bounds to show all pins
    if (markersRef.current.length > 0 || polylineRef.current) {
      try {
        let groupItems = [...markersRef.current];
        if (polylineRef.current) groupItems.push(polylineRef.current);
        const group = L.featureGroup(groupItems);
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.3), { maxZoom: 15 });
      } catch {
        // ignore fitBounds errors when bounds are degenerate
      }
    }
  }, [donations, ngos, onMarkerClick, onNgoClick, showTracking, userLat, userLng]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full min-h-[360px] rounded-2xl overflow-hidden border border-border/60 shadow-sm"
    />
  );
}
