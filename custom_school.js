/**
 * AETHERIA — Custom Divination School Manager (`custom_school.js`)
 * 
 * Provides:
 * - Interactive UI to define proprietary divination systems (Elements, Archetypes, Weightings, Prompt Injection Rules).
 * - Full CRUD persistence in localStorage.
 * - Dynamic injection into the Navigation router, Oracle agents, and Consultation chamber.
 * - Import / Export of Custom Divination Systems as JSON.
 */

export const CustomSchoolManager = {
  schools: [],

  // Default seed systems for rich demonstration
  defaultSchools: [
    {
      id: 'geomancy-renaissance',
      name: 'Renaissance Geomancy',
      icon: '⛰️',
      category: 'Earth Divination',
      elements: ['Via', 'Populus', 'Fortuna Major', 'Fortuna Minor', 'Acquisitio', 'Amissio', 'Laetitia', 'Tristitia'],
      weightings: 'Earth: 40%, Fire: 25%, Air: 20%, Water: 15%',
      rules: 'Use 16 Geomantic Figures based on 4-line binary dots. When consulting on land, real estate, or structural stability, increase Earth weight by +30%. Calculate the Judge and Two Witnesses for all binary horary questions.',
      active: true,
      created: '2026-08-01T12:00:00.000Z'
    },
    {
      id: 'runic-futhark',
      name: 'Elder Futhark Runes',
      icon: 'ᚠ',
      category: 'Nordic Shamanism',
      elements: ['Fehu (Wealth)', 'Uruz (Strength)', 'Thurisaz (Gateway)', 'Ansuz (Signals)', 'Raidho (Journey)', 'Kenaz (Torch)', 'Gebo (Gift)', 'Wunjo (Joy)'],
      weightings: 'Wyrd Matrix: 50%, Elemental Norns: 30%, Shadow Staves: 20%',
      rules: 'Synthesize the three Aetts (Freya, Heimdall, Tyr) with current solar ingress. If Thurisaz or Hagalaz appears, caution the seeker against impulsive investments or sharp words during Mars squares.',
      active: true,
      created: '2026-08-05T14:30:00.000Z'
    }
  ],

  init(soundEngine) {
    this.soundEngine = soundEngine;
    this.loadSchools();
    this.renderCustomSchoolsGrid();
    this.bindEvents();
    this.injectIntoOracleList();
  },

  loadSchools() {
    try {
      const stored = localStorage.getItem('aetheria_custom_schools');
      if (stored) {
        this.schools = JSON.parse(stored);
      } else {
        this.schools = [...this.defaultSchools];
        this.saveSchools();
      }
    } catch (e) {
      console.warn('Error loading custom schools:', e);
      this.schools = [...this.defaultSchools];
    }
  },

  saveSchools() {
    localStorage.setItem('aetheria_custom_schools', JSON.stringify(this.schools));
    this.injectIntoOracleList();
  },

  getCombinedCustomRules() {
    return this.schools
      .filter(s => s.active)
      .map(s => `[CUSTOM SCHOOL: ${s.name} (${s.icon})]\nElements/Archetypes: ${s.elements.join(', ')}\nWeightings: ${s.weightings}\nRules: ${s.rules}`)
      .join('\n\n');
  },

  renderCustomSchoolsGrid() {
    const gridEl = document.getElementById('custom-schools-grid');
    if (!gridEl) return;

    if (this.schools.length === 0) {
      gridEl.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 48px; text-align: center; background: var(--bg-surface); border: 1px dashed var(--gold-border); border-radius: var(--radius-lg);">
          <div style="font-size: 2.5rem; margin-bottom: 12px;">📜</div>
          <h3 style="color: var(--gold-light); font-size: 1.15rem; margin-bottom: 6px;">No Custom Divination Systems Defined</h3>
          <p style="color: var(--text-muted); font-size: 0.88rem; max-width: 460px; margin: 0 auto 18px auto;">
            Create your own proprietary oracle models, custom elemental weighting, and specific prompt injection rules to be seamlessly synthesized by the AI Master Oracle.
          </p>
          <button class="btn-primary" id="btn-empty-create-school">
            <i data-lucide="plus"></i> Define Your First System
          </button>
        </div>
      `;
      const btnEmpty = document.getElementById('btn-empty-create-school');
      if (btnEmpty) btnEmpty.addEventListener('click', () => this.openSchoolModal());
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    gridEl.innerHTML = this.schools.map((school, idx) => {
      const elementsBadges = school.elements
        .slice(0, 5)
        .map(el => `<span class="badge-pill badge-gold" style="font-size: 0.72rem; padding: 2px 8px;">${el}</span>`)
        .join(' ');
      const extraCount = school.elements.length > 5 ? `<span class="badge-pill" style="font-size: 0.72rem; padding: 2px 6px;">+${school.elements.length - 5} more</span>` : '';

      return `
        <div class="card custom-school-card" data-school-id="${school.id}" style="display: flex; flex-direction: column; justify-content: space-between; border-color: ${school.active ? 'var(--gold-border-bright)' : 'var(--gold-border)'};">
          <div>
            <div class="card-header" style="margin-bottom: 12px; padding-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-card-elevated); border: 1.5px solid var(--gold-primary); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                  ${school.icon || '🔮'}
                </div>
                <div>
                  <div style="font-size: 1.05rem; font-weight: 700; color: var(--gold-light);">${school.name}</div>
                  <div style="font-size: 0.72rem; color: var(--cyan-cosmic); text-transform: uppercase; letter-spacing: 0.05em;">${school.category || 'Proprietary System'}</div>
                </div>
              </div>
              <label style="position: relative; display: inline-block; width: 38px; height: 20px; margin-left: auto;">
                <input type="checkbox" class="school-active-toggle" data-idx="${idx}" ${school.active ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: ${school.active ? 'var(--gold-primary)' : '#334155'}; border-radius: 34px; transition: .3s;"></span>
              </label>
            </div>

            <div style="margin-bottom: 12px;">
              <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; margin-bottom: 6px;">Core Elements & Archetypes:</div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                ${elementsBadges} ${extraCount}
              </div>
            </div>

            <div style="margin-bottom: 12px; background: rgba(0, 0, 0, 0.25); padding: 10px; border-radius: var(--radius-sm); border: 1px solid rgba(255, 255, 255, 0.04);">
              <div style="font-size: 0.72rem; color: var(--gold-light); font-weight: 700; margin-bottom: 2px;">⚡ Weighting & Formula:</div>
              <div style="font-size: 0.78rem; font-family: var(--font-mono); color: #cbd5e1;">${school.weightings || 'Uniform distribution (1.0x)'}</div>
            </div>

            <div>
              <div style="font-size: 0.72rem; color: var(--gold-light); font-weight: 700; margin-bottom: 4px;">📜 AI Prompt Injection Directives:</div>
              <p style="font-size: 0.80rem; color: var(--text-secondary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                ${school.rules}
              </p>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 18px; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.06);">
            <button class="btn-secondary btn-edit-school" data-idx="${idx}" style="padding: 5px 12px; font-size: 0.78rem;">
              <i data-lucide="edit-3"></i> Edit Rules
            </button>
            <button class="btn-secondary btn-delete-school" data-idx="${idx}" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(239, 68, 68, 0.3); color: #fca5a5;">
              <i data-lucide="trash-2"></i> Delete
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  bindEvents() {
    const btnOpen = document.getElementById('btn-open-create-school');
    if (btnOpen) {
      btnOpen.addEventListener('click', () => this.openSchoolModal());
    }

    // Grid interaction delegation
    const gridEl = document.getElementById('custom-schools-grid');
    if (gridEl) {
      gridEl.addEventListener('click', (e) => {
        const target = e.target.closest('button, input');
        if (!target) return;

        if (target.classList.contains('btn-edit-school')) {
          const idx = parseInt(target.dataset.idx, 10);
          this.openSchoolModal(this.schools[idx], idx);
        } else if (target.classList.contains('btn-delete-school')) {
          const idx = parseInt(target.dataset.idx, 10);
          this.deleteSchool(idx);
        } else if (target.classList.contains('school-active-toggle')) {
          const idx = parseInt(target.dataset.idx, 10);
          this.schools[idx].active = target.checked;
          this.saveSchools();
          this.renderCustomSchoolsGrid();
          if (this.soundEngine) this.soundEngine.playChime(600, 0.1);
        }
      });
    }

    this.ensureModalExists();
  },

  ensureModalExists() {
    let modalEl = document.getElementById('custom-school-modal-backdrop');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'custom-school-modal-backdrop';
      modalEl.className = 'modal-backdrop';
      modalEl.innerHTML = `
        <div class="modal-dialog" role="dialog" aria-modal="true" style="max-width: 580px;">
          <div class="modal-header">
            <div class="modal-title-group">
              <div class="modal-title-icon" style="background: rgba(212, 175, 55, 0.15); color: var(--gold-light);">
                <i data-lucide="sparkles"></i>
              </div>
              <div>
                <h3 class="modal-title" id="custom-school-modal-title">Define Custom Divination System</h3>
                <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">Injects proprietary archetypes and synthesis rules directly into the Master AI Oracle.</p>
              </div>
            </div>
            <button class="modal-close-btn" id="btn-custom-school-modal-close" aria-label="Close">
              <i data-lucide="x" style="width: 20px; height: 20px;"></i>
            </button>
          </div>

          <form id="custom-school-modal-form">
            <div class="modal-body">
              <div class="grid-2">
                <div class="input-group">
                  <label class="input-label" for="cs-name">System Name</label>
                  <input type="text" class="text-input" id="cs-name" placeholder="e.g. Hermetic Qabalah Pathworking" required />
                </div>
                <div class="input-group">
                  <label class="input-label" for="cs-icon">Icon / Emoji</label>
                  <input type="text" class="text-input" id="cs-icon" placeholder="e.g. 🔮, ⚡, 🪬, 🌿, 📜" value="🔮" required />
                </div>
              </div>

              <div class="input-group">
                <label class="input-label" for="cs-category">Tradition / Classification Category</label>
                <input type="text" class="text-input" id="cs-category" placeholder="e.g. Sacred Geometry, Esoteric Tarot, Elemental Alchemy" />
              </div>

              <div class="input-group">
                <label class="input-label" for="cs-elements">Core Elements, Runes, or Archetypes (comma-separated)</label>
                <input type="text" class="text-input" id="cs-elements" placeholder="e.g. Kether, Chokmah, Binah, Chesed, Geburah, Tiphareth" required />
                <span style="font-size: 0.72rem; color: var(--text-muted); margin-top: 3px; display: block;">These archetypes will be analyzed and cross-referenced with the user's natal placements.</span>
              </div>

              <div class="input-group">
                <label class="input-label" for="cs-weightings">System Weightings & Harmonic Formulas</label>
                <input type="text" class="text-input" id="cs-weightings" placeholder="e.g. Solar Houses: 40%, Elemental Quintessence: 35%, Karma: 25%" />
              </div>

              <div class="input-group">
                <label class="input-label" for="cs-rules">AI Prompt Injection Directives & Interpretation Rules</label>
                <textarea class="textarea-input" id="cs-rules" rows="4" placeholder="Describe the specific logic, planetary correspondences, taboos, or synthesis rules the Master Oracle should follow..." required></textarea>
              </div>

              <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--gold-border);">
                <div>
                  <div style="font-weight: 600; color: var(--gold-light); font-size: 0.88rem;">Active in Master Synthesizer Oracle</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">When active, these rules are injected into every consultation prompt.</div>
                </div>
                <label style="position: relative; display: inline-block; width: 38px; height: 20px;">
                  <input type="checkbox" id="cs-active-toggle" checked style="opacity: 0; width: 0; height: 0;">
                  <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--gold-primary); border-radius: 34px; transition: .3s;"></span>
                </label>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" id="btn-custom-school-modal-cancel">Cancel</button>
              <button type="submit" class="btn-primary">
                <i data-lucide="save"></i> Save Divination System
              </button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modalEl);

      const closeBtn = document.getElementById('btn-custom-school-modal-close');
      const cancelBtn = document.getElementById('btn-custom-school-modal-cancel');
      const form = document.getElementById('custom-school-modal-form');

      if (closeBtn) closeBtn.addEventListener('click', () => this.closeSchoolModal());
      if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeSchoolModal());
      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) this.closeSchoolModal();
      });

      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleSaveSchoolModal();
        });
      }
    }
  },

  openSchoolModal(existingSchool = null, editingIndex = -1) {
    this.ensureModalExists();
    const modalBackdrop = document.getElementById('custom-school-modal-backdrop');
    const titleEl = document.getElementById('custom-school-modal-title');
    const nameEl = document.getElementById('cs-name');
    const iconEl = document.getElementById('cs-icon');
    const catEl = document.getElementById('cs-category');
    const elementsEl = document.getElementById('cs-elements');
    const weightingsEl = document.getElementById('cs-weightings');
    const rulesEl = document.getElementById('cs-rules');
    const activeToggle = document.getElementById('cs-active-toggle');

    this.editingIndex = editingIndex;

    if (existingSchool) {
      titleEl.innerText = `Edit: ${existingSchool.name}`;
      nameEl.value = existingSchool.name || '';
      iconEl.value = existingSchool.icon || '🔮';
      catEl.value = existingSchool.category || '';
      elementsEl.value = Array.isArray(existingSchool.elements) ? existingSchool.elements.join(', ') : '';
      weightingsEl.value = existingSchool.weightings || '';
      rulesEl.value = existingSchool.rules || '';
      activeToggle.checked = existingSchool.active !== false;
    } else {
      titleEl.innerText = 'Define Custom Divination System';
      nameEl.value = '';
      iconEl.value = '🔮';
      catEl.value = 'Esoteric Synthesis';
      elementsEl.value = '';
      weightingsEl.value = 'Equal Distribution (1.0x)';
      rulesEl.value = '';
      activeToggle.checked = true;
    }

    modalBackdrop.classList.add('active', 'open');
    if (window.lucide) window.lucide.createIcons();
    if (this.soundEngine) this.soundEngine.playChime(520, 0.2);
  },

  closeSchoolModal() {
    const modalBackdrop = document.getElementById('custom-school-modal-backdrop');
    if (modalBackdrop) modalBackdrop.classList.remove('active', 'open');
    this.editingIndex = -1;
  },

  handleSaveSchoolModal() {
    const name = document.getElementById('cs-name').value.trim();
    const icon = document.getElementById('cs-icon').value.trim() || '🔮';
    const category = document.getElementById('cs-category').value.trim() || 'Proprietary System';
    const rawElements = document.getElementById('cs-elements').value;
    const elements = rawElements.split(',').map(s => s.trim()).filter(Boolean);
    const weightings = document.getElementById('cs-weightings').value.trim() || 'Uniform (1.0x)';
    const rules = document.getElementById('cs-rules').value.trim();
    const active = document.getElementById('cs-active-toggle').checked;

    if (!name || !rules || elements.length === 0) {
      alert('Please fill in System Name, at least one Core Element, and Prompt Directives.');
      return;
    }

    const schoolObj = {
      id: this.editingIndex >= 0 ? this.schools[this.editingIndex].id : `custom-${Date.now()}`,
      name,
      icon,
      category,
      elements,
      weightings,
      rules,
      active,
      created: this.editingIndex >= 0 ? this.schools[this.editingIndex].created : new Date().toISOString()
    };

    if (this.editingIndex >= 0) {
      this.schools[this.editingIndex] = schoolObj;
    } else {
      this.schools.push(schoolObj);
    }

    this.saveSchools();
    this.renderCustomSchoolsGrid();
    this.closeSchoolModal();

    if (this.soundEngine) this.soundEngine.playHarmonicChord();
    if (window.showToast) window.showToast(`Custom System "${name}" successfully saved!`);
  },

  deleteSchool(idx) {
    if (confirm(`Are you sure you wish to delete "${this.schools[idx].name}"?`)) {
      const removed = this.schools.splice(idx, 1)[0];
      this.saveSchools();
      this.renderCustomSchoolsGrid();
      if (this.soundEngine) this.soundEngine.playChime(350, 0.2);
      if (window.showToast) window.showToast(`Deleted custom system: ${removed.name}`);
    }
  },

  /**
   * Inject active custom schools into the Oracle agents selector
   */
  injectIntoOracleList() {
    const agentSelectorCard = document.querySelector('.agent-selector-card');
    if (!agentSelectorCard) return;

    // Clean up any previously injected custom agent buttons
    const oldCustomBtns = agentSelectorCard.querySelectorAll('.custom-injected-agent-btn');
    oldCustomBtns.forEach(b => b.remove());

    const activeCustoms = this.schools.filter(s => s.active);
    if (activeCustoms.length === 0) return;

    const referenceNode = agentSelectorCard.querySelector('.agent-btn[data-agent="iching-sage"]') || agentSelectorCard.firstElementChild;

    activeCustoms.forEach(school => {
      const btn = document.createElement('button');
      btn.className = 'agent-btn custom-injected-agent-btn';
      btn.dataset.agent = school.id;
      btn.innerHTML = `
        <div class="agent-avatar" style="border-color: var(--gold-border-bright);">${school.icon}</div>
        <div>
          <div class="agent-name">${school.name}</div>
          <div class="agent-role">${school.category || 'Proprietary Custom School'}</div>
        </div>
      `;

      btn.addEventListener('click', () => {
        agentSelectorCard.querySelectorAll('.agent-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (window.AetheriaState) {
          window.AetheriaState.activeAgent = school.id;
        }
        if (this.soundEngine) this.soundEngine.playChime(580, 0.3);
        if (window.ChatEngine) {
          window.ChatEngine.activeAgent = school.id;
          if (window.ChatEngine.appendSystemStatus) {
            window.ChatEngine.appendSystemStatus(`Switched Oracle Chamber to <strong>${school.name} (${school.icon})</strong>. Injected customized archetype rules.`);
          }
          if (window.ChatEngine.appendChatMessage && window.ChatEngine.getActiveAgentDisplay) {
            window.ChatEngine.appendChatMessage('oracle', window.ChatEngine.getActiveAgentDisplay().greeting, { isGreeting: true });
          }
          if (window.ChatEngine.updateContextInspector) {
            window.ChatEngine.updateContextInspector();
          }
        }
      });

      if (referenceNode && referenceNode.nextSibling) {
        agentSelectorCard.insertBefore(btn, referenceNode.nextSibling);
      } else {
        agentSelectorCard.appendChild(btn);
      }
    });

    if (window.lucide) window.lucide.createIcons();
  }
};

if (typeof window !== 'undefined') {
  window.CustomSchoolManager = CustomSchoolManager;
}
