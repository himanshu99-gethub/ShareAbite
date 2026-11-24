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
    <html lang="en" className="overflow-x-hidden">
      <head>
        <HeadContent />
        <script
          defer
          src="https://www.boosthis.com/kit.js"
          data-key="bksend_429a4e9df9f72936137804784bfee35f2f816e81c0ba20fc7e82a1372f8d7df2"
          data-install="1f5d7784-efce-4d68-88d4-a2312ad048bb"
          data-project="shareAbte"
          onError={(event) =>
            console.error(
              "[boosthis] Boosthis did not load: " +
                event.currentTarget.src +
                " never arrived, so nothing is measuring. Check the address, the network, and any Content-Security-Policy.",
            )
          }
        />
      </head>
      <body className="pb-[env(safe-area-inset-bottom)] overflow-x-hidden min-h-screen">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { SmoothScrollProvider } from "@/components/common/SmoothScrollProvider";

function RootComponent() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="shareabite-theme">
      <SmoothScrollProvider>
        <div className="animate-page-enter">
          <Outlet />
        </div>
        <Toaster position="top-center" richColors />
      </SmoothScrollProvider>
    </ThemeProvider>
  );
}
