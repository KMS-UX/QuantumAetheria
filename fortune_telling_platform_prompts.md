# Step-by-Step Prompting Guide: Multi-School Fortune Telling & Fate Analysis Platform

This document provides a complete, staged prompting roadmap for building your web application using Google AI Studio, Cursor, Claude Code, Windsurf, or any LLM coding assistant. 

The application integrates **Four Pillars (BaZi)**, **Zi Wei Dou Shu**, **Western Astrology**, **Occult / Witchcraft**, **Tarot**, **Runes**, **I Ching**, **Oneiromancy (Dream Analysis)**, and a **Custom School Manager**.

---

## Architecture Summary

```
                    ┌─────────────────────────────────────────┐
                    │      Single-Page Web Application        │
                    │   (HTML5 / Modern CSS / Modular JS)     │
                    └────────────────────┬────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        │                                │                                │
┌───────▼────────┐              ┌────────▼───────┐               ┌────────▼────────┐
│ UI & Navigation│              │ Local Calc     │               │ API / Webhook   │
│ Engine         │              │ Engine (WASM/  │               │ Orchestrator    │
│ (Dashboard,    │              │ True Solar     │               │ (Dify / n8n /   │
│ Modules, Chat) │              │ Time Math)     │               │ Custom LLM)     │
└────────────────┘              └────────────────┘               └─────────────────┘
```

---

## Stage 1: System Design, Theme, & Responsive Skeleton Framework

### Objective
Establish the core HTML structure, dark luxury aesthetic (celestial theme with CSS variables), navigation sidebar/header, modular state container, and responsive layout.

### Target Files
- `index.html`
- `styles.css`
- `app.js` (State management & navigation router)

### Stage 1 Prompt
```markdown
You are an expert front-end engineer and UI/UX designer specializing in high-end, mystical, and modern dark-mode web applications.

Build the foundation framework for a multi-school divination and fate analysis web application.

REQUIREMENTS:
1. Tech Stack: Single-page application using clean, semantic HTML5, modern CSS3 (Flexbox, Grid, CSS Variables), and modular Vanilla JavaScript (no heavy external frameworks).
2. Design System & Aesthetics:
   - Deep obsidian dark theme (#0A0C10 base, #121620 surface, #1A202C cards).
   - Gold (#D4AF37), celestial violet (#8A2BE2), and glowing cyan accents (#00E5FF).
   - Typography: Clean serif for headings (Cinzel or Cormorant Garamond style fallback), sans-serif for UI text (Inter style fallback).
   - Smooth subtle glows, thin gold borders (1px solid rgba(212,175,55,0.2)), dark elevated cards.
3. Layout & Structure:
   - Left Sidebar / Bottom Mobile Nav with icons and labels:
     * Dashboard (Short-Term: Today / Week / Month)
     * Mid & Long-Term (Half-Year / Year / Next Year)
     * Foundation & Life Analysis (Natal Chart, BaZi Four Pillars, Zi Wei Grid)
     * Interactive Rituals (Tarot, Runes, I Ching)
     * Oneiromancy (Dream Journal & Interpreter)
     * AI Consultation Hub (Multi-Agent Chat)
     * Custom School Manager (Define proprietary systems)
     * Settings & Profile (User birth data, True Solar Time adjustment toggle, API Keys)
   - Top Header: Current active profile display, True Solar Time clock indicator, active transit summary pills.
   - Main Content View: Dynamic viewport that switches content based on sidebar selection without page refresh.

Please provide:
1. `index.html` containing the full semantic skeleton and container views for all sections.
2. `styles.css` containing complete reset, typography, CSS variables, dark luxury theme styles, card components, and responsive layout queries.
3. `app.js` containing the state router to switch tabs gracefully and store user profile preferences in localStorage.
```

---

## Stage 2: Profile Setup & Local Calculation Engine (True Time & Stems)

### Objective
Create the user profile input modal (birth date, exact time, geographic location/coordinates) and the offline JS math engine for calculating **True Solar Time**, **BaZi Four Pillars**, and **I Ching hexagram probabilities**.

### Target Files
- `calc_engine.js`
- Profile Settings Modal inside `index.html`

