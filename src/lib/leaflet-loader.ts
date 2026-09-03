// Reliable dynamic loader for Leaflet JS & CSS
declare global {
  interface Window {
    L: any;
    _leafletPromise?: Promise<any>;
  }
}

export function loadLeaflet(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Leaflet can only load in browser environment"));
  }

  if (window.L) {
    return Promise.resolve(window.L);
  }

  if (window._leafletPromise) {
    return window._leafletPromise;
  }

  window._leafletPromise = new Promise((resolve, reject) => {
    // 1. Inject Leaflet CSS if not already present
    if (!document.getElementById("leaflet-css-bundle")) {
      const link = document.createElement("link");
      link.id = "leaflet-css-bundle";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.crossOrigin = "";
      document.head.appendChild(link);
    }

    // 2. Check if script tag is already in DOM
    const existingScript = document.querySelector('script[src*="leaflet.js"]') as HTMLScriptElement;
    if (existingScript) {
      if (window.L) {
        return resolve(window.L);
      }
      existingScript.addEventListener("load", () => resolve(window.L));
      existingScript.addEventListener("error", (e) => reject(e));

      // Poll as fallback if already loaded
      let tries = 0;
      const interval = setInterval(() => {
        tries++;
        if (window.L) {
          clearInterval(interval);
          resolve(window.L);
        } else if (tries > 50) {
          clearInterval(interval);
          reject(new Error("Timeout waiting for Leaflet script to initialize"));
        }
      }, 100);
      return;
    }

    // 3. Inject Leaflet JS
    const script = document.createElement("script");
    script.id = "leaflet-js-bundle";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.crossOrigin = "";
    script.async = true;

    script.onload = () => {
      if (window.L) {
        resolve(window.L);
      } else {
        reject(new Error("Leaflet script loaded but window.L is undefined"));
      }
    };

    script.onerror = (err) => {
      reject(err || new Error("Failed to load Leaflet script from CDN"));
    };

    document.head.appendChild(script);
  });

  return window._leafletPromise;
}
