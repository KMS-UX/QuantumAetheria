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

This is a **vanilla HTML/CSS/JS SPA** (`index.html` → `<script type="module" src="/app.js">`), not a React app, despite React/Tailwind being in `package.json` and `vite.config.ts`.

### Dead weight: unused React scaffold
`src/App.tsx`, `src/main.tsx`, `src/index.css` are leftover AI-Studio template boilerplate. `App.tsx` is a literal empty `<div></div>` — nothing imports or mounts it, and `index.html` never references `/src/main.tsx`. `vite.config.ts` still loads the `react()` and `tailwindcss()` plugins for a tree that's never used. `package.json`'s `name` is still `"react-example"`. None of this is load-bearing; it's cruft from the initial template.

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

**Known limitations (not fixed — flagged for a decision, see ROADMAP.md Phase 2 follow-ups):**
1. **Year Pillar / solar-term boundaries use fixed calendar-day thresholds** (e.g. Li Chun hardcoded to Feb 4) rather than real solar-longitude astronomy. Actual Li Chun falls on Feb 3, 4, or 5 depending on the year (confirmed via research) — same ±1 day drift applies to all 12 month-boundary solar terms, not just Li Chun. Affects birthdates within ~1-2 days of any solar term boundary (roughly a few percent of all birthdates).
2. **I Ching hexagram database is incomplete: only 14 of 64 traditional hexagrams have real name/judgement text.** Confirmed by code inspection and a 20,000-draw simulation — only ~21.7% of random hexagram draws hit a real database entry; the other ~78% silently fall back to a generic placeholder that's mislabeled as "Hexagram #1 (Qian)" regardless of what was actually drawn. This is a content gap, not a math bug — needs the other 50 hexagrams authored.
3. **Western astrology beyond the Sun is low-fidelity, as originally disclosed.** Sun position uses a legitimate low-precision ephemeris (~0.01–0.02° accurate). Moon position uses only 3 truncated periodic terms (can be several degrees off). Mercury/Venus/Mars/Jupiter/Saturn positions are not real ephemeris at all — sinusoidal fudges anchored to the Sun's longitude. House placements (`"10th House"` for Sun, `"1st House"` for Moon, etc.) are hardcoded, not computed from the Ascendant — so "house" data is decorative regardless of actual birth time. This matches the original Stage 2 spec's own "Placeholder... approximation" framing, so it's a known and disclosed gap, not a hidden defect — but worth being explicit about before presenting it as authoritative to a user.
4. **Minor:** True Solar Time's day-of-year calculation goes through JS `Date` objects using the *device's own* local timezone rather than the birth city's timezone. Because the code only ever adds/subtracts milliseconds and reads back with matching local getters, this is self-consistent in the common case — but could drift by up to a day right at a DST transition, depending on what timezone the machine running the browser is set to. Low practical impact, worth a note.

## Known gaps / risks

1. **Deployment target undecided**, with a real constraint to keep in mind: recent git history shows a `CNAME` file was created, updated, then deleted (GitHub Pages custom-domain flow), but this app needs a live Node process (`server.ts`, Express, Gemini SDK) for its AI endpoints — **GitHub Pages only serves static files and cannot run `server.ts`.** `.env.example` and `metadata.json` (`MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`) point instead to AI Studio's own Cloud Run publishing flow. Stated end goal is personal use as a web app and/or Android app — see [ROADMAP.md](ROADMAP.md) Phase 0 for the path that implies.
2. **No `GEMINI_API_KEY` configured locally** (`.env.example` only). App degrades gracefully without one (rich static fallback text, confirmed working), but the "real" AI Consultation Hub experience with actual Gemini responses is unverified.
3. **No tests, no CI, no lint run.** `npm run lint` (`tsc --noEmit`) has not been executed against `server.ts`.
4. **Unused React/Tailwind scaffold** adds confusion and unused dependencies (see above).

## What's solid

- Feature breadth matches the original spec closely, including details like exact hex codes for BaZi element colors and the tone/persona system for the AI hub.
- The API layer has real resilience built in: webhook vs. Gemini vs. offline fallback, all three paths implemented, not stubbed.
- `.gitignore` correctly excludes `.env*`, `node_modules/`, `dist/` — no secrets appear to be committed.