### Stage 2 Prompt
```markdown
Expand our divination application by building the Profile Management and Offline Calculation Engine (`calc_engine.js`).

REQUIREMENTS:
1. Profile Data Modal / Form:
   - Inputs: Full Name, Gender, Birth Date, Exact Birth Time (HH:MM), Birth Country/City, Latitude & Longitude (or lookup helper), Time Zone offset.
   - Toggle: "Adjust to True Solar Time (Equation of Time + Longitude Correction)".
2. Offline Astronomical & Calendar Math (`calc_engine.js`):
   - True Solar Time Function: Calculates local solar time given standard time, longitude, and day of year (Equation of Time formula).
   - BaZi Four Pillars Calculator:
     * Converts birth solar date/time to Heavenly Stems and Earthly Branches for Year, Month, Day, and Hour pillars.
     * Computes the 5 Elements (Wood, Fire, Earth, Metal, Water) balance percentage.
   - Western Astrology Coordinates Placeholder:
     * Function to compute tropical zodiac positions (Sun, Moon, Rising/Ascendant approximation).
   - I Ching Math Engine:
     * True random seed coin toss generator (6 lines with changing/unstable line detection for hexagram transformation).
3. Integration:
   - When the profile is saved, run calculations immediately and store the calculated "Natal JSON Payload" in `localStorage`.
   - Update the header UI to show: "[Name] | Sun: ♌ Leo | BaZi: 丙午 Day | True Solar Time: 12:42 PM".

Please output the code for `calc_engine.js` and the modal form HTML/CSS.
```

---

## Stage 3: Dashboard & Short-Term Fortune Telling Module

### Objective
Build the main Dashboard section with quick-toggle views for **Today**, **This Week**, and **This Month**. It displays a synthesized daily energy meter, planetary transit alerts, BaZi day pillar impact, and a daily Tarot/Rune card pull widget.

### Target Files
- Section HTML inside `index.html`
- Dashboard styling in `styles.css`
- Logic in `dashboard.js`

### Stage 3 Prompt
```markdown
Build the Dashboard view (Short-Term Fortune Telling) for our application.

REQUIREMENTS:
1. Time Range Switcher: Segmented pill tabs for [ Today ], [ This Week ], [ This Month ].
2. Overview Hero Card:
   - Daily Overall Energy Score (0 - 100 Circular Progress / Radial Gauge).
   - Key Keywords / Archetypes (e.g., "Strategic Reflection", "Fire Element High", "Saturn Transit Active").
   - Multi-School Quick Summary Cards:
     * Western Astrology: Sun/Moon transits, ascendant mood.
     * BaZi / Eastern: Clash/Harm/Combine alerts for today's Stem/Branch vs User Day Pillar.
     * I Ching / Oracle: Daily hexagram guidance.
3. Daily Ritual Widget (Interactive):
   - "Draw Daily Guidance Card": Single Tarot or Rune flip animation with face-up reveal.
4. Modular Data Architecture:
   - Design the UI to display fallback data cleanly while waiting for the LLM API call response, using shimmering skeletal loading indicators.

Provide the complete HTML layout for the dashboard view, CSS animations for card flips/radial gauges, and `dashboard.js` logic.
```

---

## Stage 4: Mid-Long Term & Foundation / Life Analysis Modules

### Objective
Create detailed viewports for mid-to-long term timing projections (6 Months, 1 Year, Next Year) and foundational lifetime analysis (BaZi Chart Grid, Zi Wei 12 Palaces, Astrology Birth Wheel, and Core Element Balance).

### Target Files
- Foundation & Timing HTML components
- CSS grid templates for Zi Wei and BaZi
- Logic in `foundation.js`

### Stage 4 Prompt
```markdown
Build two major sections for our platform:
1. "Foundation & Life Analysis"
2. "Mid-Long Term Projections"

REQUIREMENTS:

Part 1: Foundation & Life Analysis View:
- BaZi Grid: Interactive 4-Pillar Table (Year, Month, Day, Hour) displaying Heavenly Stems, Earthly Branches, Hidden Stems, Ten Gods, and Element Colors (Wood=Green, Fire=Red, Earth=Yellow, Metal=White/Silver, Water=Blue/Cyan).
- Zi Wei Dou Shu Grid: Traditional 12-Palace Grid layout (Ming Palace, Wealth Palace, Career Palace, etc.) with star placement badges.
- Element Balance Meter: Visual bar chart breaking down Wood, Fire, Earth, Metal, Water percentages.
- Life Master Summary Panel: Tabbed text interface for Core Temperament, Career Affinity, Relationship Dynamics, and Health Vulnerabilities.

Part 2: Mid-Long Term Projections View:
- Timeline Selector: [ 6-Month Horizon ] [ 2026 Annual Fate ] [ 2027 Projections ].
- Major Luck Pillar / Planetary Cycle Display: Visual timeline slider indicating major age cycles (Da Yun / Saturn Return).
- Quarter-by-Quarter Forecast Cards with theme icons, risk indicators, and opportunity ratings.

Include responsive CSS grid styles for the Zi Wei 12 Palaces and BaZi tables, plus clean component JS.
```

---

## Stage 5: Interactive Divination Rituals & Oneiromancy (Dream Analysis)

### Objective
Build interactive tools for Tarot (3-Card Spread & Celtic Cross), Rune Casting, I Ching Coin Toss, and an Oneiromancy Dream Journal with symbol tagging.

