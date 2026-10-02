# FRONTEND_SECRETS Security Report

## Status: PASS (with notes)

## Findings

### ✅ No secret keys in frontend code
Grep of all `src/` files found only `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PROJECT_ID`, and `VITE_GOOGLE_CLIENT_ID` in client-accessible code. These are **public/publishable keys** — intentionally client-facing.

### ✅ Supabase anon key is safe to expose
The `VITE_SUPABASE_PUBLISHABLE_KEY` is the Supabase `anon` key. It is **designed** to be public. RLS policies protect the data.

### ✅ Google Client ID is safe to expose
`VITE_GOOGLE_CLIENT_ID` is a public OAuth client ID — never a secret.

### ✅ Service role key not in any VITE_ variable
`SUPABASE_SERVICE_ROLE_KEY` has no `VITE_` prefix, so it won't be bundled.

### ⚠️ LOW — Source maps not explicitly disabled
`vite.config.ts` has no `build.sourcemap` setting. Vite defaults to `false` in production — acceptable but not explicit.

### ⚠️ LOW — `dangerouslySetInnerHTML` in chart.tsx
Used to inject CSS custom properties (color tokens), not user content. Low risk but worth noting:
```tsx
// src/components/ui/chart.tsx:79
dangerouslySetInnerHTML={{
  __html: Object.entries(THEMES).map(...) // generates CSS variable declarations only
}}
```
The content is developer-controlled CSS strings, not user input. Not exploitable.

## What's at risk

- If `VITE_SUPABASE_SERVICE_ROLE_KEY` were ever added, it would be bundled. Current state is safe.

## What's already secure

- Only publishable/public keys exposed via VITE_ prefix
- Source maps default to off in production
- `dangerouslySetInnerHTML` only used for developer-controlled CSS content

## Recommendations

1. **LOW**: Add `build: { sourcemap: false }` explicitly to `vite.config.ts`
2. **INFO**: Add a comment in `.env.example` warning never to use `VITE_` prefix for secrets
