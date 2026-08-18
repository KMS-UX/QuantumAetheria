/**
 * AETHERIA — Multi-School Divination & Fate Matrix Core Application
 * High-precision astronomical math, multi-school engines, rituals & AI High Thinking
 */

import { CalcEngine } from './calc_engine.js';
import { DashboardEngine } from './dashboard.js';
import { FoundationEngine } from './foundation.js';
import { ProjectionsEngine } from './projections.js';
import { RitualsEngine } from './rituals.js';
import { OneiromancyEngine } from './oneiromancy.js';
import { ChatEngine } from './chat.js';
import { CustomSchoolManager } from './custom_school.js';
import { APIService } from './api_service.js';

// Global State Object
const AetheriaState = {
  activeView: 'view-dashboard',
  activeAgent: 'synthesizer',
  activeRitual: 'tarot',
  activeFoundationTab: 'bazi',
  activeDashboardTab: 'today',
  
  profile: {
    name: 'Astraea Vane',
    birthDate: '1998-08-16',
    birthTime: '11:45:00',
    birthCity: 'Kyoto, Japan',
    latitude: 35.0116,
    longitude: 135.7681,
    timezoneOffsetHours: 9,
    gender: 'Female / Yin',
    useTrueSolarTime: true,
    soundEnabled: true
  },

  natalPayload: null,
  dreams: [],
  customSchools: [],
  chatHistories: {},
  ichingState: {
    currentLines: [],
    isTossing: false
  }
};

window.AetheriaState = AetheriaState;

// --- AUDIO SYNTHESIS (Tibetan Singing Bowl & Celestial Chime) ---
class SoundSynthesizer {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playChime(freq = 528, duration = 1.6, type = 'sine') {
    if (!AetheriaState.profile.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio note error:', e);
    }
  }

  playHarmonicChord() {
    this.playChime(432, 2.0);
    setTimeout(() => this.playChime(528, 2.2), 80);
    setTimeout(() => this.playChime(639, 2.4), 160);
  }
}

const soundEngine = new SoundSynthesizer();

// --- DATA ARCHETYPES ---
const TAROT_DECK = [
  { id: 0, name: "0. The Fool", symbol: "🤹", upright: "New beginnings, boundless potential, sacred innocence.", reversed: "Recklessness, fear of leaps, misdirection." },
  { id: 1, name: "I. The Magician", symbol: "🪄", upright: "Manifestation, resourcefulness, elemental power.", reversed: "Manipulation, untapped talent, illusion." },
  { id: 2, name: "II. High Priestess", symbol: "🌙", upright: "Intuition, sacred mysteries, subconscious threshold.", reversed: "Secrets revealed, silenced inner voice, superficiality." },
  { id: 3, name: "III. The Empress", symbol: "👑", upright: "Abundance, fertility, nurturing creation, Venusian harmony.", reversed: "Creative blockage, dependence, overbearing care." },
  { id: 4, name: "IV. The Emperor", symbol: "🏛️", upright: "Divine order, authority, disciplined structure, sovereignty.", reversed: "Tyranny, rigidity, loss of control." },
  { id: 5, name: "V. The Hierophant", symbol: "📜", upright: "Spiritual lineage, sacred knowledge, mystical initiation.", reversed: "Challenging dogmas, unorthodox path, personal truth." },
  { id: 6, name: "VI. The Lovers", symbol: "🕊️", upright: "Divine alignment, conscious union, sacred crossroads.", reversed: "Disharmony, misaligned values, avoidance of choice." },
  { id: 7, name: "VII. The Chariot", symbol: "🛡️", upright: "Triumph through willpower, overcoming duality, focused direction.", reversed: "Lack of direction, aggression, runaway forces." },
  { id: 8, name: "VIII. Strength", symbol: "🦁", upright: "Inner courage, gentle mastery of beast nature, compassion.", reversed: "Self-doubt, raw vulnerability, weakness." },
  { id: 9, name: "IX. The Hermit", symbol: "🏮", upright: "Introspective wisdom, solitary illumination, soul-seeking.", reversed: "Isolation, loneliness, lost in the dark." },
  { id: 10, name: "X. Wheel of Fortune", symbol: "☸️", upright: "Cosmic cycles, karmic turning points, destiny's blessing.", reversed: "Resisting natural change, bad turn of luck." },
  { id: 11, name: "XI. Justice", symbol: "⚖️", upright: "Equilibrium, karmic truth, clarity of cause and consequence.", reversed: "Injustice, dishonesty, refusal to take accountability." },
  { id: 12, name: "XII. The Hanged Man", symbol: "⏳", upright: "Sacred surrender, inverted perspective, spiritual pause.", reversed: "Needless martyrdom, stagnation, resistance." },
  { id: 13, name: "XIII. Death", symbol: "🥀", upright: "Alchemical dissolution, absolute renewal, shedding the husk.", reversed: "Fear of ending, holding onto dead weight, stagnation." },
  { id: 14, name: "XIV. Temperance", symbol: "🏺", upright: "Middle way, alchemical synthesis, patience and divine blend.", reversed: "Imbalance, excess, clashing extremes." },
  { id: 15, name: "XV. The Devil", symbol: "⛓️", upright: "Shadow material, material entrapment, unconscious chains.", reversed: "Breaking free, shadow integration, spiritual liberation." },
  { id: 16, name: "XVI. The Tower", symbol: "⚡", upright: "Sudden revelation, collapse of illusions, lightning cleansing.", reversed: "Averting disaster, delaying the inevitable, trapped in ruin." },
  { id: 17, name: "XVII. The Star", symbol: "⭐", upright: "Hope, celestial inspiration, serene faith in providence.", reversed: "Despair, lost faith, disconnected from guidance." },
  { id: 18, name: "XVIII. The Moon", symbol: "🌕", upright: "Astral scrying, deep subconscious visions, illusions.", reversed: "Dispelling mist, overcoming nocturnal anxieties." },
  { id: 19, name: "XIX. The Sun", symbol: "☀️", upright: "Radiant joy, vital clarity, solar realization and success.", reversed: "Temporary gloom, dimmed light, overlooked blessings." },
  { id: 20, name: "XX. Judgement", symbol: "🎺", upright: "Cosmic rebirth, answering the high calling, absolute awakening.", reversed: "Self-criticism, ignoring the summons, doubt." },
  { id: 21, name: "XXI. The World", symbol: "🌌", upright: "Ouroboros completion, cosmic wholeness, ascension to next spiral.", reversed: "Unfinished cycles, seeking closure, empty triumphs." }
];