### Target Files
- `rituals.js`
- `oneiromancy.js`
- Canvas/SVG animations in CSS/JS

### Stage 5 Prompt
```markdown
Build the Interactive Divination Rituals and Oneiromancy (Dream Analysis) sections.

REQUIREMENTS:

1. Interactive Divination Suite (`rituals.js`):
   - School Selector: [ Tarot ] [ Runes ] [ I Ching ]
   - Tarot Module: Interactive deck shuffle animation, 3-Card Spread layout (Past, Present, Future) with card-flip physics and hover interpretation previews.
   - I Ching Module: Digital 3-coin toss button with sound/visual animation, building 6 lines from bottom to top, identifying solid/broken lines and changing lines.
   - Rune Casting Module: Obsidian stone bag with random 3-stone cast onto a dark altar circle.

2. Oneiromancy / Dream Journal (`oneiromancy.js`):
   - Dream Entry Form: Title, Date, Clarity Rating (1-5 stars), Emotional Tone, Dream Narrative Textarea, Key Symbols/Tags input.
   - Past Dream Log: List of recorded dreams with search and tag filtering.
   - "Analyze Dream" Action Button: Triggers the multi-school dream synthesis prompt (combining psychological archetypes, Chinese dream interpretation / Zhou Gong, and occult symbolism).

Provide HTML, CSS effects (card flips, glowing rune stones), and full JS interactions.
```

---

## Stage 6: Consultation Hub & Multi-Agent Chat Interface

### Objective
Build the real-time AI Consultation Hub where users can ask custom questions. Includes school toggles, persona/tone selection, and a context inspector showing the raw chart payload sent to the LLM.

### Target Files
- `chat.js`
- Chat UI components

### Stage 6 Prompt
```markdown
Build the AI Consultation Hub section (`chat.js`).

REQUIREMENTS:
1. Chat Layout:
   - Modern conversation view with avatar badges for different divination specialists.
   - Message bubble styling for User, Assistant, and System Status updates.
2. Control Panel Header:
   - "Active Oracle Focus": Checkboxes to enable/disable schools in the consultation context ([x] BaZi, [x] Astrology, [ ] Tarot, [x] Dream).
   - "Tone & Perspective": Selector for [ Mystical & Poetic ], [ Direct & Pragmatic ], [ Psychological & Archetypal ], or [ Historical & Analytical ].
3. Advanced Context Inspector Drawer:
   - Collapsible panel showing the exact JSON payload being passed to the backend (Calculated Natal Chart + Active Transits + Past Context).
4. Chat Functions:
   - Quick Prompt Chips: "What does my career look like this year?", "How can I improve my relationship energy?", "Interpret my recent financial block".
   - Streaming text animation effect for responses.

Provide HTML, CSS, and full `chat.js` logic with simulated streaming responses and prompt payload formatting.
```

---

## Stage 7: Custom School Manager & Backend API Integration

### Objective
Create a custom school rule engine (allowing users to define custom metaphysical systems) and hook the entire app up to external LLM backends (Dify, n8n, Google Gemini API, or custom Webhooks).

### Target Files
- `custom_school.js`
- `api_service.js`

### Stage 7 Prompt
```markdown
Build the Custom School Manager and Backend API Service (`api_service.js`).

REQUIREMENTS:

1. Custom School Manager UI & Logic (`custom_school.js`):
   - Form to create custom divination systems:
     * School Name & Icon.
     * Core Elements / Archetypes list (e.g., custom 7-element system).
     * System Rules & Weightings textarea (Prompt injection rules for this custom school).
   - Saved custom schools list stored in `localStorage` and injected dynamically into the router and router choices.

2. API Integration Layer (`api_service.js`):
   - Centralized fetch service supporting multiple backend choices:
     * Option A: Dify / n8n Webhook API endpoint.
     * Option B: Direct Google Gemini API endpoint using standard API keys.
   - Request Builder: Combines User Question + Natal JSON + Active School Settings + Custom School Prompts into a structured JSON request payload.
   - Error handling, fallback offline mock responses, network status notification.

3. Final Polishing:
   - Export / Import User Profile & Data (JSON file download/upload).
   - Complete initialization script in `app.js` wiring up all components seamlessly.

Output `custom_school.js`, `api_service.js`, and the final wiring logic.
```

---

## Coding Agent Execution Workflow

To build this application step-by-step with maximum precision:

1. **Copy Stage 1 Prompt** into Google AI Studio, Cursor, or your preferred coding agent. Save the generated files locally in a dedicated folder.
2. **Execute Stage 2 through Stage 7 sequentially**, feeding the previously generated file structure into the agent so it builds iteratively without breaking existing code.
3. **Test locally** by opening `index.html` directly in your web browser.
4. **Hook up your API Key or Dify Webhook** in the Settings view to enable live LLM interpretations.
