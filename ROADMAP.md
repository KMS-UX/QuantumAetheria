# Aetheria — Forward Workflow

_Companion to [PROJECT_STATUS.md](PROJECT_STATUS.md). Nothing here is locked — reorder or drop phases as feasibility dictates._

The original [`fortune_telling_platform_prompts.md`](fortune_telling_platform_prompts.md) guide assumed we were building from zero. We're not — all 7 stages already exist in code. So this roadmap replaces "generate the next stage" with **verify → correct → clean up → ship**.

## Phase 0 — Deployment target (deferred, goal noted)

Decision deferred for now. Stated end goal: **personal use, as a web app and/or an Android app.** That goal shapes later phases even before the specific host is picked:

- **A. AI Studio / Cloud Run** (what the code is currently wired for — `.env.example`, `metadata.json` both point here). Lowest effort, matches `SERVER_SIDE_GEMINI_API` capability already declared. Good enough as the "web app" half of the goal on its own.
- **B. Node-capable host of your choice** (Render, Fly.io, Railway, a VPS) running `npm run build && npm start`. Custom domain works fine here — this is where a `CNAME`-style custom domain setup would actually apply, just not via GitHub Pages.
- **C. GitHub Pages** (implied by the deleted `CNAME` history) — **not compatible as-is**, since Pages only serves static files and can't run the Express/Gemini backend. Only viable if the AI features are re-architected to call Gemini directly from the browser (exposing the API key client-side — not recommended) or dropped in favor of the offline fallback becoming the permanent behavior.

