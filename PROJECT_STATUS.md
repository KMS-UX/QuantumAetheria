# Aetheria — Project Status

_Last audited: 2026-08-18_

## What this project is

**Aetheria** is a multi-school divination and fate-analysis web app integrating Western Astrology, BaZi (Four Pillars), Zi Wei Dou Shu, Tarot, Runes, I Ching, Oneiromancy, and a Custom School Manager, with an AI Consultation Hub backed by Gemini.

It was originally scaffolded and built inside **Google AI Studio** (see `metadata.json`, the AI-Studio-specific comments in `.env.example` and `vite.config.ts`). [`fortune_telling_platform_prompts.md`](fortune_telling_platform_prompts.md) is the 7-stage prompt script that was used to generate it.

## Headline finding

**All 7 stages in the prompting guide have already been executed.** This is not a "build from scratch" project anymore — every target file the guide calls for exists, is substantial (14–80KB), and its header comments confirm it implements the corresponding stage's requirements in full, including an extra `projections.js` module the guide didn't explicitly name. The remaining work is verification, correctness auditing, cleanup, and shipping — not authoring new modules from the guide.

## Architecture as it actually stands

```
index.html  ──loads──▶  app.js (state router, vanilla ES modules)
                          │
     ┌────────────────────┼─────────────────────────────────────┐
     ▼                    ▼                                     ▼
calc_engine.js      dashboard.js / foundation.js /        api_service.js
(True Solar Time,   projections.js / rituals.js /         (client-side dispatcher:
 BaZi, I Ching      oneiromancy.js / chat.js /              Gemini backend or
 math — offline)    custom_school.js                        Dify/n8n webhook,
                     (per-section UI + logic)                offline fallback)
                                                                    │
                                                                    ▼
                                                          server.ts (Express + Vite
                                                          middleware, 3 Gemini
                                                          endpoints, graceful
                                                          no-API-key fallback)
```

This is a **vanilla HTML/CSS/JS SPA** (`index.html` → `<script type="module" src="/app.js">`), not a React app.

### Dead weight: unused React scaffold — removed in Phase 4
`src/App.tsx`, `src/main.tsx`, `src/index.css` were leftover AI-Studio template boilerplate (`App.tsx` was a literal empty `<div></div>`, never imported or mounted — `index.html` always loaded `/app.js` directly). Deleted along with the now-unused `react`, `react-dom`, `@vitejs/plugin-react`, `lucide-react`, `@tailwindcss/vite`, `tailwindcss`, `autoprefixer`, and `motion` dependencies, the `react()`/`tailwindcss()` Vite plugins, and the inert `"jsx": "react-jsx"` tsconfig option. `package.json`'s name changed from `"react-example"` to `"aetheria"`. See ROADMAP.md Phase 4 for the full list.

## Completion matrix vs. the 7-stage guide

| Stage | Target files | Status |
|---|---|---|
| 1 — Skeleton, theme, nav | `index.html`, `styles.css`, `app.js` | ✅ Present, substantial (82KB / 66KB / 48KB) |
| 2 — Profile & calc engine | `calc_engine.js` | ✅ Present (30KB) — True Solar Time, BaZi pillars, sexagenary cycle, solar terms |
| 3 — Dashboard | `dashboard.js` | ✅ Present (18KB) — timeframe switcher, energy gauge, skeleton loaders |
| 4 — Foundation & mid/long-term | `foundation.js`, `projections.js` | ✅ Present (31KB, 17KB) |
| 5 — Rituals & dreams | `rituals.js`, `oneiromancy.js` | ✅ Present (40KB, 15KB) |
| 6 — AI Consultation Hub | `chat.js` | ✅ Present (29KB) |
| 7 — Custom schools & API | `custom_school.js`, `api_service.js` | ✅ Present (21KB, 10KB) |
| — | `server.ts` | ✅ Bonus: Express backend with 3 Gemini endpoints (`/api/divination/consult`, `/dream-interpret`, `/daily-insights`), each with a rich offline fallback when `GEMINI_API_KEY` is unset |

## Verification log

- **2026-08-18** — `npm install` (214 packages, 0 vulnerabilities). Ran `npm run dev`, clicked through all 8 nav sections in-browser with a clean-storage first-run profile.
  - Found and fixed a real first-run crash: `chat.js`'s `ChatEngine.buildContextPayload()` read `natalPayload.sun` where `natalPayload` could be `null` — because `setupAIConsultation()` runs in `app.js`'s init sequence *before* `recalculateAllSystems()` populates `AetheriaState.natalPayload` on a fresh browser with no saved profile. Fixed with a null-coalescing default (`(window.AetheriaState && window.AetheriaState.natalPayload) || {}`). Verified fix: `AetheriaState.natalPayload` now populates correctly and all 8 nav sections (including AI Consultation Hub, the crash site) render with zero console errors.
  - `GET /api/health` responds `{ status: "ok", aiReady: false }` as expected with no API key set.

