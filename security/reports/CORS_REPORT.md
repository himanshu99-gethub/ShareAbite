# CORS Security Report

## Status: MEDIUM

## Findings

### No explicit CORS configuration found in application code
The app uses TanStack Start + Vercel serverless. No custom `cors()` middleware, `Access-Control-Allow-Origin` header, or CORS config was found in `vite.config.ts`, `vercel.json`, or any middleware.

### ⚠️ MEDIUM — Vercel default CORS behavior not verified
Vercel may add `Access-Control-Allow-Origin: *` on static assets by default. This needs to be verified against the deployed app.

### ✅ API routes (auth endpoints) have no explicit CORS
The OTP auth endpoints (`/auth/*`) have no CORS headers set — meaning they default to same-origin only. This is correct for server-side rendered routes.

### ⚠️ MEDIUM — Supabase allows CORS from any origin by default
Supabase PostgREST API (`https://txjgfbacbysljqaeseqw.supabase.co`) allows requests from all origins by default. This is controlled in the Supabase dashboard under "API Settings → CORS allowed origins". If not configured, any website can make authenticated requests if they steal a user's token.

## What's at risk

- If Supabase CORS is set to `*` (default), cross-origin token theft becomes more exploitable
- Static assets served with `Access-Control-Allow-Origin: *` could be abused in specific attack scenarios

## What's already secure

- Application API routes appear to use same-origin by default
- No `credentials: true` + wildcard origin combination found

## Recommendations

1. **MEDIUM**: In Supabase dashboard → API Settings → CORS, restrict allowed origins to your production domain only
2. **MEDIUM**: Verify deployed app's CORS headers with `curl -sI -X OPTIONS https://your-app.vercel.app`
3. **LOW**: Explicitly set `Access-Control-Allow-Origin` in `vercel.json` for static assets