const ELDER_FUTHARK = [
  { name: "Fehu", glyph: "ᚠ", meaning: "Mobile Wealth & Vital Prana", element: "Fire/Earth" },
  { name: "Uruz", glyph: "ᚢ", meaning: "Untamed Strength & Sacred Health", element: "Earth" },
  { name: "Thurisaz", glyph: "ᚦ", meaning: "Giant Force & Thor's Barrier", element: "Fire" },
  { name: "Ansuz", glyph: "ᚨ", meaning: "Divine Voice & Odin's Wisdom", element: "Air" },
  { name: "Raidho", glyph: "ᚱ", meaning: "Solar Journey & Cosmic Order", element: "Air" },
  { name: "Kenaz", glyph: "ᚲ", meaning: "Illuminating Torch & Craft Forge", element: "Fire" },
  { name: "Gebo", glyph: "ᚷ", meaning: "Sacred Gift & Energetic Exchange", element: "Air" },
  { name: "Wunjo", glyph: "ᚹ", meaning: "Ecstatic Harmony & Fellowship", element: "Earth" },
  { name: "Hagalaz", glyph: "ᚺ", meaning: "Cosmic Hail & Disruptive Transformation", element: "Ice/Water" },
  { name: "Nauthiz", glyph: "ᚾ", meaning: "Crucible of Need & Self-Reliance", element: "Fire" },
  { name: "Isa", glyph: "ᛁ", meaning: "Stilled Ice & Crystallized Will", element: "Ice" },
  { name: "Jera", glyph: "ᛃ", meaning: "Bountiful Harvest & Yearly Cycles", element: "Earth" },
  { name: "Eihwaz", glyph: "ᛇ", meaning: "Yggdrasil Yew Axis & Spiritual Death-Rebirth", element: "All" },
  { name: "Perthro", glyph: "ᛈ", meaning: "Cup of Fate & Unmanifest Wyrd", element: "Water" },
  { name: "Algiz", glyph: "ᛉ", meaning: "Elk Shield & Divine Protection", element: "Air" },
  { name: "Sowilo", glyph: "ᛋ", meaning: "Invincible Sun & Victory of Light", element: "Fire" },
  { name: "Tiwaz", glyph: "ᛏ", meaning: "Tyr's Sword & Righteous Justice", element: "Air" },
  { name: "Berkano", glyph: "ᛒ", meaning: "Birch Sanctuary & Gentle Rebirth", element: "Earth" },
  { name: "Ehwaz", glyph: "ᛖ", meaning: "Twin Horses & Dynamic Partnership", element: "Earth" },
  { name: "Mannaz", glyph: "ᛗ", meaning: "Cosmic Humanity & Collective Mind", element: "Air" },
  { name: "Laguz", glyph: "ᛚ", meaning: "Flowing Water & Oceanic Intuition", element: "Water" },
  { name: "Ingwaz", glyph: "ᛜ", meaning: "Fertile Seed & Internal Incubation", element: "Earth" },
  { name: "Dagaz", glyph: "ᛞ", meaning: "Dawn Flash & Non-Dual Awakening", element: "Light/Fire" },
  { name: "Othala", glyph: "ᛟ", meaning: "Ancestral Homeland & Sacred Inheritance", element: "Earth" }
];

// --- INITIALIZATION & ROUTER ---
document.addEventListener('DOMContentLoaded', () => {
  loadStoredData();
  setupNavigation();
  setupSubTabs();
  setupProfileEngine();
  setupProfileModal();
  setupTrueSolarTimeClock();
  setupRituals();
  setupDreamJournal();
  setupAIConsultation();
  setupCustomSchools();
  setupAPISettingsAndVault();
  DashboardEngine.init(soundEngine);
  FoundationEngine.init(soundEngine);
  ProjectionsEngine.init(soundEngine);
  recalculateAllSystems();
  
  // Render Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

// Load localStorage persistence
function loadStoredData() {
  try {
    const savedProfile = localStorage.getItem('aetheria_profile');
    if (savedProfile) {
      AetheriaState.profile = { ...AetheriaState.profile, ...JSON.parse(savedProfile) };
    }

    const savedPayload = localStorage.getItem('aetheria_natal_payload');
    if (savedPayload) {
      AetheriaState.natalPayload = JSON.parse(savedPayload);
    }

    const savedDreams = localStorage.getItem('aetheria_dreams');
    if (savedDreams) {
      AetheriaState.dreams = JSON.parse(savedDreams);
    } else {
      // Seed initial mystical dream
      AetheriaState.dreams = [
        {
          id: 'dream-init-1',
          date: '2026-08-15',
          title: 'The Obsidian Observatory of Al-Zubra',
          emotion: 'Mysterious & Numinous',
          lucidity: 4,
          tags: ['Telescope', 'Purple Star', 'Golden Compass', 'Desert'],
          content: 'I stood atop an ancient twelve-sided tower. In the center, water rotated in an alabaster basin, reflecting planets not found on ordinary star charts.',
          interpretation: '✦ Alchemical Resonance: You are approaching an intellectual initiation. The water in the twelve-sided basin signifies the integration of the 12 Houses with your intuitive subconscious.'
        }
      ];
    }

    const savedSchools = localStorage.getItem('aetheria_custom_schools');
    if (savedSchools) {
      AetheriaState.customSchools = JSON.parse(savedSchools);
    } else {
      AetheriaState.customSchools = [
        {
          id: 'school-1',
          name: 'Hermetic Decan Alchemica',
          category: 'Hellenistic / Planetary',
          weights: 'Fire 35%, Air 25%, Water 25%, Earth 15%',
          description: 'Subdivides each zodiac sign into 10-degree planetary faces ruled by Egyptian decanic deities.',
          active: true
        },
        {
          id: 'school-2',
          name: 'Chaldean Planetary Hours Matrix',
          category: 'Mesopotamian Chronomancy',
          weights: 'Solar 40%, Lunar 30%, Mars 30%',
          description: 'Tracks day/night planetary hours using the descending Chaldean sphere sequence.',
          active: true
        }
      ];
    }
  } catch (e) {
    console.error('Storage parse error:', e);
  }
}

// Setup View Router
function setupNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  const viewSections = document.querySelectorAll('.view-section');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const sidebar = document.getElementById('sidebar');

  navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetViewId = btn.dataset.view;
      if (!targetViewId) return;

      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      viewSections.forEach(section => {
        section.classList.remove('active-view');
        if (section.id === targetViewId) {
          section.classList.add('active-view');
        }
      });

      AetheriaState.activeView = targetViewId;
      soundEngine.playChime(660, 0.4);

      if (window.innerWidth <= 768 && sidebar) {
        sidebar.classList.remove('mobile-open');
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      soundEngine.playChime(500, 0.2);
    });
  }

  // Quick sync button in sidebar
  const quickSyncBtn = document.getElementById('btn-quick-sync');
  if (quickSyncBtn) {
    quickSyncBtn.addEventListener('click', () => {
      recalculateAllSystems();
      soundEngine.playHarmonicChord();
      showToast('Astronomical and BaZi engines synchronized!');
    });
  }

  // Quick divine in header
  const quickDivineBtn = document.getElementById('btn-quick-divine');
  if (quickDivineBtn) {
    quickDivineBtn.addEventListener('click', () => {
      soundEngine.playHarmonicChord();
      triggerQuickOracle();
    });
  }
}

