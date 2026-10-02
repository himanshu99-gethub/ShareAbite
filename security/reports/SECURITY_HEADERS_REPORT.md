# SECURITY_HEADERS Security Report

## Status: HIGH

## Findings

### `vercel.json` check
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "outputDirectory": "dist/client",
  "functions": { "api/ssr.js": { ... } },
  "routes": [...]
}
```
**No `headers` configuration present.** Vercel is not setting any security headers.

### Application-level headers
No `helmet`, `X-Frame-Options`, `Content-Security-Policy`, `Strict-Transport-Security`, or other security headers are set in `vite.config.ts` or any middleware.

### Missing headers (all five required):

| Header | Status |
|--------|--------|
| Content-Security-Policy | ❌ Missing |
| Strict-Transport-Security | ❌ Missing (Vercel adds HSTS by default — verify) |
| X-Frame-Options | ❌ Missing |
| X-Content-Type-Options | ❌ Missing |
| Referrer-Policy | ❌ Missing |

### ⚠️ HIGH — No CSP set
Without a CSP, the browser allows inline scripts, eval, and external resources from any domain. If XSS is found, it's trivially exploitable.

### ⚠️ MEDIUM — Vercel may add HSTS automatically
Vercel adds `Strict-Transport-Security` on their edge. Verify with `curl -sI https://your-deployed-url.vercel.app` in production.

## What's at risk

- Clickjacking attacks (no X-Frame-Options or CSP frame-ancestors)
- XSS attacks have maximum impact without CSP
- MIME type sniffing attacks (no X-Content-Type-Options)
- Referrer leakage (no Referrer-Policy)

## What's already secure

- App is served over HTTPS via Vercel (HSTS likely present)
- No dangerous response headers found (no `X-Powered-By`, etc.)

## Recommendations

1. **HIGH**: Add `headers` config to `vercel.json` with all 5 security headers
2. **HIGH**: Implement a basic CSP — start with `Content-Security-Policy-Report-Only` to avoid breaking the app
3. **MEDIUM**: Add `X-Frame-Options: DENY` and `X-Content-Type-Options: nosniff` (simplest fixes)

### Suggested `vercel.json` headers block:
```json
"headers": [
  {
    "source": "/(.*)",
    "headers": [
      { "key": "X-Frame-Options", "value": "DENY" },
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
      { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(self)" },
      { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" }
    ]
  }
]
```