**Android path, given personal-use scope:** no need for a native rewrite. Two realistic options once A or B is hosting the app:
- **PWA + Capacitor wrap**: turn the existing vanilla SPA into an installable PWA (manifest + service worker) and wrap it with [Capacitor](https://capacitorjs.com/) to produce a real, sideloadable APK. The whole app is already just HTML/CSS/JS, so this needs no framework rewrite — just a manifest, an icon set, and a thin Capacitor shell pointed at the hosted URL (or the bundled static assets).
- **TWA (Trusted Web Activity)**: if the web app ends up hosted at a stable HTTPS URL, a TWA is an even thinner wrapper (Play-Store-installable, but overkill for personal sideloading).

This will get revisited once a host is picked — flagging now so Phase 6 (polish) can include "add PWA manifest + icons" instead of it being a surprise later.

## Phase 1 — Local setup & smoke test ✅ done (2026-08-18)

1. ~~`npm install`~~ — done, 214 packages, 0 vulnerabilities.
2. ~~`npm run dev`~~ — done, runs clean.
3. ~~Click through every nav item~~ — done. All 8 sections render with zero console errors as of the fix below.
4. Fill out the profile modal with a real birth date/time/location and confirm the natal payload computes and the header updates — **still to do** (only tested with the deterministic default profile so far).
5. ~~Hit `GET /api/health`~~ — confirmed `aiReady: false`, offline fallback text confirmed present in Dashboard.

**Bug found & fixed:** first-run crash in `chat.js` (`ChatEngine.buildContextPayload()` dereferenced a `null` `natalPayload` because AI Consultation initializes before natal data is computed on a fresh browser). See PROJECT_STATUS.md verification log for details. This is exactly the kind of thing this phase exists to catch — worth re-running this phase's checklist after each subsequent phase's changes, not just once.

## Phase 2 — Calculation correctness audit ✅ done (2026-08-18)

`calc_engine.js` is the one place where "looks plausible" isn't good enough — it's presented to users as authoritative. Full findings in PROJECT_STATUS.md's "Calculation correctness audit" section; summary:

1. ~~Spot-check True Solar Time~~ — done, formula confirmed correct.
2. ~~Spot-check BaZi Four Pillars~~ — done, cross-checked against independent references. **Found and fixed a real bug: Month Pillar was off by exactly one solar month, 100% of the time** (not an edge case — every BaZi reading the app has ever produced had a wrong Month Pillar). Fixed and re-verified.
3. ~~Confirm I Ching coin-toss distribution~~ — done, confirmed correct for the stated 3-coin method.
4. ~~Decide on Western Astrology approximation~~ — audited in detail; Sun position is legitimate, Moon and outer planets are not real ephemeris, and "house" placements are hardcoded regardless of birth time. Decision on whether this is good enough to ship is still open — see Phase 2 follow-ups below.

### Phase 2 follow-ups — all three done (2026-08-18)

All three were tackled properly (real astronomy / real content / real orbital mechanics, not shortcuts). Full detail in PROJECT_STATUS.md's "Phase 2 follow-ups" section; summary:

**1. Solar-term boundaries — now computed astronomically, not looked up.** Added `getSolarEclipticLongitude()`, `findSolarTermJD()` (Newton's-method solver), and rewrote `getSolarMonthBranchIndex()` to derive the Month Pillar branch directly from the sun's real ecliptic longitude at the birth moment (a direct 30°-sector formula, no lookup table at all), and the Year Pillar's Li Chun cutover to compare the birth moment against the astronomically-solved Li Chun instant for that year. Verified against real published Li Chun dates for 8 different years (2021, 2022, 2023, 2024, 2025, 2026, 2027, 1960 — including the historically documented "1960 Li Chun was Feb 5" case), and — the key test this was built for — confirmed two births on the *same calendar day* either side of the actual Li Chun moment now correctly get different Year Pillars (2021-02-03 08:00 → 庚子/2020, 2021-02-03 23:30 → 辛丑/2021), which was structurally impossible under the old fixed-day rule.

**2. I Ching hexagram database — complete, in *two* places.** Authored and cross-verified all 64 hexagrams (binary key, Unicode symbol, judgement text) against a researched King Wen sequence table, verified the Unicode code-point ordering against the Unicode Consortium's own character names (U+4DC0 = "HEXAGRAM FOR THE CREATIVE HEAVEN" = #1, U+4DFF = "...BEFORE COMPLETION" = #64), and cross-checked the new 50 entries against the already-verified 14 with zero mismatches. **While verifying this live in the Rituals UI, found a second, worse copy of the same bug**: `rituals.js` has its own entirely separate `HEXAGRAM_DATABASE` (12/64, independent of `calc_engine.js`'s), with a fallback that silently mislabels any undatabased hexagram as "Hexagram 1: The Creative" regardless of the actual lines cast — reproduced this live (cast lines 7,8,6,7,9,8 → binary `100110` → displayed as hexagram 1 instead of the correct hexagram 17). Authored a second, richer 64-entry table matching `rituals.js`'s own classical Wilhelm/Baynes-style schema (judgment + image + theme + trigram names), cross-validated against the first table (zero mismatches across 52 entries), and verified live: the same cast now correctly renders "Hexagram 45: Gathering Together." A 5,000-trial simulation confirms 100% real-entry coverage in both files (up from ~22% and ~19% respectively).

**3. Western Astrology fidelity — Moon, 5 planets, and houses are now real ephemeris, not fudges.** Moon position upgraded from a 3-term to a 13-term truncated Meeus lunar series (~0.05° accuracy). Mercury/Venus/Mars/Jupiter/Saturn replaced entirely — the old code was `sunLongitude + arbitrary_amplitude * sin(arbitrary_rate * T)`, not real orbital mechanics at all — with genuine heliocentric Kepler-orbit elements (Paul Schlyter's well-documented low-precision algorithm: orbital elements → Kepler's-equation solve → heliocentric coordinates → combined with Earth's own heliocentric position → geocentric ecliptic longitude). House placements (previously hardcoded — Sun was always "10th House" regardless of actual birth time) now use a real Equal House system computed from the actual Ascendant. Verified against a published ephemeris for 2000-01-01 00:00 UT: Mercury and Venus matched to the arcminute exactly, Sun/Moon/Mars within 1 arcminute, Jupiter within 5, Saturn within 12 — versus tens of degrees of error possible under the old fudge. Stress-tested across dates from 1950 to 2050 with no crashes or invalid output.

## Phase 3 — Feature QA pass per module ✅ done (2026-08-18)

Walked each module against its original stage requirements. Full detail in PROJECT_STATUS.md's "Feature QA audit" section; summary:

- ~~Rituals~~ — done. Tarot 3-card spread shuffles and flips correctly (verified via real click, CSS class transitions confirmed), Rune casting renders on tab load, I Ching coin toss builds lines progressively with correct line-by-line status. All genuinely interactive, not decorative.
- ~~Oneiromancy~~ — done. Dream CRUD (create/read/delete), search, and tag filtering all correctly read/write `localStorage` and re-render. No issues found — this module is solid.
- ~~Dashboard~~ — done. Timeframe switch triggers exactly one real `/api/divination/daily-insights` call per click (an apparent "double-fetch" in the network log turned out to be the log's request/response pairing, not an actual duplicate — verified by instrumenting `window.fetch` directly).
- ~~Custom School Manager~~ — done. **Found a real bug**, see below.
- ~~Foundation/Projections responsive grids~~ — done for the specific BaZi/Zi Wei grids (both have proper mobile breakpoint overrides in `styles.css`). Widened into a broader mobile-layout check that **found a second real bug**, see below.

### Bugs found in Phase 3 — both fixed (2026-08-18)

**1. Custom School Manager → AI Chat wiring — fixed.**
Clicking a custom school's button visually highlighted it but `ChatEngine.activeAgent` never actually updated (root cause: a one-time DOM snapshot taken before the custom buttons existed, plus a guard that hard-blocked unrecognized agent IDs). Fixed by:
- Adding `ChatEngine.getActiveAgentDisplay()`, which resolves the active agent against the built-in `AGENTS` map first, then against `CustomSchoolManager.schools`, and only falls back to the synthesizer if neither matches. Replaced all 7 call sites that read `this.AGENTS[this.activeAgent]` directly (some without a fallback — `generateLocalFallback()` would have thrown on an undefined agent) to use this instead.
- `custom_school.js`'s button click handler now directly sets `window.ChatEngine.activeAgent = school.id`, calls the correctly-named `appendSystemStatus()` (it was calling a method, `addSystemMessage`, that doesn't exist on `ChatEngine` — a silent no-op that meant the "Switched Oracle Chamber to..." notice never appeared), appends the custom school's greeting, and refreshes the context inspector — matching what the built-in agent switch already does.
- Fixed a related stale-snapshot bug in `ChatEngine.setupAgentSelector()`: the "clear active class from all buttons" step used the same one-time snapshot, so switching from a custom school back to a built-in agent left both buttons visually active. Now uses a fresh query each click.

Verified live: `ChatEngine.activeAgent`, `buildContextPayload()`, and `generateLocalFallback()` (the previously-unguarded crash site) all now correctly reflect the custom school, in both directions (custom → built-in and built-in → custom), with zero new console errors.

**2. Mobile horizontal overflow — fixed across all 8 views.**
Traced and fixed one view at a time, verifying `document.body.scrollWidth` after each fix (with a page reload each time — `resize_window` needs one before computed styles reflect the new viewport):
- Dashboard: `.school-summary-grid` (hard 3-column) and `.hero-action-advice-grid` (hard 2-column) had no mobile override → collapsed to 1 column at ≤768px. The header's `.tst-clock-box` and the text labels on `.header-action-btn` were also forced-width contributors → hidden at mobile (icon-only buttons). The daily-ritual widget's `.ritual-widget-layout` (fixed 220px + 1fr grid) → collapsed to 1 column, centered.
- AI Consultation Hub: the real cause wasn't the quick-prompt chip strip (that's an intentional horizontal-scroll region and was already correctly clipping once traced through) — it was `.view-actions-group` (Inspect/Export/Clear buttons), which had no `flex-wrap` → added one. Also added `min-width: 0` to `.chat-chamber` and `.chat-quick-chips-list`, the standard fix for the flex/grid "child won't shrink below content width" gotcha, as defensive hardening even though they weren't the actual page-level cause here.
- Foundation: `.sub-tabs-bar` used `width: fit-content` with no wrap/scroll fallback → given `overflow-x: auto` at mobile, consistent with the chip-strip pattern.
All fixes are scoped to the existing `@media (max-width: 768px)` block in `styles.css` — nothing changed at tablet/desktop widths. Verified with a full 8-view sweep at 375px: every view now reports `scrollWidth: 370` (comfortably within the 375px viewport) and zero unclipped overflowing elements. Desktop rendering re-checked for regressions — none found.

## Phase 4 — Cleanup ✅ done (2026-08-18)

1. ~~Decide: keep or delete the dead React scaffold~~ — deleted `src/App.tsx`, `src/main.tsx`, `src/index.css` (the whole now-empty `src/` directory removed). Confirmed unused first: `index.html` loads `/app.js` directly, never `/src/main.tsx`; `App.tsx` was a literal empty `<div></div>`.
   - Stripped the now-dead dependencies from `package.json`: `react`, `react-dom`, `@vitejs/plugin-react`, `lucide-react`, `@tailwindcss/vite`, `tailwindcss`, `autoprefixer`. Also removed `motion` — grepped the whole codebase and confirmed it was never imported anywhere (the app's icons come from the Lucide CDN `<script>` tag in `index.html`, not the `lucide-react` package; all animation is plain CSS).
   - Removed the `react()`/`tailwindcss()` plugins from `vite.config.ts`, and the now-inert `"jsx": "react-jsx"` option from `tsconfig.json` (no `.tsx` files left to apply it to).
   - `npm install` re-run: 71 packages removed, 0 vulnerabilities.
2. ~~Rename `package.json`'s `name`~~ — done, `"react-example"` → `"aetheria"`.
3. ~~Run `npm run lint`~~ — done, `tsc --noEmit` passes clean, zero errors.

Re-ran the full smoke test after cleanup (`npm run dev`, all 8 nav sections, `natalPayload` computing correctly) to confirm nothing broke — clean, no new console errors.

## Phase 5 — API key & deploy

1. Provision a real `GEMINI_API_KEY`, confirm `/api/health` reports `aiReady: true`, and re-run the Phase 1 walkthrough with live AI responses.
2. Execute the Phase 0 deployment decision.
3. If a custom domain is wanted, redo the `CNAME` setup against whichever host was chosen in Phase 0 (not GitHub Pages, per that phase's finding).

## Phase 6 — Polish

- Add a real `README.md` (currently missing) covering setup, `.env` requirements, and architecture, so `PROJECT_STATUS.md` doesn't have to double as onboarding docs.
- Basic error-state and empty-state pass across modules.
- Optional: light automated tests around `calc_engine.js` pure functions, since those are the highest-risk-of-silent-wrongness code in the app.
- Add a PWA manifest + app icons + basic service worker, in prep for the Capacitor Android wrap noted in Phase 0.

---

### Suggested immediate next step

Phases 1–4 are all done, and all three Phase 2 follow-ups are now done too — every calculation-correctness gap identified in this audit has been fixed and verified, not just logged. `calc_engine.js` and `rituals.js` are both meaningfully more astronomically legitimate than when this audit started. What's left, per current direction, is **Phase 0** (deployment target) and **Phase 5** (API key + actually deploying) — see the "opening caveats" recap. Phase 6 (polish/README/PWA) remains open as a smaller, lower-urgency item beyond this pass.