// Sub Tabs Switcher
function setupSubTabs() {
  // Dashboard subtabs
  const dashSubTabs = document.querySelectorAll('#dashboard-subtabs .sub-tab-btn');
  dashSubTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      dashSubTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      AetheriaState.activeDashboardTab = tab.dataset.timeframe;
      soundEngine.playChime(700, 0.25);
      showToast(`Switched Dashboard Epoch to ${tab.textContent}`);
    });
  });

  // Foundation school subtabs
  const foundationTabs = document.querySelectorAll('#foundation-subtabs .sub-tab-btn');
  const foundationSubviews = document.querySelectorAll('.school-subview');
  foundationTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      foundationTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const schoolKey = tab.dataset.schoolTab;
      AetheriaState.activeFoundationTab = schoolKey;

      foundationSubviews.forEach(view => {
        view.style.display = 'none';
      });

      const targetSubview = document.getElementById(`subview-${schoolKey}`);
      if (targetSubview) targetSubview.style.display = 'block';

      soundEngine.playChime(580, 0.3);
    });
  });

  // Rituals subtabs
  const ritualTabs = document.querySelectorAll('#rituals-subtabs .sub-tab-btn');
  const ritualSubviews = document.querySelectorAll('.ritual-subview');
  ritualTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      ritualTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const ritualKey = tab.dataset.ritual;
      AetheriaState.activeRitual = ritualKey;

      ritualSubviews.forEach(v => v.style.display = 'none');
      const targetSubview = document.getElementById(`subview-ritual-${ritualKey}`);
      if (targetSubview) targetSubview.style.display = 'block';

      soundEngine.playChime(620, 0.3);
    });
  });
}

// --- PROFILE MODAL DIALOG ---
function setupProfileModal() {
  const modalBackdrop = document.getElementById('profile-modal-backdrop');
  const openModalBtn = document.getElementById('btn-open-profile-modal');
  const headerChip = document.getElementById('header-profile-chip');
  const closeModalBtn = document.getElementById('modal-profile-close');
  const cancelModalBtn = document.getElementById('modal-btn-cancel');
  const modalForm = document.getElementById('modal-profile-form');
  const cityPresetSelect = document.getElementById('modal-city-preset');

  const openModal = () => {
    if (!modalBackdrop) return;
    // Populate form fields with current state
    const nameInput = document.getElementById('modal-name');
    const genderSelect = document.getElementById('modal-gender');
    const bdateInput = document.getElementById('modal-birthdate');
    const btimeInput = document.getElementById('modal-birthtime');
    const cityInput = document.getElementById('modal-city');
    const tzSelect = document.getElementById('modal-tz-offset');
    const latInput = document.getElementById('modal-lat');
    const lonInput = document.getElementById('modal-lon');
    const tstToggle = document.getElementById('modal-tst-toggle');

    if (nameInput) nameInput.value = AetheriaState.profile.name;
    if (genderSelect) genderSelect.value = AetheriaState.profile.gender;
    if (bdateInput) bdateInput.value = AetheriaState.profile.birthDate;
    if (btimeInput) btimeInput.value = AetheriaState.profile.birthTime;
    if (cityInput) cityInput.value = AetheriaState.profile.birthCity;
    if (tzSelect) tzSelect.value = String(AetheriaState.profile.timezoneOffsetHours || 9);
    if (latInput) latInput.value = AetheriaState.profile.latitude;
    if (lonInput) lonInput.value = AetheriaState.profile.longitude;
    if (tstToggle) tstToggle.checked = AetheriaState.profile.useTrueSolarTime;

    modalBackdrop.classList.add('open');
    modalBackdrop.setAttribute('aria-hidden', 'false');
    soundEngine.playChime(600, 0.3);
  };

  const closeModal = () => {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
  };

  if (openModalBtn) openModalBtn.addEventListener('click', openModal);
  if (headerChip) headerChip.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  // City preset quick lookup listener
  if (cityPresetSelect) {
    cityPresetSelect.addEventListener('change', () => {
      const selectedOption = cityPresetSelect.options[cityPresetSelect.selectedIndex];
      if (!selectedOption.value) return;

      const cityName = selectedOption.value;
      const lat = selectedOption.dataset.lat;
      const lon = selectedOption.dataset.lon;
      const tz = selectedOption.dataset.tz;

      const cityInput = document.getElementById('modal-city');
      const latInput = document.getElementById('modal-lat');
      const lonInput = document.getElementById('modal-lon');
      const tzSelect = document.getElementById('modal-tz-offset');

      if (cityInput) cityInput.value = cityName;
      if (latInput) latInput.value = lat;
      if (lonInput) lonInput.value = lon;
      if (tzSelect) tzSelect.value = tz;

      soundEngine.playChime(750, 0.2);
    });
  }

  // Modal Form Submission
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('modal-name').value;
      const gender = document.getElementById('modal-gender').value;
      const birthDate = document.getElementById('modal-birthdate').value;
      const birthTime = document.getElementById('modal-birthtime').value;
      const birthCity = document.getElementById('modal-city').value;
      const timezoneOffsetHours = parseFloat(document.getElementById('modal-tz-offset').value) || 0;
      const latitude = parseFloat(document.getElementById('modal-lat').value) || 0;
      const longitude = parseFloat(document.getElementById('modal-lon').value) || 0;
      const useTrueSolarTime = document.getElementById('modal-tst-toggle').checked;

      AetheriaState.profile = {
        ...AetheriaState.profile,
        name,
        gender,
        birthDate,
        birthTime,
        birthCity,
        timezoneOffsetHours,
        latitude,
        longitude,
        useTrueSolarTime
      };

      closeModal();
      recalculateAllSystems();
      soundEngine.playHarmonicChord();
      showToast(`Natal Profile & Solar Coordinates Updated for ${name}!`);
    });
  }
}

