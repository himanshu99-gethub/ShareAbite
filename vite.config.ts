import path from "path";
import fs from "fs";
import { defineConfig, loadEnv } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
// Cloudflare plugin removed — deploying to Vercel instead
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { componentTagger } from "lovable-tagger";

function devClientErrorLogger() {
  const VIRTUAL_ID = "virtual:dev-client-error-handler";
  const RESOLVED_ID = "\0" + VIRTUAL_ID;

  return {
    name: "dev-client-error-logger",
    apply: "serve" as const,
    enforce: "pre" as const,

    resolveId(id: string) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },

    load(id: string) {
      if (id !== RESOLVED_ID) return;
      return [
        "if (typeof window !== 'undefined' && import.meta.hot) {",
        "  const send = (d) => { try { import.meta.hot.send('client-runtime-error', d) } catch {} };",
        "  window.addEventListener('error', (e) => {",
        "    send({ type: 'runtime-error', message: e.message, stack: e.error?.stack, filename: e.filename, lineno: e.lineno, colno: e.colno });",
        "  });",
        "  window.addEventListener('unhandledrejection', (e) => {",
        "    const err = e.reason;",
        "    send({ type: 'unhandled-rejection', message: err?.message || String(err), stack: err?.stack });",
        "  });",
        "}",
      ].join("\n");
    },

    configureServer(server: import("vite").ViteDevServer) {
      const origConsoleError = console.error;
      let forwarding = false;
      console.error = (...args: unknown[]) => {
        origConsoleError.apply(console, args);
        if (forwarding) return;
        forwarding = true;
        try {
          const error = args[0];
          if (error instanceof Error) {
            server.ws.send({
              type: "custom",
              event: "client-runtime-error",
              data: {
                source: "ssr",
                type: "ssr-render-error",
                name: error.name,
                message: error.message,
                stack: error.stack,
              },
            });
          }
        } finally {
          forwarding = false;
        }
      };

      server.ws.on(
        "client-runtime-error",
        (data: Record<string, string>) => {
          const { type, message, stack, filename, lineno, colno } = data;
          const label =
            type === "unhandled-rejection"
              ? "Unhandled Rejection"
              : "Runtime Error";
          let loc = "";
          if (filename) {
            loc = ` at ${filename}`;
            if (lineno != null) loc += `:${lineno}`;
            if (colno != null) loc += `:${colno}`;
          }
          server.config.logger.error(
            `\n[client] ${label}: ${message}${loc}`,
          );
          if (stack) {
            server.config.logger.error(stack);
          }

          server.ws.send({
            type: "custom",
            event: "client-runtime-error",
            data,
          });
        },
      );
    },

    transform(code: string, id: string) {
      const normalizedId = id.replace(/\\/g, "/");

      if (normalizedId.includes("routes/__root")) {
        return `import "${VIRTUAL_ID}";\n${code}`;
      }
    },
  };
}

function devServerFnErrorLogger() {
  const HMR_SEND_KEY = "__TANSTACK_SERVER_FN_HMR_SEND__";

  return {
    name: "dev-server-fn-error-logger",
    apply: "serve" as const,
    enforce: "pre" as const,
    configureServer(server: import("vite").ViteDevServer) {
      (globalThis as Record<string, unknown>)[HMR_SEND_KEY] = (data: unknown) => {
        server.ws.send({
          type: "custom",
          event: "server-fn-error",
          data,
        });
      };
    },
    transform(code: string, id: string) {
      const normalizedId = id.replace(/\\/g, "/");
      const isTargetModule =
        normalizedId.includes(
          "/@tanstack/start-server-core/src/server-functions-handler.ts",
        ) ||
        normalizedId.includes(
          "/@tanstack/start-server-core/dist/esm/server-functions-handler.js",
        );

      if (!isTargetModule) {
        return null;
      }

      const needle = "const unwrapped = res.result || res.error";
      if (!code.includes(needle)) {
        return null;
      }

      return code.replace(
        needle,
        `${needle}

      if (res?.error) {
        const err = res.error
        const payload = {
          source: 'tanstack',
          type: 'server-fn-error',
          method: request.method,
          url: request.url,
          name: err?.name ?? 'Error',
          message: err?.message ?? String(err),
          stack: typeof err?.stack === 'string' ? err.stack : undefined,
        }
        globalThis.${HMR_SEND_KEY}?.(payload)
      }`,
      );
    },
  };
}

function authApiPlugin() {
  return {
    name: "auth-api-plugin",
    configureServer(server: import("vite").ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0];
        const allowedUrls = [
          "/auth/send-otp",
          "/auth/verify-otp",
          "/auth/resend-otp",
          "/auth/reset-password-otp",
          "/auth/verify-reset-password",
          "/auth/verify-password",
        ];
        if (!url || !allowedUrls.includes(url)) {
          return next();
        }

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          return res.end(JSON.stringify({ success: false, error: "Method Not Allowed" }));
        }

        let bodyRaw = "";
        req.on("data", (chunk) => {
          bodyRaw += chunk;
        });

        req.on("end", async () => {
          try {
            let body = {};
            if (bodyRaw) {
              try {
                body = JSON.parse(bodyRaw);
              } catch (e) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                return res.end(JSON.stringify({ success: false, error: "Invalid JSON request body." }));
              }
            }

            // Invalidate module graph cache to guarantee fresh code execution
            const modPath = path.resolve(__dirname, "./src/lib/server/auth-controller.ts");
            const modNode = server.moduleGraph.getModuleById(modPath);
            if (modNode) {
              server.moduleGraph.invalidateModule(modNode);
            }

            const {
              handleSendOtpRequest,
              handleVerifyOtpRequest,
              handleResendOtpRequest,
              handleResetPasswordOtpRequest,
              handleConfirmPasswordResetRequest,
              handleVerifyPasswordRequest,
            } = await server.ssrLoadModule("./src/lib/server/auth-controller.ts");

            let result: { status: number; body: any };

            if (url === "/auth/send-otp") {
              result = await handleSendOtpRequest(body);
            } else if (url === "/auth/verify-otp") {
              result = await handleVerifyOtpRequest(body);
            } else if (url === "/auth/resend-otp") {
              result = await handleResendOtpRequest(body);
            } else if (url === "/auth/reset-password-otp") {
              result = await handleResetPasswordOtpRequest(body);
            } else if (url === "/auth/verify-reset-password") {
              result = await handleConfirmPasswordResetRequest(body);
            } else {
              result = await handleVerifyPasswordRequest(body);
            }

            res.statusCode = result.status || 200;
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify(result.body));
          } catch (err: any) {
            console.error(`[authApiPlugin] Server processing error:`, err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify({ success: false, error: err?.message || "Internal server error." }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load VITE_ env vars and define them for SSR
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const envDefine: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    define: envDefine,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      authApiPlugin(),
      devClientErrorLogger(),
      devServerFnErrorLogger(),
      tanstackStart(),
      viteReact(),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
  };
});
