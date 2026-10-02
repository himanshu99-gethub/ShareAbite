# CSRF Security Report

## Status: MEDIUM

## Findings

### Auth mechanism: JWT Bearer tokens
The app uses JWT tokens (signed with HS256 via `auth-jwt.ts`) stored in... where? This is critical for CSRF assessment.

**JWT in localStorage**: If stored in localStorage, CSRF is not applicable (cookies are not involved). However, XSS can steal the token.

**JWT in cookies**: If stored in cookies without `SameSite`, CSRF applies.

### OTP auth endpoints (vite.config.ts dev server + production API)
The following endpoints exist:
- `POST /auth/send-otp`
- `POST /auth/verify-otp`
- `POST /auth/resend-otp`
- `POST /auth/reset-password-otp`
- `POST /auth/verify-reset-password`
- `POST /auth/verify-password`

These do **not** use cookies — they receive `email` and `otp` in JSON body. No CSRF token mechanism is present, but since they don't rely on session cookies, CSRF doesn't apply to them.

### ⚠️ MEDIUM — Supabase session cookies not audited
Supabase Auth uses `localStorage` for session storage as configured:
```ts
auth: {
  storage: typeof window !== 'undefined' ? localStorage : undefined,
  persistSession: true,
  autoRefreshToken: true,
}
```
This means the Supabase session is in **localStorage**, not cookies. **CSRF does not apply** for Supabase-authenticated API calls.

However, no `SameSite` or `HttpOnly` cookie flags are being set by the application. Supabase itself handles its cookie management for SSR-side sessions.

### ⚠️ MEDIUM — No explicit CSRF protection on auth endpoints
While JSON body + non-cookie auth makes CSRF infeasible here, there is no explicit CSRF token, `Origin` header check, or `SameSite` enforcement in the custom auth endpoints.

## What's at risk

- If a future developer adds cookie-based auth, CSRF becomes immediately exploitable
- Currently: low actual risk since JWT is stored in localStorage

## What's already secure

- Custom auth endpoints use JSON body, not form-encoded data
- Supabase session stored in localStorage (not cookies) prevents cookie-based CSRF
- Auth endpoints require correct token structure (3-part JWT)

## Recommendations

1. **MEDIUM**: Add `Origin` / `Referer` header validation to all POST auth endpoints as defense-in-depth
2. **LOW**: Document the CSRF threat model decision (localStorage JWT) so future developers don't accidentally introduce cookies without CSRF protection