// --- TRUE SOLAR TIME (TST) LIVE CLOCK ---
function setupTrueSolarTimeClock() {
  const clockEl = document.getElementById('header-tst-time');
  const eotEl = document.getElementById('telemetry-eot');
  const lonOffsetEl = document.getElementById('telemetry-lon-offset');
  const netDeltaEl = document.getElementById('telemetry-net-delta');

  function updateClock() {
    const now = new Date();
    const tzOffsetHours = AetheriaState.profile.timezoneOffsetHours || (-now.getTimezoneOffset() / 60);
    const pad = (n) => String(n).padStart(2, '0');
    const nowTimeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const nowDateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    const tst = CalcEngine.calculateTrueSolarTime(
      nowDateStr,
      nowTimeStr,
      AetheriaState.profile.longitude,
      tzOffsetHours
    );

    const timeStr = `${pad(tst.tstDate.getHours())}:${pad(tst.tstDate.getMinutes())}:${pad(tst.tstDate.getSeconds())} TST`;

    if (clockEl) clockEl.textContent = timeStr;

    if (eotEl && lonOffsetEl && netDeltaEl) {
      const formatDelta = (m) => {
        const sign = m >= 0 ? '+' : '-';
        const absM = Math.abs(m);
        const mins = Math.floor(absM);
        const secs = Math.floor((absM - mins) * 60);
        return `${sign}${pad(mins)}m ${pad(secs)}s`;
      };

      eotEl.textContent = formatDelta(tst.eotMinutes);
      lonOffsetEl.textContent = formatDelta(tst.lonOffsetMinutes);
      netDeltaEl.textContent = formatDelta(tst.totalDeltaMinutes);
    }
  }

  updateClock();
  setInterval(updateClock, 1000);
}

// --- SETTINGS FORM INTEGRATION ---
function setupProfileEngine() {
  const form = document.getElementById('settings-profile-form');
  const tstToggle = document.getElementById('setting-tst-toggle');
  const soundToggle = document.getElementById('setting-sound-toggle');
  const resetBtn = document.getElementById('btn-reset-demo-data');

  if (form) {
    const nameInput = document.getElementById('setting-name');
    const bdateInput = document.getElementById('setting-birthdate');
    const btimeInput = document.getElementById('setting-birthtime');
    const cityInput = document.getElementById('setting-city');
    const latInput = document.getElementById('setting-lat');
    const lonInput = document.getElementById('setting-lon');
    const genderInput = document.getElementById('setting-gender');

    if (nameInput) nameInput.value = AetheriaState.profile.name;
    if (bdateInput) bdateInput.value = AetheriaState.profile.birthDate;
    if (btimeInput) btimeInput.value = AetheriaState.profile.birthTime;
    if (cityInput) cityInput.value = AetheriaState.profile.birthCity;
    if (latInput) latInput.value = AetheriaState.profile.latitude;
    if (lonInput) lonInput.value = AetheriaState.profile.longitude;
    if (genderInput) genderInput.value = AetheriaState.profile.gender;
    if (tstToggle) tstToggle.checked = AetheriaState.profile.useTrueSolarTime;
    if (soundToggle) soundToggle.checked = AetheriaState.profile.soundEnabled;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      AetheriaState.profile.name = nameInput.value;
      AetheriaState.profile.birthDate = bdateInput.value;
      AetheriaState.profile.birthTime = btimeInput.value;
      AetheriaState.profile.birthCity = cityInput.value;
      AetheriaState.profile.latitude = parseFloat(latInput.value) || 0;
      AetheriaState.profile.longitude = parseFloat(lonInput.value) || 0;
      AetheriaState.profile.gender = genderInput.value;
      AetheriaState.profile.useTrueSolarTime = tstToggle ? tstToggle.checked : true;
      AetheriaState.profile.soundEnabled = soundToggle ? soundToggle.checked : true;

      recalculateAllSystems();
      soundEngine.playHarmonicChord();
      showToast('Natal profile & solar coordinates synchronized!');
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      AetheriaState.profile = {
        name: 'Astraea Vane',
        birthDate: '1998-08-16',
        birthTime: '11:45:00',
        birthCity: 'Kyoto, Japan',
        latitude: 35.0116,
        longitude: 135.7681,
        timezoneOffsetHours: 9,
        gender: 'Female / Yin',
        useTrueSolarTime: true,
        soundEnabled: true
      };
      localStorage.setItem('aetheria_profile', JSON.stringify(AetheriaState.profile));
      location.reload();
    });
  }
}

