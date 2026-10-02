# SECRETS_EXPOSURE Security Report

## Status: HIGH

## Findings

### ✅ .env not committed to git
`git ls-files .env` returns nothing — the `.env` file is properly ignored.

### ✅ .gitignore correctly excludes .env
```
.env
.env.*
!.env.example
```

### ✅ .env.example contains only placeholder values
All values in `.env.example` are properly templated (e.g. `your_supabase_project_id`).

### ⚠️ CRITICAL — Hardcoded fallback secrets in source code

**`src/lib/server/auth-jwt.ts` (lines 28, 58):**
```ts
const secret = process.env.JWT_SECRET || "super_secret_jwt_key_for_otp_auth_2026";
```
This weak, predictable fallback JWT secret is hardcoded. Anyone who knows it can forge valid tokens.

**`src/lib/server/email-service.ts` (lines 95–97):**
```ts
const resendApiKey = ... || Buffer.from("cmVfOTZqQmZDdjRfOWtRNWQ3V0FzWU53d3F3eU45RjRWeWk4", "base64").toString("utf-8");
const rawEmail = ... || "himanshu.projectai@gmail.com";
const rawPass = ... || "unqhbprwkfcxvbko";
```
Real API keys and Gmail app passwords are hardcoded as fallbacks (including base64-obfuscated Resend key).

**`src/integrations/supabase/auth-middleware.ts` (line 37):**
```ts
const SUPABASE_PUBLISHABLE_KEY = ... || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...placeholder';
```
Placeholder JWT is hardcoded (low risk since it's placeholder-only).

### ⚠️ HIGH — VITE_ prefixed env vars exposed to browser bundle
`VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PROJECT_ID`, `VITE_GOOGLE_CLIENT_ID` are all bundled into the client-side JavaScript. The anon/publishable Supabase key is **designed** to be public — that is acceptable. Google Client ID is also public-safe.

However, there is a dangerous misconfiguration in `client.server.ts` (line 34):
```ts
let SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```
The SERVICE ROLE key falls back to the VITE publishable key. If the real service role key is missing, admin operations silently downgrade to anon-level access — no error, just silent privilege reduction.

### ⚠️ MEDIUM — No source map configuration found
`vite.config.ts` has no explicit `build.sourcemap` setting. Vite defaults to `false` in production, which is correct. However this should be explicitly declared.

## What's at risk

- Forged JWT tokens (predictable secret allows full account impersonation)
- Email account / Resend API abuse (credentials are in plaintext fallbacks)
- If `.env` were to be accidentally committed with real keys, all services are compromised

## What's already secure

- `.env` is properly gitignored and not tracked
- `.env.example` has safe placeholder values only
- VITE_ prefix env vars only contain public keys (anon key, Google client ID)
- No secret keys found in any `src/` component or page file

## Recommendations

1. **CRITICAL**: Remove all hardcoded secret fallbacks from `auth-jwt.ts` and `email-service.ts`. Throw an error if env vars are missing instead.
2. **HIGH**: Rotate the `JWT_SECRET`, Gmail app password, and Resend API key immediately (they are in source code).
3. **MEDIUM**: Add `build: { sourcemap: false }` explicitly to `vite.config.ts`.
4. **LOW**: Fix the `client.server.ts` fallback chain — service role key should never fall back to a publishable key.
