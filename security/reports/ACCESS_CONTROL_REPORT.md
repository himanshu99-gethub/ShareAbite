# ACCESS_CONTROL Security Report

## Status: MEDIUM

## Findings

### Database-level: PASS
All resource ownership checks are enforced at the RLS layer:
- Donations: `auth.uid() = donor_id` for write operations
- Pickup requests: `auth.uid() = receiver_id` for insert; donor confirmed by join
- Profiles: `auth.uid() = id` for all operations

### Application-level: MEDIUM risk

In `src/routes/app.tsx`, profile upsert uses `onConflict: "id"` but also passes `email` for a merge:
```tsx
await supabase.from("profiles").upsert({
  id: canonicalId,
  email: userEmail,
  role: mergedRole,
  ...
} as any, { onConflict: "id" });
```
If an attacker can craft a `?role=donor` query param on `/app`, they may be able to forcibly change their own role since `saveRole` is called when `queryRole` is truthy and `!profile?.role`. This is gated by `!profile?.role`, so it only fires for new accounts — acceptable.

### ⚠️ MEDIUM — No server-side IDOR check confirmed
Since auth is client-side for routes, server functions that accept resource IDs (e.g., donation ID in pickup request creation) rely entirely on RLS. If any server function reads by ID without the user's auth token forwarded correctly, IDOR is possible.

## What's at risk

- A malicious user guessing donation IDs and accessing them (mitigated by Supabase UUIDs)
- Role escalation via query params on fresh accounts

## What's already secure

- Supabase UUIDs make guessing IDs infeasible
- RLS properly scopes all read/write to ownership
- Receivers cannot modify donations they did not create

## Recommendations

1. **MEDIUM**: Audit all server functions that accept IDs to confirm the user's JWT is forwarded and RLS is active
2. **LOW**: Remove `?role=` query param mechanism and use a dedicated onboarding flow