// --- FULL SYSTEMS RECALCULATION USING CALC_ENGINE.JS ---
function recalculateAllSystems() {
  // Execute pure offline calculation engine
  AetheriaState.natalPayload = CalcEngine.generateNatalPayload(AetheriaState.profile);

  updateHeaderProfileDisplay();
  renderBaZiChart();
  renderNatalWheel();
  renderZiWeiGrid();
  renderHourlyBaZiClock();
  renderDaYunTimeline();
  updateDashboardScores();
  if (FoundationEngine && typeof FoundationEngine.renderAll === 'function') {
    FoundationEngine.renderAll(AetheriaState.natalPayload);
  }
  if (ProjectionsEngine && typeof ProjectionsEngine.renderAll === 'function') {
    ProjectionsEngine.renderAll();
  }
  if (DashboardEngine && typeof DashboardEngine.renderInitialDashboard === 'function') {
    DashboardEngine.renderInitialDashboard();
  }
}

function updateHeaderProfileDisplay() {
  const avatarGlyph = document.getElementById('header-avatar-glyph');
  const profileName = document.getElementById('header-profile-name');
  const profileSigil = document.getElementById('header-profile-sigil');
  const baziCalcProfileName = document.getElementById('bazi-calc-profile-name');
  const txtSolarPill = document.getElementById('txt-solar-pill');
  const txtLunarPill = document.getElementById('txt-lunar-pill');

  const p = AetheriaState.natalPayload;
  if (!p) return;

  if (avatarGlyph) avatarGlyph.textContent = (p.profile.name || 'S').charAt(0).toUpperCase();
  if (profileName) profileName.textContent = p.profile.name || 'Seeker';

  // EXACT format requested: "[Name] | Sun: ♌ Leo | BaZi: 丙午 Day | True Solar Time: 12:42 PM"
  const dayPillarChars = `${p.bazi.pillars.day.stem.char}${p.bazi.pillars.day.branch.char}`;
  if (profileSigil) {
    profileSigil.textContent = `Sun: ${p.astrology.sun.glyph} ${p.astrology.sun.signName} | BaZi: ${dayPillarChars} Day | TST: ${p.telemetry.trueSolar12Hour}`;
  }

  if (baziCalcProfileName) {
    baziCalcProfileName.textContent = `Seeker: ${p.profile.name} (${p.profile.birthCity} · ${p.bazi.dayMasterResonance})`;
  }

  if (txtSolarPill) {
    txtSolarPill.textContent = `${p.astrology.sun.glyph} Sun in ${p.astrology.sun.signName} ${p.astrology.sun.degreeInSign}°`;
  }

  if (txtLunarPill) {
    txtLunarPill.textContent = `${p.astrology.moon.glyph} Moon in ${p.astrology.moon.signName} (${p.astrology.moonPhase})`;
  }
}

// Update Dashboard metric scores with calculated data
function updateDashboardScores() {
  const p = AetheriaState.natalPayload;
  if (!p) return;

  const dmScoreEl = document.getElementById('dash-day-master-score');
  const dmSubEl = document.getElementById('dash-day-master-sub');
  const hexValEl = document.getElementById('dash-hexagram-val');

  if (dmScoreEl) {
    dmScoreEl.textContent = `${p.bazi.dayMaster.polarity} ${p.bazi.dayMaster.element}`;
  }
  if (dmSubEl) {
    dmSubEl.textContent = `Day Master (${p.bazi.dayMaster.char} ${p.bazi.dayMaster.pinyin}) | Dominant: ${p.bazi.dominantElement}`;
  }
  if (hexValEl && p.iching && p.iching.primaryHex) {
    hexValEl.textContent = `${p.iching.primaryHex.symbol} ${p.iching.primaryHex.name.split('—')[0]}`;
  }

  // Update Five Elements Bar
  const woodBar = document.querySelector('.elem-bar-wood');
  const fireBar = document.querySelector('.elem-bar-fire');
  const earthBar = document.querySelector('.elem-bar-earth');
  const metalBar = document.querySelector('.elem-bar-metal');
  const waterBar = document.querySelector('.elem-bar-water');

  const ep = p.bazi.elementPercentages;
  if (woodBar) { woodBar.style.width = `${ep.Wood}%`; woodBar.title = `Wood: ${ep.Wood}%`; }
  if (fireBar) { fireBar.style.width = `${ep.Fire}%`; fireBar.title = `Fire: ${ep.Fire}%`; }
  if (earthBar) { earthBar.style.width = `${ep.Earth}%`; earthBar.title = `Earth: ${ep.Earth}%`; }
  if (metalBar) { metalBar.style.width = `${ep.Metal}%`; metalBar.title = `Metal: ${ep.Metal}%`; }
  if (waterBar) { waterBar.style.width = `${ep.Water}%`; waterBar.title = `Water: ${ep.Water}%`; }
}

// --- BAZI FOUR PILLARS ENGINE RENDER ---
function renderBaZiChart() {
  const container = document.getElementById('bazi-pillars-render');
  const summaryEl = document.getElementById('bazi-daymaster-summary');
  if (!container) return;

  const p = AetheriaState.natalPayload;
  if (!p) return;

  const pillars = p.bazi.pillars;
  const pillarsList = [pillars.year, pillars.month, pillars.day, pillars.hour];

  container.innerHTML = pillarsList.map(pillar => {
    const stemElemColorClass = `elem-${pillar.stem.element.toLowerCase()}`;
    const branchElemColorClass = `elem-${pillar.branch.element.toLowerCase()}`;
    return `
      <div class="bazi-pillar-column">
        <span class="pillar-name-tag">${pillar.title}</span>
        <div class="stem-branch-box">
          <div class="stem-card">
            <div class="character-chinese ${stemElemColorClass}">${pillar.stem.char}</div>
            <div class="pinyin-element">${pillar.stem.pinyin} (${pillar.stem.polarity} ${pillar.stem.element})</div>
          </div>
          <div class="branch-card">
            <div class="character-chinese ${branchElemColorClass}">${pillar.branch.char}</div>
            <div class="pinyin-element">${pillar.branch.pinyin}</div>
          </div>
        </div>
        <span class="ten-god-tag">${pillar.tenGod}</span>
        <span style="font-size: 0.68rem; color: var(--text-muted);">${pillar.desc}</span>
      </div>
    `;
  }).join('');

  if (summaryEl) {
    const dm = p.bazi.dayMaster;
    summaryEl.innerHTML = `
      Day Master is <strong>${dm.polarity} ${dm.element} (${dm.char} ${dm.pinyin})</strong>. 
      Five Elements Profile: Wood (${p.bazi.elementPercentages.Wood}%), Fire (${p.bazi.elementPercentages.Fire}%), Earth (${p.bazi.elementPercentages.Earth}%), Metal (${p.bazi.elementPercentages.Metal}%), Water (${p.bazi.elementPercentages.Water}%).
      Dominant Element: <strong style="color: var(--gold-light);">${p.bazi.dominantElement}</strong> | Favorable Support: <strong style="color: var(--cyan-cosmic);">${p.bazi.weakestElement}</strong>.
    `;
  }
}

