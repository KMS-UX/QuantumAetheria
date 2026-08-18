/**
 * AETHERIA — Oneiromancy & Dream Analysis Engine (`oneiromancy.js`)
 * 
 * Manages:
 * 1. Dream Entry Form: Title, Date, Clarity Rating (1-5 celestial stars), Emotional Tone, Dream Narrative, Symbols/Tags.
 * 2. Past Dream Log: Filterable & searchable chronicle of past recorded dreams in localStorage.
 * 3. Multi-School Dream Synthesis: Triggers AI High-Thinking / Multi-Layered Oracle analysis
 *    (combining Jungian Depth Psychology, Zhou Gong Chinese Dream Metaphysics, and Occult Astral Symbolism).
 */

export const OneiromancyEngine = {
  dreams: [],
  activeFilterTag: 'all',
  searchQuery: '',
  soundEngine: null,

  DEFAULT_DREAMS: [
    {
      id: 'dream-1',
      title: 'The Obsidian Tower & the Golden Serpent',
      date: '2026-08-15',
      clarity: 5,
      emotion: 'Alchemical / Transformative',
      narrative: 'I found myself standing before a towering obsidian obelisk rising from a calm mercurial ocean. A serpent with radiant golden scales wrapped around the pillar, whispering equations of celestial mechanics before dissolving into a shower of starlight.',
      tags: ['Serpent', 'Obsidian Tower', 'Mercurial Ocean', 'Equations'],
      interpretation: `✦ Jungian Depth Archetype: The Golden Serpent signifies the Kundalini awakening and the integration of unconscious instincts into conscious solar gnosis. The Obsidian Obelisk acts as the Axis Mundi.\n✦ Zhou Gong (周公解梦) Auspicious Reading: Dreaming of golden snakes ascending towers indicates grand promotion, scholastic breakthroughs, and the dissolution of hidden obstacles.\n✦ Occult & Astral Correspondences: Resonates with 8th House transformational transits and the alchemical stage of Citrinitas (Golden Illumination).\n✦ Dream Amulet & Action: Wear gold or lapis lazuli; channel recent nighttime insights into writing down foundational creative blueprints.`,
      modelUsed: 'Gemini 3.1 Pro High Thinking'
    },
    {
      id: 'dream-2',
      title: 'Flying Over the Lapis Mountain Pass',
      date: '2026-08-11',
      clarity: 4,
      emotion: 'Euphoric / Lucid',
      narrative: 'Soaring effortlessly over deep lapis lazuli canyons at twilight. I realized I was dreaming and deliberately altered the wind currents to summon a constellation of violet phoenixes.',
      tags: ['Lucid Flying', 'Lapis Canyon', 'Phoenix', 'Twilight'],
      interpretation: `✦ Archetypal Analysis: Conscious lucid flight represents transcendent ego sovereignty and liberation from restrictive psychological narratives.\n✦ Zhou Gong (周公解梦): Flying with avian spirits heralds uninhibited career ascendancy and widespread public recognition.\n✦ Alchemical Stage: Albedo (Whiteness & Lunar Clarity) transitioning into Rubedo.\n✦ Actionable Insight: Trust your expansive visionary compass; you are no longer bound by past ancestral limits.`,
      modelUsed: 'Aetheria Cosmic Oracle'
    }
  ],

  init(soundEngine) {
    this.soundEngine = soundEngine;
    this.loadDreams();
    this.setupForm();
    this.setupSearchAndFilter();
    this.renderDreamList();
  },

  loadDreams() {
    try {
      const stored = localStorage.getItem('aetheria_dream_journal');
      if (stored) {
        this.dreams = JSON.parse(stored);
      } else {
        this.dreams = [...this.DEFAULT_DREAMS];
        this.saveDreams();
      }
    } catch (e) {
      console.warn('Could not load dream journal from storage', e);
      this.dreams = [...this.DEFAULT_DREAMS];
    }
  },

  saveDreams() {
    try {
      localStorage.setItem('aetheria_dream_journal', JSON.stringify(this.dreams));
    } catch (e) {
      console.warn('Could not save dream journal to storage', e);
    }
  },

  setupForm() {
    const form = document.getElementById('dream-form');
    const clarityInput = document.getElementById('dream-lucidity');
    const clarityVal = document.getElementById('dream-lucidity-val');

    if (clarityInput && clarityVal) {
      const clarityLabels = [
        'Level 1: Faint & Fragmented',
        'Level 2: Vague Dream Memory',
        'Level 3: Aware of Dream State',
        'Level 4: Vivid & Highly Emotional',
        'Level 5: Full Hyper-Lucid Control'
      ];

      clarityInput.addEventListener('input', () => {
        const val = parseInt(clarityInput.value, 10);
        clarityVal.textContent = clarityLabels[val - 1] || `Level ${val}`;
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRecordDream();
      });
    }
  },

  setupSearchAndFilter() {
    const searchInput = document.getElementById('dream-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderDreamList();
      });
    }

    const tagChipsContainer = document.getElementById('dream-tag-filter-chips');
    if (tagChipsContainer) {
      tagChipsContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.dream-filter-chip');
        if (!chip) return;

        tagChipsContainer.querySelectorAll('.dream-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        this.activeFilterTag = chip.dataset.tag || 'all';
        if (this.soundEngine) this.soundEngine.playChime(640, 0.15);
        this.renderDreamList();
      });
    }
  },

  async handleRecordDream() {
    const titleEl = document.getElementById('dream-title');
    const dateEl = document.getElementById('dream-date');
    const emotionEl = document.getElementById('dream-emotion');
    const clarityEl = document.getElementById('dream-lucidity');
    const tagsEl = document.getElementById('dream-tags');
    const narrativeEl = document.getElementById('dream-content');
    const submitBtn = document.getElementById('btn-save-dream');

    if (!titleEl || !narrativeEl) return;

    const title = titleEl.value.trim();
    const narrative = narrativeEl.value.trim();
    const date = dateEl ? dateEl.value : new Date().toISOString().split('T')[0];
    const emotion = emotionEl ? emotionEl.value : 'Mysterious & Numinous';
    const clarity = clarityEl ? parseInt(clarityEl.value, 10) : 3;
    const rawTags = tagsEl ? tagsEl.value : '';
    const tags = rawTags.split(',').map(t => t.trim()).filter(Boolean);

    if (!title || !narrative) return;

    const newDream = {
      id: `dream-${Date.now()}`,
      title,
      date,
      clarity,
      emotion,
      narrative,
      tags: tags.length ? tags : ['Nocturnal Vision', 'Astral Flow'],
      interpretation: '',
      modelUsed: 'Pending Scrying'
    };

    if (this.soundEngine) this.soundEngine.playChime(720, 0.25);

    // Show loading state on button
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Scrying Astral Dimensions...';
    }

    // Call server AI endpoint for multi-school interpretation
    try {
      const interp = await this.scryDreamWithAI(newDream);
      newDream.interpretation = interp.text;
      newDream.modelUsed = interp.model;
    } catch (err) {
      console.warn('Dream AI consultation failed, using local synthesis engine', err);
      newDream.interpretation = this.generateLocalInterpretation(newDream);
      newDream.modelUsed = 'Aetheria Local Sage';
    }

    this.dreams.unshift(newDream);
    this.saveDreams();

    // Reset form
    titleEl.value = '';
    narrativeEl.value = '';
    if (tagsEl) tagsEl.value = '';

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i data-lucide="save"></i> Record & Scry Dream';
    }

    this.renderDreamList();
    this.displayActiveInterpretation(newDream);

    if (window.lucide) window.lucide.createIcons();
  },

  async scryDreamWithAI(dream) {
    const userProfile = window.AetheriaState ? window.AetheriaState.profile : {};
    const res = await fetch('/api/divination/dream-interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dreamTitle: dream.title,
        dreamText: dream.narrative,
        emotion: dream.emotion,
        lucidityRating: dream.clarity,
        tags: dream.tags,
        userProfile
      })
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return {
      text: data.interpretation || 'Dream scryed successfully.',
      model: data.modelUsed || 'Gemini 3.1 Pro'
    };
  },

  generateLocalInterpretation(dream) {
    return `✦ Archetypal Theme: "${dream.title}" reflects an activation of the High Transpersonal Self and active threshold navigation.\n✦ Zhou Gong (周公解梦) Reading: Water and nocturnal visions with a "${dream.emotion}" tone indicate rich subconscious fertility and sudden creative breakthroughs.\n✦ Alchemical Stage: Albedo (Purification & Awakening of Inner Vision).\n✦ Integration Ritual: Meditate upon waking during the morning solar hour to crystalize actionable creative inspiration.`;
  },

  displayActiveInterpretation(dream) {
    const resultBox = document.getElementById('dream-interpretation-result');
    const heading = document.getElementById('interp-heading');
    const body = document.getElementById('interp-content-body');
    const modelTag = document.getElementById('interp-model-tag');

    if (!resultBox || !body) return;

    if (heading) heading.textContent = `Alchemical Reading: ${dream.title}`;
    if (modelTag) modelTag.textContent = dream.modelUsed || 'Gemini 3.1 Pro High Thinking';
    body.textContent = dream.interpretation;

    resultBox.style.display = 'block';
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  renderDreamList() {
    const container = document.getElementById('dream-journal-list');
    if (!container) return;

    let filtered = [...this.dreams];

    if (this.activeFilterTag !== 'all') {
      filtered = filtered.filter(d => {
        if (this.activeFilterTag === 'lucid') return d.clarity >= 4;
        if (this.activeFilterTag === 'alchemical') return (d.emotion || '').toLowerCase().includes('alchemical');
        if (this.activeFilterTag === 'prophetic') return (d.emotion || '').toLowerCase().includes('prophetic');
        if (this.activeFilterTag === 'shadow') return (d.emotion || '').toLowerCase().includes('anxious') || (d.emotion || '').toLowerCase().includes('shadow');
        return (d.tags || []).some(t => t.toLowerCase().includes(this.activeFilterTag));
      });
    }

    if (this.searchQuery) {
      filtered = filtered.filter(d => 
        (d.title || '').toLowerCase().includes(this.searchQuery) ||
        (d.narrative || '').toLowerCase().includes(this.searchQuery) ||
        (d.tags || []).some(t => t.toLowerCase().includes(this.searchQuery))
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 32px 16px; color: var(--text-muted);">
          <i data-lucide="moon-star" style="width: 32px; height: 32px; margin-bottom: 8px; color: var(--gold-light); opacity: 0.5;"></i>
          <p>No nocturnal chronicles match your query. Record a new dream above.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = filtered.map(d => {
      const stars = '★'.repeat(d.clarity) + '☆'.repeat(5 - d.clarity);
      return `
        <div class="dream-entry-card" data-dream-id="${d.id}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
            <div>
              <h4 style="font-family: var(--font-serif-display); color: var(--gold-light); font-size: 1.05rem;">
                ${d.title}
              </h4>
              <span style="font-size: 0.72rem; color: var(--text-muted);">${d.date} · <span style="color: var(--gold-primary);">${stars}</span></span>
            </div>
            <span class="badge-pill" style="background: rgba(138, 43, 226, 0.12); color: var(--violet-light); border-color: rgba(138, 43, 226, 0.25);">
              ${d.emotion}
            </span>
          </div>

          <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.55; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${d.narrative}
          </p>

          <div class="dream-tags-row">
            ${(d.tags || []).map(t => `<span class="dream-tag">#${t}</span>`).join('')}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
            <button class="btn-secondary btn-inspect-dream" data-dream-id="${d.id}" style="padding: 4px 10px; font-size: 0.76rem;">
              <i data-lucide="sparkles"></i> View Oracle Scrying
            </button>
            <button class="btn-delete-dream" data-dream-id="${d.id}" style="background: transparent; border: none; color: #ef4444; font-size: 0.75rem; cursor: pointer; opacity: 0.7;">
              <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listeners to cards
    container.querySelectorAll('.btn-inspect-dream').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.dreamId;
        const d = this.dreams.find(item => item.id === id);
        if (d) {
          if (this.soundEngine) this.soundEngine.playChime(640, 0.2);
          this.displayActiveInterpretation(d);
        }
      });
    });

    container.querySelectorAll('.btn-delete-dream').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.dreamId;
        this.dreams = this.dreams.filter(item => item.id !== id);
        this.saveDreams();
        this.renderDreamList();
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }
};

if (typeof window !== 'undefined') {
  window.OneiromancyEngine = OneiromancyEngine;
}
