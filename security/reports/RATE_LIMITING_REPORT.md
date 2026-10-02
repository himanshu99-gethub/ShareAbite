# RATE_LIMITING Security Report

## Status: PASS (partial)

## Findings

### ✅ OTP rate limiting implemented in `otp-service.ts`
```ts
// Rate Limiting: Max 5 OTP requests per 10 minutes per email
const requestTimestamps = (otpRequestRateLimit.get(email) || []).filter(
  (t) => nowMs - t < 10 * 60 * 1000
);
if (requestTimestamps.length >= 5) {
  return { success: false, error: "Too many OTP requests...", status: 429 };
}
```

### ✅ OTP resend cooldown (60 seconds)
```ts
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
```

### ✅ OTP attempt limiting (max 5 attempts)
```ts
const MAX_ATTEMPTS = 5;
if (targetRecord.attempts_count >= MAX_ATTEMPTS) {
  targetRecord.is_used = true; // Invalidate on too many attempts
}
```

### ⚠️ MEDIUM — In-memory rate limiting (not distributed)
Rate limit state is stored in `Map` objects in process memory:
```ts
const otpRequestRateLimit = new Map<string, number[]>();
```
In a serverless deployment (Vercel functions), **each invocation may have a fresh memory state**. This means rate limiting does not persist across function restarts — effectively bypassed in production.

### ⚠️ MEDIUM — No rate limiting on password verification endpoint
`/auth/verify-password` has no rate limiting. An attacker can brute-force passwords.

### ⚠️ LOW — No X-Forwarded-For spoofing protection
Rate limiting is keyed by email, not IP. This means IP-based bypass is not applicable, but a single attacker can still use many email addresses.

## What's at risk

- OTP brute force (mitigated by 5-attempt limit + expiry, but not persistent across restarts)
- Password brute force on `/auth/verify-password` (no limit)

## What's already secure

- OTP rate limiting logic is correct and well-implemented
- OTP invalidated after 5 failed attempts
- 60-second resend cooldown prevents OTP flooding per email

## Recommendations

1. **HIGH**: Move rate limiting state to Supabase `otps` table (already persisted there) instead of in-memory Map
2. **HIGH**: Add rate limiting to `/auth/verify-password` endpoint (max 10 attempts per 15 min)
3. **MEDIUM**: Add IP-based rate limiting as a second layer using Vercel Edge middleware
