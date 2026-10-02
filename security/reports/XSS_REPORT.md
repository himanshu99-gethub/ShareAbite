# XSS Security Report

## Status: LOW

## Findings

### ✅ No `dangerouslySetInnerHTML` with user content
The only `dangerouslySetInnerHTML` usage found is in `src/components/ui/chart.tsx` for CSS custom properties injection:
```tsx
dangerouslySetInnerHTML={{
  __html: Object.entries(THEMES).map(([theme, prefix]) =>
    `${prefix} [data-chart=${id}] { ... CSS variables ... }`
  ).join("\n"),
}}
```
The content is **developer-controlled static strings** from `THEMES` config — not user input. Not exploitable.

### ✅ No `innerHTML` assignments found in codebase

### ✅ React framework autoescaping
All user-supplied data rendered via JSX is automatically HTML-escaped by React. The `{}` interpolation in JSX does not allow raw HTML injection.

### ✅ Template rendering is server-side for emails only
`email-service.ts` renders HTML emails, but the only user data interpolated is `otp` (a 6-digit number) and `type` (developer enum). Not user-controlled HTML.

### ⚠️ LOW — No DOMPurify present
`DOMPurify` is not installed. This is fine while no raw HTML rendering is needed, but if a rich text editor or markdown renderer is added in the future, sanitization will be needed.

## What's at risk

Nothing currently exploitable.

## What's already secure

- React autoescaping prevents JSX-level XSS
- No `dangerouslySetInnerHTML` with user content
- No `innerHTML` assignments

## Recommendations

1. **INFO**: If a rich text editor or user-generated HTML is ever added, install and use `DOMPurify`
2. **INFO**: Add a CSP `script-src 'self'` header (see SECURITY_HEADERS report) to reduce XSS blast radius
