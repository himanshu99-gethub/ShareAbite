import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "ShareABite — Connect Surplus Food to Those Who Need It" },
      { name: "description", content: "ShareABite connects restaurants and households with surplus food to nearby NGOs and shelters. Reduce food waste. Fight hunger." },
      { name: "author", content: "ShareABite" },
      { property: "og:title", content: "ShareABite — Food Donation & Redistribution Platform" },
      { property: "og:description", content: "Connect surplus food with nearby NGOs and shelters. Reduce waste. End hunger." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "ShareABite — Food Donation & Redistribution" },
      { name: "twitter:description", content: "Connect surplus food with nearby NGOs and shelters." },
    ],
    scripts: [
      {
        src: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
        integrity: "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV/XN/WPaA=",
        crossOrigin: "anonymous",
      },
    ],
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="pb-[env(safe-area-inset-bottom)]">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { ThemeProvider } from "@/components/ui/ThemeProvider";

function RootComponent() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="shareabite-theme">
      <div className="animate-page-enter">
        <Outlet />
      </div>
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  );
}
