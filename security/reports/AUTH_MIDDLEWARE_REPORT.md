# AUTH_MIDDLEWARE Security Report

## Status: MEDIUM

## Findings

### Route Inventory

The app uses TanStack Router (file-based). Routes found:

| Route | Auth Protected? | Notes |
|-------|----------------|-------|
| `/` (index.tsx) | ❌ Public | Landing page — acceptable |
| `/login` | ❌ Public | Login page — acceptable |
| `/app` | ✅ Client-side redirect | Redirects to `/login` if `!user` |
| `/insights` | Unknown | Not checked |
| `/settings` | Unknown | Not checked |
| `/onboarding` | ❌ Unknown | Very small file, not reviewed |

### ⚠️ MEDIUM — Auth is client-side only (no server guard)

`/app` route does auth checking in a `useEffect`:
```tsx
useEffect(() => {
  if (!user) {
    navigate({ to: "/login" });
    return;
  }
  ...
}, [user, authLoading, ...]);
```

This is **client-side redirect only**. The page briefly renders before the redirect fires. More importantly, **server-side rendering (SSR)** is enabled (via TanStack Start + Vercel SSR), so server functions and API routes must separately verify auth.

### ✅ Server-side middleware exists

`requireSupabaseAuth` middleware in `auth-middleware.ts` properly:
- Checks for `Authorization: Bearer <token>` header
- Validates token format (3-part JWT)
- Calls `supabase.auth.getClaims(token)` to verify with Supabase
- Exposes `userId` and `claims` to the context

### ⚠️ MEDIUM — Unknown: Is `requireSupabaseAuth` applied to all server functions?

The middleware exists but it's unclear whether it's wired to ALL server functions (TanStack Start server functions). This requires checking each server function definition.

### ⚠️ LOW — Auth error returns `Error` not HTTP 401

The middleware throws `new Error('Unauthorized: ...')` instead of returning an HTTP 401 response object. This works in TanStack Start (it catches and serializes errors) but may return verbose error messages to clients.

## What's at risk

- SSR page content briefly visible before redirect fires (flash of authenticated content)
- If any server function omits the middleware, it's fully unprotected

## What's already secure

- Auth middleware is well-implemented and uses proper Supabase token validation
- Client-side redirects are present on all authenticated routes
- Server-side Supabase admin client is correctly isolated to `.server.ts` files

## Recommendations

1. **MEDIUM**: Add `loader` auth checks to TanStack Router routes (server-side, not just useEffect)
2. **MEDIUM**: Audit every server function to confirm `requireSupabaseAuth` middleware is applied
3. **LOW**: Return 401 HTTP response from middleware instead of thrown errors
