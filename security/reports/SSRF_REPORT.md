# SSRF Security Report

## Status: LOW

## Findings

### Potential SSRF surfaces found

**`src/lib/location-utils.ts` (lines 112, 127, 142):**
```ts
const res = await fetch("https://ipwho.is/", { signal: AbortSignal.timeout(3500) });
const res = await fetch("https://freeipapi.com/api/json", { signal: AbortSignal.timeout(3500) });
const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3500) });
```
These are **hardcoded, fixed URLs** — not user-supplied. Not SSRF.

**`src/components/MapView.tsx` (line 18):**
```ts
const res = await fetch(url);
```
The `url` variable should be checked — if it comes from user input or props, this is SSRF.

**`src/lib/server/email-service.ts` (line 138):**
```ts
const resendRes = await fetch("https://api.resend.com/emails", { ... });
```
Hardcoded URL. Not SSRF.

### ⚠️ LOW — MapView fetch URL source unclear
Without seeing the full MapView component context, it's unclear if the `url` in `fetch(url)` is user-controlled or hardcoded (e.g., Leaflet tile URL).

## What's at risk

- If MapView's `url` is user-controlled, an attacker could request internal metadata services (e.g., AWS IMDS at `169.254.169.254`)

## What's already secure

- All other fetch calls use hardcoded, trusted URLs
- Timeout signals are set (3500ms) preventing slow-read attacks on IP geolocation calls

## Recommendations

1. **LOW**: Review `MapView.tsx` fully to confirm `url` is not user-controlled
2. **INFO**: If any user-supplied URL fetching is ever added, validate against an allowlist of schemes (https only) and block private IP ranges
