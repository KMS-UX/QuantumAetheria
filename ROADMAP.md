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
- Add a PWA manifest + app icons + basic service worker.

## Phase 7 — Android App (Capacitor + routable AI backend) — 🔄 in progress (started 2026-08-19)

**Decision (2026-08-19):** Android is the first-choice platform, ahead of general web deployment (Phase 5 paused). Architecture chosen: a **routable AI backend** — on-device **Gemma 4 E4B** (via Google AI Edge / LiteRT-LM) for the Android app so sensitive readings never leave the device, falling back to the existing cloud endpoints (`server.ts`'s `/api/divination/*`) for the web version or when on-device isn't available. Rationale for on-device over relying on Gemini Nano/AICore: AICore's device support is OEM-gated to specific flagships (Pixel 9/10, Galaxy S25/S26, select others) and wasn't confirmed for the target device (REDMAGIC 11S Pro / Snapdragon 8 Elite Gen 5); bundling Gemma 4 directly via LiteRT-LM works on any sufficiently capable device regardless of OEM support. Note this doesn't require the on-device model to do any *calculation* — BaZi/astrology/I Ching math is already deterministic in `calc_engine.js`; the LLM's role is purely narrative synthesis around already-correct numbers, which a small model handles fine.

_Correction (2026-08-19): initial planning here said "Gemma 3n," based on stale (pre-cutoff) knowledge — Gemma 4 (released April 2026, after that cutoff) is the actual current generation and what the user originally named. Verified directly: `litert-community/gemma-4-E4B-it-litert-lm` on Hugging Face is **Apache 2.0, fully public, no gating** (confirmed by successfully fetching its file listing with no login wall) — a meaningful improvement over earlier Gemma generations' gated, custom-license HF access, which would have blocked a simple in-app download. Main model file: `gemma-4-E4B-it.litertlm`, 3.66 GB._

**Sub-phases:**
1. **Capacitor scaffolding** — ✅ done. Verified `npm run build` produces a valid `dist/` (bundled `index.html` + hashed assets). Added `@capacitor/core`, `@capacitor/android`, `@capacitor/cli`. Created [capacitor.config.ts](capacitor.config.ts) (`appId: com.aetheria.app`). Ran `npx cap add android` — generated `android/` with `MainActivity`, `INTERNET` permission already present, minSdk 24 / compileSdk 36, web assets correctly copied to `android/app/src/main/assets/public`.
2. **Android SDK setup** — ✅ done. Android Studio's Welcome screen landed directly on New/Open/Clone rather than the classic SDK wizard (normal for current Studio versions — SDK components get pulled in during Gradle sync instead). Ran `npx cap open android` to launch Studio pointed at the already-generated project (**not** a new project, which would've been a disconnected generic template). Gradle sync completed with no errors; `android/local.properties` now correctly points `sdk.dir` at `%LOCALAPPDATA%\Android\Sdk`.
3. **Verified Gradle build** — ✅ done. `./gradlew assembleDebug` initially failed with a locale-garbled "release 21 not supported" error — root cause: `@capacitor/android`'s library module requires Java 21 (`sourceCompatibility`/`targetCompatibility`), but this machine's default `JAVA_HOME` resolves to a Java 17 JDK (Android Studio itself is unaffected since it uses its own bundled JBR, Java 25, only CLI builds hit this). Fixed by pinning `org.gradle.java.home` in `android/gradle.properties` to Android Studio's bundled JBR path, so `./gradlew` works from the terminal without manually exporting `JAVA_HOME` every time. Re-verified clean: `BUILD SUCCESSFUL`, `android/app/build/outputs/apk/debug/app-debug.apk` produced.
4. **On-device LLM bridge** — ✅ done. Added [`android/app/src/main/java/com/aetheria/app/AetheriaLLMPlugin.kt`](android/app/src/main/java/com/aetheria/app/AetheriaLLMPlugin.kt), a Capacitor plugin (`@CapacitorPlugin(name = "AetheriaLLM")`) directly in the `:app` module (per the skill guidance above — no separate module/plugin package for a single class). Exposes three JS-callable methods: `isModelReady()`, `downloadModel()` (streams the 3.66GB file to `filesDir/models/`, reporting `downloadProgress` events; atomic via a `.part` temp file renamed on success), and `generate({prompt})` (lazily initializes the LiteRT-LM `Engine` off the main thread behind a `Mutex` to avoid a double-init race, then runs a fresh `Conversation` per call — stateless per-request, matching how `server.ts`'s cloud endpoints already work, so the routing layer in step 5 could swap between them transparently). Registered in `MainActivity.java` via `registerPlugin(AetheriaLLMPlugin.class)` before `super.onCreate()`.
   - **Two real build issues hit and fixed, both toolchain version mismatches, not code bugs:**
     - Adding the Kotlin Gradle Plugin (needed to compile the plugin) failed with `Unsupported class file major version 69` — Gradle 8.14.3's own daemon can't run on JDK 25 (Android Studio's bundled JBR, pinned in Phase 7.3). Root cause confirmed via research: **Gradle 9.1.0 is the first version with JDK 25 host support.** Fixed by bumping the Gradle wrapper to 9.1.0.
     - After that, compiling against the real `litertlm-android` library (resolved to `0.16.1` at sync time) failed: its classes were compiled with **Kotlin 2.3.0** metadata, newer than the Kotlin Gradle Plugin version (2.1.0) I'd started with. Bumped to Kotlin 2.3.0 to match.
   - Final verified build: `BUILD SUCCESSFUL`, and the native `liblitertlm_jni.so` correctly packaged into the APK (a benign "unable to strip" warning on that one library, not an error — expected for a debug build).
5. **Routing layer** — ✅ done. `api_service.js` now imports `registerPlugin` from `@capacitor/core` and checks `isOnDevicePlatform()` (native + Android) at the top of `consult()`; if on-device is available *and* the model is already downloaded, it routes through `callOnDeviceBackend()` first, catching any failure and falling through to the existing webhook/Gemini chain unchanged. On-device responses carry `provider: 'on-device'` / `modelUsed: 'Gemma 4 E4B (on-device)'`, matching the existing response shape `chat.js` already knows how to render — no changes needed there. Added a new "On-Device AI" settings card (hidden entirely on web/desktop via `isOnDevicePlatform()`, confirmed in-browser) with a status line and a download button with a live progress bar wired to the plugin's `downloadProgress` events. **Deliberately not automatic**: the 3.66GB download only starts when the user taps the button — never silently triggered mid-consultation, to avoid surprising anyone with mobile data/storage usage.
   - Verified: web build unaffected (`window.Capacitor` exists as the web-fallback shim `@capacitor/core` always provides, but `isNativePlatform()` correctly reports `false`, so the card stays hidden and behavior is identical to before), full Android Gradle build still succeeds after `npx cap sync android` picked up the new web assets and plugin registration.
6. **Testing/tuning** — blocked on hardware, not started. Requires actually running the built APK on a device or emulator, downloading the real 3.66GB model, and confirming inference genuinely works and reads reasonably (response quality, latency, memory headroom on the target REDMAGIC 11S Pro). This can't be done from this environment — needs the user's device or an Android Studio emulator.

---

### Suggested immediate next step

Phases 1–4 are all done, all three Phase 2 follow-ups are done, and Phase 7's entire software build is now done too — sub-phases 1 through 5 (Capacitor scaffolding, SDK setup, verified Gradle build, the on-device LLM plugin, and the JS routing layer) are all complete and the app builds cleanly end-to-end. What's left in Phase 7 is sub-phase 6: **actually running it** — install the APK on a device or emulator, download the real model via the new Settings card, and confirm on-device inference genuinely works. That step needs hardware this environment doesn't have, so it's the natural handoff point. Phase 5 (general web deploy) and Phase 6 (polish) remain paused behind Phase 7 per current direction.
