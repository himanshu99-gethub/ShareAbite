export interface LocationResult {
  lat: number;
  lng: number;
  accuracy?: number;
  city?: string;
  isApproximate?: boolean;
  permissionDenied?: boolean;
  source: "gps-high" | "gps-low" | "ip-fallback" | "default";
}

/**
 * Checks the current browser geolocation permission status without prompting.
 */
export async function checkGeolocationPermission(): Promise<"granted" | "denied" | "prompt" | "unsupported"> {
  if (typeof window === "undefined" || !navigator.permissions || !navigator.geolocation) {
    return "unsupported";
  }
  try {
    const status = await navigator.permissions.query({ name: "geolocation" as PermissionName });
    return status.state;
  } catch {
    return "prompt";
  }
}

/**
 * Robustly resolves the user's location with automatic fallbacks:
 * 1. Browser Geolocation (High Accuracy GPS)
 * 2. Browser Geolocation (Low Accuracy / WiFi / Cellular)
 * 3. IP-based City Geolocation (Free CORS APIs - works even when GPS is blocked/denied!)
 * 4. Default coordinates (India Center)
 */
export async function getUserLocation(): Promise<LocationResult> {
  if (typeof window === "undefined") {
    return { lat: 28.6139, lng: 77.2090, source: "default" };
  }

  // 1. Try High Accuracy Browser GPS
  if (navigator.geolocation) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 15000,
        });
      });

      return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        source: "gps-high",
      };
    } catch (err: any) {
      const isDenied = err?.code === 1;

      // 2. If it wasn't denied, try low-accuracy (faster on desktop PCs without GPS chips)
      if (!isDenied) {
        try {
          const lowPos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 4000,
              maximumAge: 60000,
            });
          });

          return {
            lat: lowPos.coords.latitude,
            lng: lowPos.coords.longitude,
            accuracy: lowPos.coords.accuracy,
            source: "gps-low",
          };
        } catch (_) {}
      }

      // 3. Fallback to IP-based Geolocation (works seamlessly even if GPS is denied or unavailable)
      const ipResult = await getIpLocationFallback();
      if (ipResult) {
        return {
          ...ipResult,
          permissionDenied: isDenied,
        };
      }

      if (isDenied) {
        return {
          lat: 28.6139,
          lng: 77.2090,
          permissionDenied: true,
          source: "default",
        };
      }
    }
  }

  // 4. IP fallback if geolocation is completely unsupported
  const ipResult = await getIpLocationFallback();
  if (ipResult) return ipResult;

  return { lat: 28.6139, lng: 77.2090, source: "default" };
}

/**
 * Free IP-based Geolocation fallback using public CORS-enabled APIs
 */
async function getIpLocationFallback(): Promise<LocationResult | null> {
  const apis = [
    // 1. ipwho.is (CORS enabled, highly accurate, fast in India & global)
    async () => {
      const res = await fetch("https://ipwho.is/", { signal: AbortSignal.timeout(3500) });
      const data = await res.json();
      if (data.success && data.latitude && data.longitude) {
        return {
          lat: Number(data.latitude),
          lng: Number(data.longitude),
          city: data.city || data.region,
          isApproximate: true,
          source: "ip-fallback" as const,
        };
      }
      return null;
    },
    // 2. freeipapi.com
    async () => {
      const res = await fetch("https://freeipapi.com/api/json", { signal: AbortSignal.timeout(3500) });
      const data = await res.json();
      if (data.latitude && data.longitude) {
        return {
          lat: Number(data.latitude),
          lng: Number(data.longitude),
          city: data.cityName || data.regionName,
          isApproximate: true,
          source: "ip-fallback" as const,
        };
      }
      return null;
    },
    // 3. ipapi.co
    async () => {
      const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3500) });
      const data = await res.json();
      if (data.latitude && data.longitude) {
        return {
          lat: Number(data.latitude),
          lng: Number(data.longitude),
          city: data.city || data.region,
          isApproximate: true,
          source: "ip-fallback" as const,
        };
      }
      return null;
    },
  ];

  for (const api of apis) {
    try {
      const res = await api();
      if (res && res.lat && res.lng) return res;
    } catch (_) {}
  }

  return null;
}

