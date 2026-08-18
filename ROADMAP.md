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

## Phase 3 — Feature QA pass per module

Walk each module against its original stage requirements (matrix in PROJECT_STATUS.md) and note deltas:

- Dashboard: energy gauge, skeleton loaders while awaiting API, daily card-pull widget
- Foundation/Projections: BaZi grid + Zi Wei 12-palace grid render correctly at different viewport sizes
- Rituals: Tarot spread, rune cast, I Ching line-building all functionally interactive (not just visual)
- Oneiromancy: dream CRUD + search/filter actually persists and queries `localStorage`
- Chat: school toggles and tone selector actually change what gets sent to `/api/divination/consult`
- Custom School Manager: created schools actually get injected into the router/consultation context, not just saved and ignored

## Phase 4 — Cleanup

1. Decide: keep or delete the dead `src/App.tsx` / `main.tsx` / `index.css` React scaffold. If keeping the vanilla-JS architecture (recommended — it's what's actually built and working), delete the scaffold and strip `react`, `react-dom`, `@vitejs/plugin-react`, `lucide-react`, `@tailwindcss/vite`, `tailwindcss`, `autoprefixer` from `package.json` and the `react()`/`tailwindcss()` plugins from `vite.config.ts`.
2. Rename `package.json`'s `name` from `"react-example"` to something real (e.g. `"aetheria"`).
3. Run `npm run lint` (`tsc --noEmit`) and fix any `server.ts` type errors.

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

Phases 1 and 2 are both done, each turning up one confirmed, fixed bug (a first-run crash, and a systematic Month Pillar miscalculation). Next up is **Phase 3** (per-module feature QA) — walking Dashboard, Foundation/Projections, Rituals, Oneiromancy, Chat, and Custom Schools against their original requirements to see what else doesn't quite work as intended. The three Phase 2 follow-ups above (solar-term precision, hexagram database, astrology fidelity) are separate, larger decisions that don't block that.