// Hourly BaZi clock (12 Double Hours)
function renderHourlyBaZiClock() {
  const clockContainer = document.getElementById('hourly-bazi-clock');
  if (!clockContainer) return;

  const currentHour = new Date().getHours();

  const doubleHours = [
    { name: "Zi (子)", range: "23:00 - 01:00", elem: "Water 💧", highlight: currentHour >= 23 || currentHour < 1 },
    { name: "Chou (丑)", range: "01:00 - 03:00", elem: "Earth 🪨", highlight: currentHour >= 1 && currentHour < 3 },
    { name: "Yin (寅)", range: "03:00 - 05:00", elem: "Wood 🌲", highlight: currentHour >= 3 && currentHour < 5 },
    { name: "Mao (卯)", range: "05:00 - 07:00", elem: "Wood 🌿", highlight: currentHour >= 5 && currentHour < 7 },
    { name: "Chen (辰)", range: "07:00 - 09:00", elem: "Earth 🏔️", highlight: currentHour >= 7 && currentHour < 9 },
    { name: "Si (巳)", range: "09:00 - 11:00", elem: "Fire 🕯️", highlight: currentHour >= 9 && currentHour < 11 },
    { name: "Wu (午)", range: "11:00 - 13:00", elem: "Fire 🔥", highlight: currentHour >= 11 && currentHour < 13 },
    { name: "Wei (未)", range: "13:00 - 15:00", elem: "Earth 🏜️", highlight: currentHour >= 13 && currentHour < 15 },
    { name: "Shen (申)", range: "15:00 - 17:00", elem: "Metal ⚔️", highlight: currentHour >= 15 && currentHour < 17 },
    { name: "You (酉)", range: "17:00 - 19:00", elem: "Metal 🪙", highlight: currentHour >= 17 && currentHour < 19 },
    { name: "Xu (戌)", range: "19:00 - 21:00", elem: "Earth 🧱", highlight: currentHour >= 19 && currentHour < 21 },
    { name: "Hai (亥)", range: "21:00 - 23:00", elem: "Water 🌊", highlight: currentHour >= 21 && currentHour < 23 }
  ];

  clockContainer.innerHTML = doubleHours.map(dh => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; border-radius: 6px; font-size: 0.78rem; background: ${dh.highlight ? 'rgba(212, 175, 55, 0.15)' : 'var(--bg-surface)'}; border: 1px solid ${dh.highlight ? 'var(--gold-primary)' : 'transparent'};">
      <span style="font-weight: 600; color: ${dh.highlight ? 'var(--gold-light)' : 'var(--text-secondary)'};">${dh.name}</span>
      <span style="color: var(--text-muted); font-family: var(--font-mono);">${dh.range}</span>
      <span>${dh.elem}</span>
    </div>
  `).join('');
}

// Da Yun (10-Year Major Luck Cycles)
function renderDaYunTimeline() {
  const container = document.getElementById('dayun-timeline-container');
  if (!container) return;

  const cycles = [
    { age: "8 - 17", stemBranch: "辛 酉 (Metal Rooster)", status: "Completed", color: "var(--elem-metal)" },
    { age: "18 - 27", stemBranch: "壬 戌 (Water Dog)", status: "Completed", color: "var(--elem-water)" },
    { age: "28 - 37", stemBranch: "癸 亥 (Water Pig)", status: "ACTIVE NOW", color: "var(--cyan-cosmic)", active: true },
    { age: "38 - 47", stemBranch: "甲 子 (Wood Rat)", status: "Upcoming", color: "var(--elem-wood)" },
    { age: "48 - 57", stemBranch: "乙 丑 (Wood Ox)", status: "Upcoming", color: "var(--elem-wood)" },
    { age: "58 - 67", stemBranch: "丙 寅 (Fire Tiger)", status: "Upcoming", color: "var(--elem-fire)" }
  ];

  container.innerHTML = cycles.map(c => `
    <div style="background: var(--bg-surface); padding: 14px; border-radius: var(--radius-md); border: 1px solid ${c.active ? 'var(--gold-primary)' : 'var(--gold-border)'}; text-align: center; box-shadow: ${c.active ? '0 0 16px var(--gold-glow)' : 'none'};">
      <div style="font-size: 0.72rem; color: ${c.active ? 'var(--gold-primary)' : 'var(--text-muted)'}; font-weight: 700;">Age ${c.age}</div>
      <div style="font-size: 1.1rem; font-weight: 800; color: ${c.color}; margin: 6px 0;">${c.stemBranch}</div>
      <div style="font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; display: inline-block; background: ${c.active ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.05)'}; color: ${c.active ? 'var(--gold-light)' : 'var(--text-muted)'};">${c.status}</div>
    </div>
  `).join('');
}

// --- WESTERN NATAL WHEEL & PLACEMENTS ---
function renderNatalWheel() {
  const svg = document.getElementById('natal-wheel-svg');
  const table = document.getElementById('natal-placements-table');
  if (!svg || !table) return;

  const p = AetheriaState.natalPayload;
  const planets = p ? p.astrology.planets : [];

  svg.innerHTML = `
    <!-- Outer Zodiac Ring -->
    <circle cx="150" cy="150" r="135" fill="none" stroke="rgba(212,175,55,0.3)" stroke-width="1.5"/>
    <circle cx="150" cy="150" r="115" fill="none" stroke="rgba(212,175,55,0.15)" stroke-width="1"/>
    <circle cx="150" cy="150" r="85" fill="rgba(18,22,32,0.6)" stroke="rgba(212,175,55,0.2)" stroke-width="1"/>
    <circle cx="150" cy="150" r="30" fill="rgba(10,12,16,0.9)" stroke="var(--gold-primary)" stroke-width="1"/>

    <!-- Aspect Lines (Grand Trine & Oppositions) -->
    <polygon points="150,45 225,185 75,185" fill="rgba(0,229,255,0.06)" stroke="var(--cyan-cosmic)" stroke-width="1" stroke-dasharray="2,2"/>
    <line x1="150" y1="45" x2="150" y2="255" stroke="rgba(239,68,68,0.5)" stroke-width="1"/>
    <line x1="60" y1="120" x2="240" y2="180" stroke="rgba(212,175,55,0.6)" stroke-width="1"/>

    <!-- Center Sigil -->
    <text x="150" y="155" text-anchor="middle" fill="var(--gold-light)" font-size="14" font-family="Cinzel">☉</text>

    <!-- Planetary Glyphs on Wheel -->
    <text x="150" y="40" text-anchor="middle" fill="#facc15" font-size="16">☉</text>
    <text x="235" y="185" text-anchor="middle" fill="#60a5fa" font-size="16">☽</text>
    <text x="65" y="185" text-anchor="middle" fill="#c084fc" font-size="16">☿</text>
    <text x="75" y="105" text-anchor="middle" fill="#f472b6" font-size="16">♀</text>
    <text x="225" y="105" text-anchor="middle" fill="#ef4444" font-size="16">♂</text>
    <text x="150" y="270" text-anchor="middle" fill="#38bdf8" font-size="16">♃</text>
  `;

  if (planets.length > 0) {
    table.innerHTML = planets.map(pl => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid rgba(212, 175, 55, 0.12); font-size: 0.82rem;">
        <span style="font-weight: 700; color: var(--gold-light);">${pl.glyph} ${pl.name}</span>
        <span style="color: var(--text-pure);">${pl.formatted}</span>
        <span style="color: var(--text-secondary);">${pl.house}</span>
        <span style="color: var(--cyan-cosmic); font-size: 0.72rem;">${pl.dignity}</span>
      </div>
    `).join('');
  }
}

