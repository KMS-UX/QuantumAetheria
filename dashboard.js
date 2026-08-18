/**
 * AETHERIA — Dashboard View (Short-Term Fortune Telling Engine)
 * Timeframe switcher, Radial Energy Gauge, Multi-School Synthesizer,
 * Shimmering Skeletal Loaders, and Interactive Daily Guidance Ritual
 */

import { CalcEngine } from './calc_engine.js';

export const DashboardEngine = {
  activeTimeframe: 'today',
  activeRitualMode: 'tarot', // 'tarot' or 'rune'
  dailyCardDrawn: null,
  isFlipped: false,
  isLoadingAI: false,

  // Initialize the Dashboard
  init(soundEngine) {
    this.soundEngine = soundEngine;
    this.setupTimeRangeSwitcher();
    this.setupDailyRitualWidget();
    this.renderInitialDashboard();
  },

  // Setup [ Today ] [ This Week ] [ This Month ] switcher
  setupTimeRangeSwitcher() {
    const tabs = document.querySelectorAll('#dashboard-subtabs .sub-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tf = tab.dataset.timeframe;
        this.switchTimeframe(tf);
      });
    });
  },

  // Switch timeframe and trigger updates
  async switchTimeframe(timeframe) {
    this.activeTimeframe = timeframe;
    if (this.soundEngine) this.soundEngine.playChime(680, 0.25);

    // Show shimmering skeletal state
    this.setSkeletonLoading(true);

    // Fetch or calculate data for this epoch
    try {
      const insights = await this.fetchEpochInsights(timeframe);
      this.renderDashboardData(insights);
    } catch (e) {
      console.warn('Epoch fetch fallback:', e);
      const fallback = this.generateDeterministicEpochData(timeframe);
      this.renderDashboardData(fallback);
    } finally {
      this.setSkeletonLoading(false);
    }
  },

  // Render initial dashboard data
  renderInitialDashboard() {
    const data = this.generateDeterministicEpochData(this.activeTimeframe);
    this.renderDashboardData(data);
    // Trigger background AI fetch
    this.fetchEpochInsights(this.activeTimeframe).then(insights => {
      if (insights) this.renderDashboardData(insights);
    }).catch(() => {});
  },

  // Generate offline deterministic data based on CalcEngine & user profile
  generateDeterministicEpochData(timeframe) {
    const savedProfile = localStorage.getItem('aetheria_profile');
    const profile = savedProfile ? JSON.parse(savedProfile) : { name: 'Astraea Vane', birthDate: '1998-08-16', birthTime: '11:45:00', longitude: 135.7681 };
    const natal = CalcEngine.generateNatalPayload(profile);

    const now = new Date();
    const dayMaster = natal.bazi.dayMaster;

    // Determine interactions with today's transit branch (e.g. Chen 辰 or Si 巳)
    const transitBranch = "巳"; // Si Fire
    const userDayBranch = natal.bazi.pillars.day.branch.char;
    
    let baziAlert = `Day Master (${dayMaster.char} ${dayMaster.pinyin} ${dayMaster.element}) receives productive nourishment from transit cycles.`;
    if (userDayBranch === '亥') {
      baziAlert = `⚠️ 巳-亥 Clash (Si-Hai Chong): Water-Fire clash in relationships. Avoid hasty debates during 21:00-23:00.`;
    } else if (userDayBranch === '申') {
      baziAlert = `✦ 巳-申 Six Harmony (Liu He): Metal-Water synthesis supports long-term strategic contracts.`;
    } else if (userDayBranch === '酉' || userDayBranch === '丑') {
      baziAlert = `✦ 巳-酉-丑 Three Harmonies (San He Metal): Exceptional clarity in intellect and analytical execution.`;
    }

    let energyScore = 88;
    let archetypes = ["Strategic Reflection", "Fire Element High", "Saturn Transit Active"];
    let westernTransit = `${natal.astrology.sun.glyph} Sun in ${natal.astrology.sun.signName} aligns with Mercury trine Jupiter — intuitive perception and creative writing flourish.`;
    let ichingGuidance = `${natal.iching.primaryHex.symbol} ${natal.iching.primaryHex.name}: Steady perseverance with grounded awareness ensures smooth attainment.`;
    let tactical = "Channel creative surges during True Solar Noon (11:00 - 13:00 TST).";
    let avoid = "Avoid signing hurried agreements during nocturnal twilight hours.";

    if (timeframe === 'week') {
      energyScore = 84;
      archetypes = ["Midheaven Ingress", "Alchemical Synthesis", "Jupiterian Expansion"];
      westernTransit = "The Moon transits through Scorpio, forming a grand water trine with Neptune. Subconscious visions and oneiromancy hold pivotal keys.";
      baziAlert = `Weekly Qi leans Wood-Fire forward. Favorable for ${dayMaster.element === 'Fire' || dayMaster.element === 'Wood' ? 'ambitious creative launches' : 'disciplined self-study'}.`;
      ichingGuidance = "䷊ Hexagram 11 (Peace / Tai) — Heaven and Earth in harmonious communion. Receptive collaboration yields rich dividends.";
      tactical = "Consolidate vital partnerships and draft long-term project blueprints.";
      avoid = "Do not neglect somatic rest amid high intellectual momentum.";
    } else if (timeframe === 'month') {
      energyScore = 91;
      archetypes = ["Solar Return Threshold", "Karmic Pivot", "Dragon Year Culmination"];
      westernTransit = "Solar ingress activates your 9th House of Higher Wisdom, philosophy, and visionary metaphysics.";
      baziAlert = `Annual Jia Chen (Wood Dragon) pillar harmonizes with your natal Month Pillar, opening major career breakthroughs.`;
      ichingGuidance = "䷍ Hexagram 14 (Possession in Great Measure / Da You) — Abundance guided by virtue and luminous integrity.";
      tactical = "Initiate your highest-tier aspirations before the next seasonal solstice.";
      avoid = "Avoid over-extending resources on unvetted peripheral distractions.";
    }

    return {
      energyScore,
      archetypes,
      westernTransit,
      baziAlert,
      ichingGuidance,
      tacticalAction: tactical,
      avoidAction: avoid,
      synthesisNarrative: `Under the current ${timeframe} celestial currents, your ${dayMaster.polarity} ${dayMaster.element} Day Master aligns with high-frequency planetary vectors. The synergy between Western Solar ingress and Eastern Five Elements generates expansive clarity.`
    };
  },

  // Fetch AI-synthesized daily/weekly/monthly insights from Express server
  async fetchEpochInsights(timeframe) {
    const savedProfile = localStorage.getItem('aetheria_profile');
    const profile = savedProfile ? JSON.parse(savedProfile) : { name: 'Astraea Vane', birthDate: '1998-08-16', birthTime: '11:45:00', longitude: 135.7681 };
    const natalPayload = CalcEngine.generateNatalPayload(profile);

    const res = await fetch('/api/divination/daily-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timeframe,
        userProfile: profile,
        natalPayload,
        dateStr: new Date().toISOString().split('T')[0]
      })
    });

    if (!res.ok) throw new Error('API network response not ok');
    const data = await res.json();
    return data;
  },

  // Render synthesized data to DOM
  renderDashboardData(data) {
    if (!data) return;

    // 1. Radial Energy Gauge & Score
    const score = data.energyScore || 85;
    const scoreNumEl = document.getElementById('radial-energy-score-num');
    const scoreLabelEl = document.getElementById('radial-score-badge');
    const progressCircle = document.getElementById('radial-gauge-progress');

    if (scoreNumEl) this.animateCount(scoreNumEl, 0, score, 1000);
    
    if (scoreLabelEl) {
      let badge = "Harmonic Flow";
      if (score >= 90) badge = "✦ Peak Auspicious";
      else if (score >= 80) badge = "Potent Manifestation";
      else if (score >= 70) badge = "Strategic Discernment";
      else badge = "Surrender & Rest";
      scoreLabelEl.textContent = badge;
    }

    if (progressCircle) {
      // Circumference = 2 * PI * 54 ≈ 339.292
      const circumference = 339.292;
      const offset = circumference - (score / 100) * circumference;
      progressCircle.style.strokeDashoffset = offset;
    }

    // 2. Key Keywords / Archetypes
    const archetypeContainer = document.getElementById('dashboard-archetype-pills');
    if (archetypeContainer && data.archetypes) {
      const colors = ['', 'cyan', 'violet'];
      archetypeContainer.innerHTML = data.archetypes.map((arch, i) => `
        <span class="archetype-pill ${colors[i % colors.length]}">
          <span>✦</span> ${arch}
        </span>
      `).join('');
    }

    // 3. Synthesis Narrative & Tactical Advice
    const narrativeEl = document.getElementById('dashboard-hero-narrative');
    if (narrativeEl && (data.synthesisNarrative || data.westernTransit)) {
      narrativeEl.textContent = data.synthesisNarrative || data.westernTransit;
    }

    const tacticalEl = document.getElementById('dashboard-tactical-do');
    const cautionEl = document.getElementById('dashboard-tactical-avoid');
    if (tacticalEl) tacticalEl.textContent = data.tacticalAction || "Initiate strategic outreach during the Golden Solar Hour.";
    if (cautionEl) cautionEl.textContent = data.avoidAction || "Avoid hasty reactive debates during nightfall.";

    // 4. Multi-School Quick Summary Cards
    const westTransitEl = document.getElementById('card-western-summary-text');
    const baziAlertEl = document.getElementById('card-bazi-summary-text');
    const ichingGuidanceEl = document.getElementById('card-iching-summary-text');

    if (westTransitEl) westTransitEl.textContent = data.westernTransit || "Sun in Leo trines Ascendant; lunar illumination sharpens subconscious discernment.";
    if (baziAlertEl) baziAlertEl.textContent = data.baziAlert || "Day Master balances with transit Qi without violent clashes.";
    if (ichingGuidanceEl) ichingGuidanceEl.textContent = data.ichingGuidance || "Hexagram 1 (The Creative) — Pure momentum guided by righteous integrity.";
  },

  // Animate number count-up
  animateCount(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.floor(easeOut * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = end;
      }
    };
    window.requestAnimationFrame(step);
  },

  // Toggle Shimmering Skeletal Loading states
  setSkeletonLoading(isLoading) {
    this.isLoadingAI = isLoading;
    const skeletonElements = document.querySelectorAll('.dashboard-dynamic-content');
    const shimmerOverlays = document.querySelectorAll('.skeleton-shimmer-wrapper');

    skeletonElements.forEach(el => {
      el.style.opacity = isLoading ? '0.35' : '1';
      el.style.transition = 'opacity 0.3s ease';
    });

    shimmerOverlays.forEach(overlay => {
      overlay.style.display = isLoading ? 'block' : 'none';
    });
  },

  // Setup Daily Ritual Widget (Single Card/Rune Flip)
  setupDailyRitualWidget() {
    const cardFlipper = document.getElementById('daily-guidance-card-flipper');
    const drawBtn = document.getElementById('btn-draw-daily-guidance');
    const resetBtn = document.getElementById('btn-reset-guidance-card');
    const modeSelect = document.getElementById('guidance-mode-select');

    if (modeSelect) {
      modeSelect.addEventListener('change', () => {
        this.activeRitualMode = modeSelect.value;
        this.resetDailyCard();
      });
    }

    const triggerDraw = () => {
      if (this.isFlipped) return;
      this.drawDailyGuidanceCard();
    };

    if (drawBtn) drawBtn.addEventListener('click', triggerDraw);
    if (cardFlipper) cardFlipper.addEventListener('click', triggerDraw);

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetDailyCard();
      });
    }
  },

  // Draw single Tarot or Rune card with 3D flip animation
  drawDailyGuidanceCard() {
    const cardFlipper = document.getElementById('daily-guidance-card-flipper');
    const glyphEl = document.getElementById('guidance-card-glyph');
    const titleEl = document.getElementById('guidance-card-title');
    const stanceEl = document.getElementById('guidance-card-stance');
    const oracleTextEl = document.getElementById('guidance-oracle-synthesis');
    const drawBtn = document.getElementById('btn-draw-daily-guidance');
    const resetBtn = document.getElementById('btn-reset-guidance-card');

    if (this.soundEngine) this.soundEngine.playHarmonicChord();

    let drawn = null;
    let isReversed = false;

    if (this.activeRitualMode === 'tarot') {
      const TAROT_CARDS = [
        { name: "0. The Fool", symbol: "🤹", upright: "Boundless potential, innocent leap of faith, cosmic renewal.", reversed: "Hesitation, fear of unknown horizons, reckless leap." },
        { name: "I. The Magician", symbol: "🪄", upright: "Aligned willpower, conscious manifestation, mastery of elements.", reversed: "Untapped potential, illusions, scattered energy." },
        { name: "II. High Priestess", symbol: "🌙", upright: "Subconscious threshold, sacred intuition, deep inner gnosis.", reversed: "Suppressed intuition, superficial distraction." },
        { name: "III. The Empress", symbol: "👑", upright: "Abundant fertility, Venusian nurturing, creative genesis.", reversed: "Creative blockade, overprotective smothering." },
        { name: "IV. The Emperor", symbol: "🏛️", upright: "Sovereign discipline, structured authority, divine order.", reversed: "Inflexibility, misuse of power, chaotic rule." },
        { name: "VIII. Strength", symbol: "🦁", upright: "Gentle spiritual courage, taming primal forces with grace.", reversed: "Self-doubt, feeling drained, raw reactivity." },
        { name: "XVII. The Star", symbol: "⭐", upright: "Serene faith, celestial guidance, luminous rejuvenation.", reversed: "Temporary despair, disconnected from high purpose." },
        { name: "XIX. The Sun", symbol: "☀️", upright: "Radiant solar triumph, joyful vitality, clear illumination.", reversed: "Veiled joy, overlooked blessings, dim vision." },
        { name: "XXI. The World", symbol: "🌌", upright: "Ascension to next spiral, completion of major cycle, unity.", reversed: "Seeking external closure, lingering attachment." }
      ];
      drawn = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
      isReversed = Math.random() > 0.7;
    } else {
      const RUNES = [
        { name: "Fehu (ᚠ)", symbol: "ᚠ", meaning: "Mobile Wealth & Vital Prana Flow", stance: "Radiant Creation" },
        { name: "Ansuz (ᚨ)", symbol: "ᚨ", meaning: "Divine Voice & Odin's Gnosis", stance: "Channeled Truth" },
        { name: "Raidho (ᚱ)", symbol: "ᚱ", meaning: "Solar Journey & Karmic Wheel", stance: "Aligned Path" },
        { name: "Kenaz (ᚲ)", symbol: "ᚲ", meaning: "Illuminating Torch & Craft Mastery", stance: "Inner Ignition" },
        { name: "Gebo (ᚷ)", symbol: "ᚷ", meaning: "Sacred Exchange & Energetic Gift", stance: "Equilibrium" },
        { name: "Sowilo (ᛋ)", symbol: "ᛋ", meaning: "Invincible Sun & Victory of Light", stance: "Solar Radiance" },
        { name: "Dagaz (ᛞ)", symbol: "ᛞ", meaning: "Dawn Awakening & Sudden Realization", stance: "Transmutation" }
      ];
      const rune = RUNES[Math.floor(Math.random() * RUNES.length)];
      drawn = {
        name: rune.name,
        symbol: rune.symbol,
        upright: `${rune.meaning}. Walk with unwavering intention.`,
        reversed: `${rune.meaning}. Reflect before outward assertion.`
      };
      isReversed = false;
    }

    this.dailyCardDrawn = drawn;
    this.isFlipped = true;

    if (glyphEl) glyphEl.textContent = drawn.symbol;
    if (titleEl) titleEl.textContent = drawn.name;
    if (stanceEl) stanceEl.textContent = isReversed ? "Reversed (Shadow Guidance)" : "Upright (Radiant Flow)";

    if (cardFlipper) cardFlipper.classList.add('flipped');

    setTimeout(() => {
      if (oracleTextEl) {
        oracleTextEl.innerHTML = `
          <strong style="color: var(--gold-light);">${drawn.name} (${isReversed ? 'Reversed' : 'Upright'})</strong>: 
          ${isReversed ? drawn.reversed : drawn.upright}
          <div style="margin-top: 8px; font-size: 0.8rem; color: var(--cyan-cosmic);">
            ✦ Oracle Alignment: Today's astrological transits amplify this archetype's transformative resonance.
          </div>
        `;
      }
      if (drawBtn) drawBtn.style.display = 'none';
      if (resetBtn) resetBtn.style.display = 'inline-flex';
    }, 600);
  },

  // Reset guidance card to back face
  resetDailyCard() {
    const cardFlipper = document.getElementById('daily-guidance-card-flipper');
    const oracleTextEl = document.getElementById('guidance-oracle-synthesis');
    const drawBtn = document.getElementById('btn-draw-daily-guidance');
    const resetBtn = document.getElementById('btn-reset-guidance-card');

    if (cardFlipper) cardFlipper.classList.remove('flipped');
    this.isFlipped = false;

    if (oracleTextEl) {
      oracleTextEl.innerHTML = `<span style="color: var(--text-muted); font-style: italic;">Tap the sacred card or click 'Draw Daily Guidance Card' to unveil your daily archetype.</span>`;
    }

    if (drawBtn) drawBtn.style.display = 'inline-flex';
    if (resetBtn) resetBtn.style.display = 'none';

    if (this.soundEngine) this.soundEngine.playChime(500, 0.2);
  }
};
