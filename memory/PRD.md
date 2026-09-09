# Saturn / PresetBridge — PRD

## Original problem statement
Rebuild the existing static HTML/CSS/JS artifacts as one unified React + FastAPI + MongoDB product: a marketing landing page and a working After Effects preset converter web app behind it. Ships as "analyze + compatibility package", not true binary .ffx rewriting.

## User personas
- Motion designers / video editors working in Adobe After Effects
- Studios sharing preset libraries across mixed AE versions
- Freelancers dealing with legacy client projects across CS6→2025

## Core requirements (static)
- Marketing site at `/` — hero, how-it-works, features, updates, pricing, FAQ, newsletter, footer
- Converter app at `/app` — drag-drop upload, target picker (AE version + OS), safe/strict toggle, compatibility report, downloadable .zip package
- Sidebar-nav SaaS shell with Converter · Library · History · Rules · Settings
- First-run setup modal
- Hand-curated rules engine across expression engines, layer styles, essential graphics, roto brush, etc.
- Anonymous per-browser session (localStorage X-Session-Id) scopes Library/History/Settings
- Optional JWT auth (Bearer in localStorage) — additive, doesn't remove anon flow

## What's been implemented (2026-02)
### 2026-02-09 · Phases 1–3 MVP
- Marketing page with hero, 3-step how-it-works, features, updates timeline, 3-tier pricing (Free/Pro/Team), FAQ, CTA band, footer with Mongo-backed newsletter signup
- App shell with sidebar nav, top status bar, first-run modal that persists settings via `PUT /api/settings`
- Converter with drag-drop uploader (.ffx, .xml, .json batch), 4 preloaded sample presets, target AE version/OS picker, safe/strict toggle, live categorized report drawer (compatible / flagged / fallback / manual_todo), download .zip package button, "save to library" action
- Library, History (with re-download + delete), Rules Inspector (category + search filter over 20 rules), Settings pages
- FastAPI backend endpoints: `/api/rules`, `/api/samples`, `/api/samples/{id}`, `/api/ae-versions`, `/api/convert`, `/api/convert/{id}/package`, `/api/history`, `/api/presets` (CRUD), `/api/settings`, `/api/newsletter`
- 20 hand-curated compatibility rules covering expression engines, layer styles, essential graphics, per-character 3D, roto brush 2, GPU particles, OS-specific fonts, .mogrt, responsive design, etc.
- Zip package builder: original preset + report.json + notes.md + README.txt

### 2026-02-09 · JWT auth (additive)
- Backend `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`, `/api/auth/forgot-password`, `/api/auth/reset-password`
- bcrypt hashing, HS256 JWT (24h), brute-force lockout (5 attempts / 15 min per ip+email)
- Admin auto-seed on startup (admin@saturn.dev / Saturn2026!)
- Mongo indexes: users.email unique, login_attempts.identifier, password_reset_tokens.expires_at TTL
- Frontend AuthContext + `/login` + `/register` pages, header + app-shell topbar surface user email + sign-out
- Anon session still works; auth is additive

## Prioritized backlog
### P0
- Wire user_id scoping into Library/History/Settings when logged in (currently still anon-scoped)
- Rate-limit `/api/newsletter` and `/api/auth/forgot-password`
### P1 (deferred phases 4–5)
- Cloud library sync when user is signed in (merge anon-session data into user account on first login)
- Stripe billing for Pro/Team plans (test key already available in pod env)
- Resend for newsletter + password reset emails (currently: reset link is logged to backend console)
- Team rule profiles (shared rulesets per organization)
### P2
- .mogrt export target
- Deeper `.ffx` binary metadata parser (phase 2 investigation)
- Public API for studios (rate-limited, scoped API keys)
- Import/export rule sets (JSON) via Rules panel