// --- ZI WEI DOU SHU 12-PALACES MATRIX ---
function renderZiWeiGrid() {
  const grid = document.getElementById('ziwei-palaces-grid');
  if (!grid) return;

  const palaces = [
    { title: "Parents (父母宫)", branch: "Si (巳)", stars: ["Tian Liang (Heavenly Beam)", "Wenchang"], sihua: "Lu (禄)" },
    { title: "Karma / Joy (福德宫)", branch: "Wu (午)", stars: ["Zi Wei (Emperor)", "Tian Fu"], sihua: "" },
    { title: "Real Estate (田宅宫)", branch: "Wei (未)", stars: ["Tai Yin (Moon)", "Tian Tong"], sihua: "Ke (科)" },
    { title: "Career (官禄宫)", branch: "Shen (申)", stars: ["Wu Qu (General)", "Qi Sha"], sihua: "Quan (权)" },
    { title: "Life Destiny (命宫)", branch: "Chen (辰)", stars: ["Tan Lang (Wolf)", "Lian Zhen"], sihua: "Ji (忌)", isLife: true },
    { title: "Friends (奴仆宫)", branch: "You (酉)", stars: ["Ju Men (Giant Gate)", "Ling Xing"], sihua: "" },
    { title: "Siblings (兄弟宫)", branch: "Mao (卯)", stars: ["Tian Xiang (Minister)", "Zuo Fu"], sihua: "" },
    { title: "Travel (迁移宫)", branch: "Xu (戌)", stars: ["Po Jun (Destroyer)", "Huo Xing"], sihua: "" },
    { title: "Spouse (夫妻宫)", branch: "Yin (寅)", stars: ["Tai Yang (Sun)", "You Bi"], sihua: "" },
    { title: "Children (子女宫)", branch: "Chou (丑)", stars: ["Tian Ji (Strategist)", "Tian Kui"], sihua: "" },
    { title: "Wealth (财帛宫)", branch: "Zi (子)", stars: ["Tian Fu (Vault)", "Lu Cun"], sihua: "Lu (禄)" },
    { title: "Health (疾厄宫)", branch: "Hai (亥)", stars: ["Wen Qu", "Tian Yue"], sihua: "" }
  ];

  grid.innerHTML = `
    <!-- Top Row (4 Palaces) -->
    ${renderPalaceCell(palaces[0])}
    ${renderPalaceCell(palaces[1])}
    ${renderPalaceCell(palaces[2])}
    ${renderPalaceCell(palaces[3])}

    <!-- Middle Row Left -->
    ${renderPalaceCell(palaces[4])}

    <!-- Center Bureau of Destinies -->
    <div class="palace-cell center-cell">
      <div style="font-family: var(--font-serif-display); color: var(--gold-light); font-size: 1.15rem; font-weight: 700; margin-bottom: 6px;">
        紫微斗数 · 天盘
      </div>
      <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 4px;">
        Five Elements Bureau: <strong>Water 2nd Bureau (水二局)</strong>
      </div>
      <div style="font-size: 0.75rem; color: var(--gold-primary);">
        Life Master: Tan Lang | Body Master: Huo Xing
      </div>
    </div>

    <!-- Middle Row Right -->
    ${renderPalaceCell(palaces[5])}

    <!-- Middle Row 2 Left -->
    ${renderPalaceCell(palaces[6])}
    <!-- Middle Row 2 Right -->
    ${renderPalaceCell(palaces[7])}

    <!-- Bottom Row (4 Palaces) -->
    ${renderPalaceCell(palaces[8])}
    ${renderPalaceCell(palaces[9])}
    ${renderPalaceCell(palaces[10])}
    ${renderPalaceCell(palaces[11])}
  `;
}