## Calculation correctness audit (2026-08-18)

Verified `calc_engine.js` by running it directly in Node against known reference dates (cross-checked via web search against independent BaZi calculator sites), not just reading the math and hoping.

**Confirmed correct:**
- True Solar Time / Equation of Time formula — standard, widely-used approximation, correct.
- Longitude solar-time correction — correct direction and magnitude.
- **Day Pillar** sexagenary stem/branch (Julian Day based) — matched two independent external references exactly (1900-01-31 = 甲辰, 2024-02-10 = 甲辰).
- Five Tigers rule (Month Stem from Year Stem) — verified correct for all 5 year-stem groups.
- Five Rats rule (Hour Stem from Day Stem) — verified correct for all 5 day-stem groups.
- Hour Branch boundaries — verified correct at all 12 two-hour windows.
- Ten Gods (十神) element-relationship logic — verified correct against the five-element generating/controlling cycle.
- I Ching 3-coin toss probability distribution — correct for the stated method (1/8, 3/8, 3/8, 1/8 for 6/7/8/9).

**Bug found and fixed:** the Month Pillar branch (`getSolarMonthBranchIndex`) was systematically off by exactly one solar month — **100% of the time, not an edge case.** Verified against the known CNY-2024 reference (expected 丙寅 month, code produced 丁卯) and against 4 more independently-derived boundary dates spanning the year; all 5 failed the same way before the fix and matched after. This affected the Month Pillar's stem *and* branch on every single BaZi calculation the app has ever produced. Fixed in `calc_engine.js`'s `getSolarMonthBranchIndex`; re-verified against the CNY-2024 reference (now correctly produces 甲辰-丙寅-甲辰 for year/month/day) and in a live browser run.

**Minor unresolved:** True Solar Time's day-of-year calculation goes through JS `Date` objects using the *device's own* local timezone rather than the birth city's timezone. Because the code only ever adds/subtracts milliseconds and reads back with matching local getters, this is self-consistent in the common case — but could drift by up to a day right at a DST transition, depending on what timezone the machine running the browser is set to. Low practical impact, not fixed.

## Phase 2 follow-ups — all fixed and verified (2026-08-18)

The three gaps identified above were tackled properly rather than left as disclosed limitations. Full technical detail in [ROADMAP.md](ROADMAP.md) Phase 2 follow-ups; summary:

1. **Solar-term boundaries are now computed astronomically.** Added a real solar-longitude solver (`getSolarEclipticLongitude`, `findSolarTermJD`) and rewrote both the Year Pillar's Li Chun cutover and the Month Pillar branch to derive from the sun's actual position at the birth moment, not a fixed calendar-day table. Verified against real Li Chun dates across 8 years, and confirmed the key case this was built for: two births on the same calendar day, on either side of the real Li Chun moment, now correctly receive different Year Pillars (previously impossible).
2. **I Ching hexagram database is complete — and a second, worse copy of the same bug was found and fixed along the way.** All 64 hexagrams authored and verified in `calc_engine.js` (cross-checked against a researched King Wen table and the Unicode Consortium's own character names). While verifying live in the Rituals UI, discovered `rituals.js` maintains an entirely separate, even-more-incomplete (12/64) hexagram database that silently mislabeled undatabased results as "Hexagram 1" — reproduced live, then fixed by authoring a second, cross-validated 64-entry table matching `rituals.js`'s own richer schema. Both files now hit 100% real-entry coverage (verified via 5,000+ trial simulations), up from ~22% and ~19% respectively.
3. **Western Astrology now uses real ephemeris for Moon, all 5 visible planets, and houses.** Moon upgraded from 3 to 13 periodic terms (~0.05° accuracy). Mercury/Venus/Mars/Jupiter/Saturn — previously not real orbital mechanics at all, just a sine wave added to the Sun's longitude — replaced with genuine heliocentric Kepler-orbit elements (Paul Schlyter's well-documented low-precision algorithm). House placements — previously hardcoded regardless of birth time — now computed via a real Equal House system from the actual Ascendant. Verified against a published ephemeris for 2000-01-01: Mercury and Venus matched to the arcminute, everything else within a fraction of a degree.

## Feature QA audit (2026-08-18)

Walked Rituals, Oneiromancy, Dashboard, Custom School Manager, and the Foundation grids' mobile responsiveness against their original requirements — full detail in [ROADMAP.md](ROADMAP.md) Phase 3. Summary:

