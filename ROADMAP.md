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

### Phase 2 follow-ups (not fixed — need a decision, not just a patch)

These are real gaps but each is a bigger lift than the Month Pillar fix, so they're logged here rather than silently changed:

- **Solar-term boundaries (incl. Li Chun / Year Pillar cutover) use fixed calendar-day thresholds**, but real solar terms drift ±1-2 days year to year. Affects a few percent of birthdates (anyone born within ~1-2 days of any of the 12 month boundaries, not just New Year). Fixing this properly means computing actual solar ecliptic longitude crossings per year instead of a lookup table — a real (if bounded) astronomy task, not a one-line fix.
- **I Ching hexagram database is 14/64 complete.** ~78% of hexagram draws currently fall back to generic placeholder text mislabeled as "Hexagram #1." Needs the other 50 hexagrams' name/judgement text authored — a content task, not code.
- **Decide how much Western Astrology fidelity this app actually needs.** If it's staying "decorative/approximate" as originally scoped, it's arguably fine as-is (and should be labeled as such in the UI so it doesn't read as authoritative). If real accuracy matters, this section needs a proper ephemeris library (e.g. Swiss Ephemeris bindings) rather than hand-rolled truncated series — a meaningfully bigger change than anything else in this audit.

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

Phases 1–4 are all done. Four bugs found and fixed (first-run crash, Month Pillar miscalculation, Custom School wiring, mobile overflow across all 8 views), and the dead React/Tailwind scaffold is gone with a clean lint pass. What's left is **Phase 0** (deployment target) and **Phase 5** (API key + actually deploying), which are paused per current direction — see the "opening caveats" recap. Phase 2's three follow-ups (solar-term precision, hexagram database, astrology fidelity) and Phase 6 (polish/README/PWA) remain open, larger-scope items beyond this pass.