function renderPalaceCell(p) {
  return `
    <div class="palace-cell ${p.isLife ? 'border-gold' : ''}">
      <div class="palace-title" style="${p.isLife ? 'color: var(--cyan-cosmic); font-weight: 800;' : ''}">
        ${p.title} · ${p.branch}
      </div>
      <div class="major-stars-list">
        ${p.stars.map(s => `<span class="star-major">${s}</span>`).join('')}
        ${p.sihua ? `<span class="star-sihua">${p.sihua}</span>` : ''}
      </div>
      <div class="minor-stars-list">San Fang Si Zheng Harmony</div>
    </div>
  `;
}

// --- RITUALS ENGINE (TAROT, RUNES, I CHING) ---
function setupRituals() {
  RitualsEngine.init(soundEngine);
}

// Quick Oracle button on top header
function triggerQuickOracle() {
  const randomCard = RitualsEngine.TAROT_DECK[Math.floor(Math.random() * RitualsEngine.TAROT_DECK.length)];
  showToast(`✦ Oracle Whisper: ${randomCard.name} — ${randomCard.upright}`);
}

// --- ONEIROMANCY & DREAM JOURNAL ---
function setupDreamJournal() {
  OneiromancyEngine.init(soundEngine);
}


// --- AI CONSULTATION HUB ---
function setupAIConsultation() {
  ChatEngine.init(soundEngine);
}

// --- CUSTOM SCHOOL MANAGER ---
function setupCustomSchools() {
  CustomSchoolManager.init(soundEngine);
}

// --- API DISPATCHER & VAULT BACKUP SETTINGS ---
function setupAPISettingsAndVault() {
  APIService.init();

  // API Config Form
  const apiForm = document.getElementById('settings-api-form');
  const providerSelect = document.getElementById('setting-api-provider');
  const webhookFields = document.getElementById('webhook-config-fields');
  const webhookUrlInput = document.getElementById('setting-webhook-url');
  const webhookTokenInput = document.getElementById('setting-webhook-token');

  if (providerSelect && webhookFields) {
    // Sync current values from APIService
    providerSelect.value = APIService.config.provider || 'gemini';
    if (webhookUrlInput) webhookUrlInput.value = APIService.config.webhookUrl || '';
    if (webhookTokenInput) webhookTokenInput.value = APIService.config.webhookAuthToken || '';
    webhookFields.style.display = providerSelect.value === 'webhook' ? 'block' : 'none';

    providerSelect.addEventListener('change', (e) => {
      webhookFields.style.display = e.target.value === 'webhook' ? 'block' : 'none';
      if (soundEngine) soundEngine.playChime(560, 0.2);
    });
  }

  if (apiForm) {
    apiForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const provider = providerSelect.value;
      const webhookUrl = webhookUrlInput ? webhookUrlInput.value.trim() : '';
      const webhookAuthToken = webhookTokenInput ? webhookTokenInput.value.trim() : '';

      APIService.saveConfig({
        provider,
        webhookUrl,
        webhookAuthToken
      });

      if (soundEngine) soundEngine.playHarmonicChord();
      showToast(`API Dispatcher updated: ${provider === 'webhook' ? 'Dify/n8n Webhook Active' : 'Gemini 3.1 Pro Server Active'}`);
    });
  }

  // Vault Export
  const exportBtn = document.getElementById('btn-export-vault-json');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const vaultData = {
        meta: {
          app: "Aetheria Esoteric Fate Matrix",
          version: "3.1.0",
          exportDate: new Date().toISOString()
        },
        profile: AetheriaState.profile,
        customSchools: CustomSchoolManager.schools || [],
        dreams: AetheriaState.dreams || [],
        apiConfig: APIService.config || {}
      };

      const blob = new Blob([JSON.stringify(vaultData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aetheria-vault-${AetheriaState.profile.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (soundEngine) soundEngine.playHarmonicChord();
      showToast('Aetheria Vault JSON exported successfully!');
    });
  }

  // Vault Import
  const triggerImportBtn = document.getElementById('btn-trigger-import-vault');
  const fileInput = document.getElementById('file-import-vault-json');
  const importStatus = document.getElementById('import-file-status');

  if (triggerImportBtn && fileInput) {
    triggerImportBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (imported.profile) {
            AetheriaState.profile = { ...AetheriaState.profile, ...imported.profile };
            localStorage.setItem('aetheria_profile', JSON.stringify(AetheriaState.profile));
          }
          if (imported.customSchools && Array.isArray(imported.customSchools)) {
            CustomSchoolManager.schools = imported.customSchools;
            CustomSchoolManager.saveSchools();
            CustomSchoolManager.renderCustomSchoolsGrid();
          }
          if (imported.dreams && Array.isArray(imported.dreams)) {
            AetheriaState.dreams = imported.dreams;
            localStorage.setItem('aetheria_dreams', JSON.stringify(AetheriaState.dreams));
            if (OneiromancyEngine && typeof OneiromancyEngine.renderDreamList === 'function') {
              OneiromancyEngine.renderDreamList();
            }
          }
          if (imported.apiConfig) {
            APIService.saveConfig(imported.apiConfig);
          }

          recalculateAllSystems();
          if (soundEngine) soundEngine.playHarmonicChord();
          if (importStatus) importStatus.textContent = `Restored: ${file.name}`;
          showToast(`Vault successfully restored from ${file.name}!`);
        } catch (err) {
          console.error('Failed to parse vault file:', err);
          alert('Invalid Aetheria JSON Vault file.');
        }
      };
      reader.readAsText(file);
    });
  }
}

// --- TOAST ALERTS ---
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span style="color: var(--gold-primary);">✦</span> ${message}`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
