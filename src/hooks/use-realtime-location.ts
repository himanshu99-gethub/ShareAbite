import { useState, useEffect, useRef, useCallback } from "react";

export interface LiveLocationState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;      // metres
  speed: number | null;         // m/s
  heading: number | null;       // degrees 0-360
  timestamp: number | null;
  isTracking: boolean;
  error: string | null;
  permissionStatus: "prompt" | "granted" | "denied" | "unknown";
  distanceTravelled: number;    // metres since tracking started
}

export interface UseRealTimeLocationOptions {
  enableHighAccuracy?: boolean;
  maxAge?: number;              // ms — how stale a cached position is OK
  timeout?: number;             // ms — max wait per fix
  updateIntervalMs?: number;    // throttle map updates (default 2000 ms)
  autoStart?: boolean;          // start on mount
}

/** Haversine distance in metres between two lat/lng pairs */
function haversineMetres(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6_371_000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useRealTimeLocation(
  options: UseRealTimeLocationOptions = {}
): LiveLocationState & {
  startTracking: () => void;
  stopTracking: () => void;
  centerOnMe: (mapInstance: any) => void;
} {
  const {
    enableHighAccuracy = true,
    maxAge = 10_000,
    timeout = 15_000,
    updateIntervalMs = 2_000,
    autoStart = true,
  } = options;

  const [state, setState] = useState<LiveLocationState>({
    lat: null,
    lng: null,
    accuracy: null,
    speed: null,
    heading: null,
    timestamp: null,
    isTracking: false,
    error: null,
    permissionStatus: "unknown",
    distanceTravelled: 0,
  });

  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const prevCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const totalDistRef = useRef<number>(0);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState((s) => ({ ...s, isTracking: false }));
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        error: "Geolocation is not supported by this browser.",
        permissionStatus: "denied",
      }));
      return;
    }

    setState((s) => ({ ...s, isTracking: true, error: null }));

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        // Throttle updates
        if (now - lastUpdateRef.current < updateIntervalMs) return;
        lastUpdateRef.current = now;

        const { latitude, longitude, accuracy, speed, heading } = pos.coords;

        // Accumulate distance, filter GPS noise < 2 m
        if (prevCoordsRef.current) {
          const dist = haversineMetres(
            prevCoordsRef.current.lat,
            prevCoordsRef.current.lng,
            latitude,
            longitude
          );
          if (dist > 2) {
            totalDistRef.current += dist;
            prevCoordsRef.current = { lat: latitude, lng: longitude };
          }
        } else {
          prevCoordsRef.current = { lat: latitude, lng: longitude };
        }

        setState((s) => ({
          ...s,
          lat: latitude,
          lng: longitude,
          accuracy: accuracy ?? null,
          speed: speed ?? null,
          heading: heading ?? null,
          timestamp: pos.timestamp,
          isTracking: true,
          error: null,
          permissionStatus: "granted",
          distanceTravelled: totalDistRef.current,
        }));
      },
      (err) => {
        let msg = "Location error.";
        if (err.code === 1)
          msg = "Location permission denied. Please allow in browser settings.";
        else if (err.code === 2)
          msg = "Location unavailable. Check GPS signal.";
        else if (err.code === 3)
          msg = "Location request timed out.";

        setState((s) => ({
          ...s,
          error: msg,
          isTracking: false,
          permissionStatus: err.code === 1 ? "denied" : s.permissionStatus,
        }));
      },
      { enableHighAccuracy, maximumAge: maxAge, timeout }
    );

    watchIdRef.current = id;
  }, [enableHighAccuracy, maxAge, timeout, updateIntervalMs]);

  /** Smoothly fly Leaflet map to current location */
  const centerOnMe = useCallback(
    (mapInstance: any) => {
      if (!mapInstance || !state.lat || !state.lng) return;
      mapInstance.flyTo([state.lat, state.lng], 16, { duration: 1.2 });
    },
    [state.lat, state.lng]
  );

  // Auto-start on mount
  useEffect(() => {
    if (autoStart) startTracking();
    return () => stopTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...state, startTracking, stopTracking, centerOnMe };
}
