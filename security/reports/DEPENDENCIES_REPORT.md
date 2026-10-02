# DEPENDENCIES Security Report

## Status: MEDIUM

## Findings

### Lock files committed: ✅
Both `bun.lockb` and `package-lock.json` are committed to the repo.

### Key dependencies checked:

| Package | Version | Registry | Risk |
|---------|---------|----------|------|
| `@supabase/supabase-js` | ^2.100.0 | npm ✅ | Low |
| `jsonwebtoken` | ^9.0.2 | npm ✅ | Low |
| `nodemailer` | ^6.9.16 | npm ✅ | Low |
| `react` | ^19.2.0 | npm ✅ | Low |
| `@tanstack/react-router` | 1.162.9 | npm ✅ | Low |
| `vite` | ^7.3.1 | npm ✅ | Low |
| `zod` | ^3.24.2 | npm ✅ | Low |
| `lovable-tagger` | ^1.1.13 | npm ⚠️ | Check below |

### ⚠️ MEDIUM — `lovable-tagger` is a dev dependency for Lovable.dev platform
`lovable-tagger` is a commercial tool-tagger for the Lovable AI platform. It's a dev dependency and runs only in development mode (`mode === "development" && componentTagger()`). It has moderate download counts. Not a hallucinated package, but its presence in production builds should be verified.

### ⚠️ LOW — Version ranges use `^` (caret)
Most dependencies use `^` which allows minor/patch updates. For production, consider pinning to exact versions.

### ⚠️ LOW — Duplicate lock files
Both `bun.lockb` and `package-lock.json` exist. This suggests the project was managed with both Bun and npm at different times, potentially creating inconsistencies.

## What's at risk

- Dependency confusion attack (mitigated by using well-known packages)
- Caret versions could pull in a compromised minor release

## What's already secure

- All core dependencies are well-established npm packages with large download counts
- Lock files are committed
- No obviously suspicious or newly-published packages found

## Recommendations

1. **MEDIUM**: Run `npm audit` and review any HIGH/CRITICAL advisories
2. **LOW**: Remove duplicate lock file — pick either bun or npm, not both
3. **LOW**: Pin `lovable-tagger` to exact version or remove if not actively using Lovable.dev
4. **INFO**: Consider `npm audit --audit-level=high` in CI pipeline