**Solid, no issues found:** Rituals (Tarot flip, Rune cast, I Ching line-building are all genuinely interactive, verified via real clicks and DOM state changes, not just visual). Oneiromancy (dream CRUD, search, tag filtering all correctly persist to and read from `localStorage`). Dashboard's timeframe switch (verified exactly one real API call per switch via a `window.fetch` instrument — an apparent double-call in the network log was just the log's request/response pairing).

**Two bugs found — both fixed (2026-08-18):**
1. **Custom School Manager → AI Consultation Hub wiring was broken, now fixed.** Selecting a custom school as the active AI specialist used to visually highlight the button without actually switching anything (`ChatEngine.activeAgent` never updated, due to a stale one-time DOM snapshot plus a guard that blocked unrecognized agent IDs). Fixed via a new `ChatEngine.getActiveAgentDisplay()` resolver used everywhere the active agent's display info is read, plus having the custom-school button handler directly set `ChatEngine.activeAgent` and drive the same greeting/status/context-inspector updates the built-in switch path uses. Also fixed a silent no-op (`custom_school.js` was calling a `ChatEngine.addSystemMessage` method that doesn't exist) and a related stale-snapshot bug that left two agent buttons simultaneously marked "active" when switching from a custom school back to a built-in one. Verified live in both directions with zero new console errors. Full detail in ROADMAP.md Phase 3.
2. **Dashboard (and, once traced further, three other views) overflowed horizontally on mobile — now fixed across all 8 views.** Root causes spanned several unrelated CSS gaps: hard multi-column grids with no mobile override (Dashboard's `.school-summary-grid`, `.hero-action-advice-grid`, `.ritual-widget-layout`), forced-width header elements not hidden on mobile (`.tst-clock-box`, button text labels), and two more views (`AI Consultation Hub`, `Foundation`) with their own independent overflow sources (`.view-actions-group` missing `flex-wrap`, `.sub-tabs-bar` missing a scroll/wrap fallback) found while sweeping the rest of the app after the first fix. All fixes are scoped to the existing mobile breakpoint in `styles.css`. Verified with a full 8-view sweep at 375px: every view now measures `scrollWidth: 370`, comfortably within viewport, with zero unclipped overflowing elements — and desktop width re-checked for regressions.

## Mobile app in progress (started 2026-08-19)

**Decision:** Android is the first-choice platform (ahead of general web deployment), not published via AI Studio (privacy preference — personal birth/dream data). Architecture: a **routable AI backend** — on-device **Gemma 4 E4B** (LiteRT-LM; Apache 2.0, ungated on Hugging Face, downloaded on first launch — see ROADMAP.md for the license/model verification, including a correction of an earlier "Gemma 3n" assumption) on Android so sensitive readings never leave the device, cloud endpoints as fallback for web / when on-device isn't available. Full detail and live sub-phase tracking in [ROADMAP.md](ROADMAP.md) Phase 7. Status: Capacitor scaffolding, SDK setup, and a verified `assembleDebug` build are all done (`android/app/build/outputs/apk/debug/app-debug.apk` builds clean from the command line, after fixing a Java 17 vs. required Java 21 mismatch — see ROADMAP.md for the fix). On-device LLM plugin and routing layer not yet started.

## Known gaps / risks

1. **General web deployment target still undecided** (separate from the Android decision above — Phase 5 is paused behind Phase 7). Real constraint either way: recent git history shows a `CNAME` file was created, updated, then deleted (GitHub Pages custom-domain flow), but this app needs a live Node process (`server.ts`, Express, Gemini SDK) for its cloud AI endpoints — **GitHub Pages only serves static files and cannot run `server.ts`.** AI Studio's Cloud Run publish flow is available but was ruled out for personal-data privacy reasons; a self-managed host (Render, Oracle Free Tier VM, or direct `gcloud run deploy` outside AI Studio's pipeline) remains the live options.
2. **No `GEMINI_API_KEY` configured locally** (`.env.example` only). App degrades gracefully without one (rich static fallback text, confirmed working), but the "real" AI Consultation Hub experience with actual Gemini responses is unverified.
3. ~~No tests, no CI, no lint run~~ — resolved in Phase 4: `npm run lint` (`tsc --noEmit`) now passes clean. Still no automated test suite.
4. ~~Unused React/Tailwind scaffold~~ — resolved in Phase 4: deleted, dependencies stripped, see below.

## What's solid

- Feature breadth matches the original spec closely, including details like exact hex codes for BaZi element colors and the tone/persona system for the AI hub.
- The API layer has real resilience built in: webhook vs. Gemini vs. offline fallback, all three paths implemented, not stubbed.
- `.gitignore` correctly excludes `.env*`, `node_modules/`, `dist/` — no secrets appear to be committed.
