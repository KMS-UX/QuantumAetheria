/**
 * AETHERIA — Mid-Long Term Projections Engine (`projections.js`)
 * 
 * Manages:
 * 1. Timeline Selector: [ 6-Month Horizon ], [ 2026 Annual Fate ], [ 2027 Projections ]
 * 2. Major Luck Pillar / Planetary Cycle Display: 
 *    - Da Yun (10-Year Luck Pillars) visual timeline slider
 *    - Western Planetary Cycle markers (Saturn Return @ 29.5, Jupiter Returns, Uranus Opposition)
 * 3. Quarter-by-Quarter Forecast Cards with Theme Icons, Opportunity Ratings, Strategic Focus, and Risk / Clash Indicators.
 */

export const ProjectionsEngine = {
  activeHorizon: '2026',
  selectedDaYunIndex: 2, // Active Age 28-38
  soundEngine: null,

  HORIZON_DATA: {
    '6month': {
      label: '6-Month Horizon (Autumn 2026 – Spring 2027)',
      theme: 'Strategic Consolidation & Tactical Expansion',
      planetaryShift: 'Jupiter trine natal Midheaven; Saturn stationary direct in natal 6th house.',
      quarters: [
        {
          quarter: 'Q3 2026 (Aug – Oct)',
          term: 'Autumn Equinox & White Dew',
          theme: 'Architectural Realignment',
          icon: 'layers',
          oppScore: 84,
          focus: [
            'Finalize major technical IP and creative frameworks',
            'Conduct deep audit of quarterly operational costs',
            'Solidify core alliance contracts before solar ingress'
          ],
          risk: 'Minor clash with Month Branch — Avoid hasty public statements during Mercury retrograde.',
          remedy: 'Ground actions in empirical documentation.'
        },
        {
          quarter: 'Q4 2026 (Nov – Jan 2027)',
          term: 'Winter Solstice & Great Snow',
          theme: 'Inner Kernel Incubation',
          icon: 'moon',
          oppScore: 92,
          focus: [
            'Deep research and proprietary method development',
            'Expand international or cross-disciplinary outreach',
            'Establish disciplined solar-rhythm recovery practices'
          ],
          risk: 'Water element surge — Guard against emotional decision fatigue.',
          remedy: 'Practice evening digital fasting and herbal tonics.'
        },
        {
          quarter: 'Q1 2027 (Feb – Apr)',
          term: 'Spring Ingress & Awakening Insects',
          theme: 'Sovereign Manifestation',
          icon: 'sprout',
          oppScore: 96,
          focus: [
            'Public launch of flagship synthesized platform',
            'High-visibility speaking or advisory appearances',
            'Capitalize on favorable Three-Harmonies water flow'
          ],
          risk: 'High pace of expansion may strain physical endurance.',
          remedy: 'Preserve strict morning boundaries for contemplation.'
        },
        {
          quarter: 'Q2 2027 (May – Jul)',
          term: 'Summer Solstice & Grain in Ear',
          theme: 'Fruitful Harvest & Equity',
          icon: 'sun',
          oppScore: 88,
          focus: [
            'Reap compound returns from long-term intellectual assets',
            'Mentor and expand secondary operational leadership',
            'Establish legacy philanthropic / foundation milestones'
          ],
          risk: 'Fire element peaks — Balance assertiveness with gentle diplomacy.',
          remedy: 'Seek aquatic retreats and restorative travel.'
        }
      ]
    },
    '2026': {
      label: '2026 Annual Fate (Year of the Bing Wu / Fire Horse)',
      theme: 'Solar Luminescence, Decisive Action & Creative Breakthrough',
      planetaryShift: 'Solar Return Ascendant in Scorpio; Jupiter 10th House transit; Saturn structuring Craft.',
      quarters: [
        {
          quarter: 'Q1 2026 (Spring Ingress)',
          term: 'Lichun (Feb 4) – Guyu (Apr 20)',
          theme: 'Seed Implantation & Clean Slates',
          icon: 'sparkles',
          oppScore: 88,
          focus: [
            'Seed foundational long-term initiatives',
            'Restructure personal daily workflow routines',
            'Form initial advisory alliances with aligned masters'
          ],
          risk: 'Initial friction with legacy stakeholders.',
          remedy: 'Anchor decisions in long-range strategic charts.'
        },
        {
          quarter: 'Q2 2026 (Summer Solstice)',
          term: 'Lixia (May 5) – Dashu (Jul 22)',
          theme: 'Dynamic Acceleration & Peak Visibility',
          icon: 'flame',
          oppScore: 95,
          focus: [
            'Execute main product and creative releases',
            'Harness Fire element peak for charisma and outreach',
            'Secure major partnership agreements'
          ],
          risk: 'Overheating through overcommitment.',
          remedy: 'Keep daily hydration and cooling practices strict.'
        },
        {
          quarter: 'Q3 2026 (Autumn Harvest)',
          term: 'Liqiu (Aug 7) – Shuangjiang (Oct 23)',
          theme: 'Harvest, Review & Refinement',
          icon: 'compass',
          oppScore: 78,
          focus: [
            'Systematize operations and prune non-essential branches',
            'Protect intellectual capital and brand boundaries',
            'Rebalance financial reserves into safe-haven assets'
          ],
          risk: 'Clash with Month branch — Potential friction in team communications.',
          remedy: 'Resolve ambiguities with explicit written protocols.'
        },
        {
          quarter: 'Q4 2026 (Winter Solstice)',
          term: 'Lidong (Nov 7) – Dahan (Jan 20)',
          theme: 'Spiritual Alchemy & 2027 Visioning',
          icon: 'eye',
          oppScore: 85,
          focus: [
            'Retreat into deep synthesis and strategic architecture',
            'Prepare next 3-year macro epoch blueprints',
            'Celebrate milestone breakthroughs with close kindred'
          ],
          risk: 'Winter stagnation if physical movement is neglected.',
          remedy: 'Daily brisk solar walks and warm meridian teas.'
        }
      ]
    },
    '2027': {
      label: '2027 Macro Projections (Year of the Ding Wei / Fire Goat)',
      theme: 'Harmonic Integration, Cultural Stewardship & Compounding Wealth',
      planetaryShift: 'Saturn transits natal 7th house; Jupiter enters 11th house of visionary community.',
      quarters: [
        {
          quarter: 'Q1 2027',
          term: 'Vernal Awakening Epoch',
          theme: 'Allied Synergy Expansion',
          icon: 'users',
          oppScore: 90,
          focus: [
            'Form high-trust consortiums and multi-agent alliances',
            'Scale international distribution channels',
            'Publish seminal thought leadership treatises'
          ],
          risk: 'Dilution of focus from too many attractive invitations.',
          remedy: 'Apply ruthless veto criteria to incoming requests.'
        },
        {
          quarter: 'Q2 2027',
          term: 'Mid-Year Zenith',
          theme: 'Institutional Elevation',
          icon: 'award',
          oppScore: 93,
          focus: [
            'Receive industry recognition and major accolades',
            'Solidify institutional equity structures',
            'Host premier esoteric / technical summits'
          ],
          risk: 'High public profile invites ungrounded criticism.',
          remedy: 'Remain rooted in sovereign inner truth.'
        },
        {
          quarter: 'Q3 2027',
          term: 'Golden Equinox',
          theme: 'Asset Diversification',
          icon: 'coins',
          oppScore: 82,
          focus: [
            'Reallocate excess liquidity into tangible sanctuaries',
            'Prune legacy software or architectural debt',
            'Focus on family and ancestral heritage enrichment'
          ],
          risk: 'Minor property boundary disputes.',
          remedy: 'Verify contracts and survey documentation meticulously.'
        },
        {
          quarter: 'Q4 2027',
          term: 'Solstice Synthesis',
          theme: 'Ascended Master Leadership',
          icon: 'shield-check',
          oppScore: 89,
          focus: [
            'Transition into non-executive chairman / mentor stance',
            'Endow scholarship or research grants',
            'Conduct sacred pilgrimage to solar power points'
          ],
          risk: 'Complacency after major victories.',
          remedy: 'Stay a curious novice in new emerging arts.'
        }
      ]
    }
  },

  DAYUN_PILLARS: [
    { age: '8 – 17', stem: 'Gui (癸)', branch: 'Chou (丑)', stemElem: 'Water', branchElem: 'Earth', tenGod: 'Direct Officer', cycle: 'Childhood Gnosis', active: false },
    { age: '18 – 27', stem: 'Ren (壬)', branch: 'Zi (子)', stemElem: 'Water', branchElem: 'Water', tenGod: 'Seven Killings', cycle: 'Intellectual Wandering', active: false },
    { age: '28 – 37', stem: 'Xin (辛)', branch: 'Hai (亥)', stemElem: 'Metal', branchElem: 'Water', tenGod: 'Direct Wealth', cycle: 'Active Peak · Sovereign Mastery', active: true, planetary: '✦ Saturn Return (~29.5) & Jupiter Trine' },
    { age: '38 – 47', stem: 'Geng (庚)', branch: 'Xu (戌)', stemElem: 'Metal', branchElem: 'Earth', tenGod: 'Indirect Wealth', cycle: 'Enterprise Building', active: false, planetary: '✦ Uranus Opposition (~42)' },
    { age: '48 – 57', stem: 'Ji (己)', branch: 'You (酉)', stemElem: 'Earth', branchElem: 'Metal', tenGod: 'Hurting Officer', cycle: 'Cultural Stewardship', active: false, planetary: '✦ Chiron Return (~50)' },
    { age: '58 – 67', stem: 'Wu (戊)', branch: 'Shen (申)', stemElem: 'Earth', branchElem: 'Metal', tenGod: 'Eating God', cycle: 'Philosophical Legacy', active: false, planetary: '✦ Second Saturn Return (~59)' },
    { age: '68 – 77', stem: 'Ding (丁)', branch: 'Wei (未)', stemElem: 'Fire', branchElem: 'Earth', tenGod: 'Direct Resource', cycle: 'Spiritual Matriarch', active: false }
  ],

  init(soundEngine) {
    this.soundEngine = soundEngine;
    this.setupTimelineSwitcher();
    this.renderAll();
  },

  setupTimelineSwitcher() {
    const buttons = document.querySelectorAll('.horizon-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.activeHorizon = btn.dataset.horizon || '2026';
        if (this.soundEngine) this.soundEngine.playChime(660, 0.2);
        this.renderHorizonCards();
      });
    });
  },

  renderAll() {
    this.renderDaYunTimeline();
    this.renderHorizonCards();
  },

  renderDaYunTimeline() {
    const container = document.getElementById('dayun-timeline-slider-container');
    const detailsEl = document.getElementById('dayun-cycle-detail-box');
    if (!container) return;

    container.innerHTML = this.DAYUN_PILLARS.map((pil, idx) => {
      const isActive = idx === this.selectedDaYunIndex;
      return `
        <div class="dayun-pillar-card ${isActive ? 'active-dayun' : ''}" data-dayun-idx="${idx}">
          ${pil.active ? `<span class="dayun-active-badge">Active Cycle</span>` : ''}
          <div class="dayun-age-range">Age ${pil.age}</div>
          <div style="font-size: 1.3rem; font-weight: 800; font-family: var(--font-serif-display); color: var(--gold-light);">
            ${pil.stem} ${pil.branch}
          </div>
          <div style="font-size: 0.72rem; color: var(--text-secondary);">
            ${pil.tenGod}
          </div>
          <div class="dayun-cycle-tag">
            ${pil.cycle}
          </div>
          ${pil.planetary ? `
            <div style="font-size: 0.62rem; color: var(--violet-light); margin-top: 4px; font-weight: 700;">
              ${pil.planetary}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Attach click listeners to Da Yun cards
    const cards = container.querySelectorAll('.dayun-pillar-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.dayunIdx, 10);
        this.selectedDaYunIndex = idx;
        cards.forEach(c => c.classList.remove('active-dayun'));
        card.classList.add('active-dayun');

        if (this.soundEngine) this.soundEngine.playChime(600 + idx * 30, 0.2);
        this.renderDaYunDetails(idx);
      });
    });

    this.renderDaYunDetails(this.selectedDaYunIndex);
  },

  renderDaYunDetails(idx) {
    const detailsEl = document.getElementById('dayun-cycle-detail-box');
    if (!detailsEl) return;

    const pil = this.DAYUN_PILLARS[idx];

    detailsEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h4 style="font-family: var(--font-serif-display); color: var(--gold-light); font-size: 1.05rem; display: flex; align-items: center; gap: 8px;">
          <i data-lucide="milestone" style="color: var(--gold-primary);"></i>
          <span>Da Yun Cycle Analysis: Age ${pil.age} [${pil.stem} ${pil.branch}]</span>
        </h4>
        <span class="badge-pill" style="background: rgba(212, 175, 55, 0.12); color: var(--gold-light); border-color: var(--gold-border);">
          Ten God Flow: ${pil.tenGod}
        </span>
      </div>
      <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 8px;">
        During the 10-year age window of <strong>${pil.age}</strong>, destiny currents are ruled by the Heavenly Stem <strong>${pil.stem}</strong> and Earthly Branch <strong>${pil.branch}</strong>. 
        ${idx === 2 
          ? 'This is your defining sovereign decade. Operating under <strong>Direct Wealth & Saturn Return</strong>, all scattered experiments crystallize into permanent, authoritative institutions.'
          : idx === 1
          ? 'An epoch of intense learning, intellectual questioning, and discovering spiritual independence.'
          : 'A fruitful season focused on compounding leadership, wisdom transmission, and generational mentorship.'
        }
      </p>
      <div style="display: flex; gap: 16px; font-size: 0.76rem; color: var(--text-muted);">
        <span>✦ Archetypal Energy: <strong style="color: var(--cyan-cosmic);">${pil.cycle}</strong></span>
        <span>✦ Western Synchronicity: <strong style="color: var(--violet-light);">${pil.planetary || 'Major Planetary Progression'}</strong></span>
        <span>✦ Harmonic Alignment: <strong style="color: var(--emerald-element);">94% Favorable</strong></span>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  renderHorizonCards() {
    const horizon = this.HORIZON_DATA[this.activeHorizon] || this.HORIZON_DATA['2026'];
    const titleEl = document.getElementById('horizon-active-title');
    const descEl = document.getElementById('horizon-active-desc');
    const container = document.getElementById('quarter-forecast-container');

    if (titleEl) titleEl.textContent = horizon.label;
    if (descEl) descEl.textContent = `${horizon.theme} · ${horizon.planetaryShift}`;

    if (!container) return;

    container.innerHTML = horizon.quarters.map(q => {
      return `
        <div class="quarter-card">
          <div>
            <div class="quarter-header">
              <span class="quarter-badge">
                <i data-lucide="${q.icon}"></i>
                <span>${q.quarter}</span>
              </span>
              <span class="quarter-season-term">${q.term}</span>
            </div>

            <div class="quarter-theme-title">${q.theme}</div>

            <!-- Opportunity Progress Gauge -->
            <div class="quarter-opp-meter">
              <span>Opportunity Rating:</span>
              <div class="opp-progress-track">
                <div class="opp-progress-fill" style="width: ${q.oppScore}%;"></div>
              </div>
              <span>${q.oppScore}%</span>
            </div>

            <div class="quarter-focus-list">
              <div style="font-size: 0.72rem; color: var(--gold-light); font-weight: 700; text-transform: uppercase; margin-bottom: 2px;">
                Strategic Vectors:
              </div>
              ${q.focus.map(f => `
                <div style="display: flex; align-items: flex-start; gap: 6px;">
                  <span style="color: var(--gold-primary);">✦</span>
                  <span>${f}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div>
            <div class="quarter-risk-badge">
              <i data-lucide="shield-alert" style="width: 13px; height: 13px; flex-shrink: 0;"></i>
              <span>${q.risk}</span>
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 6px; font-style: italic;">
              Remedy: ${q.remedy}
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }
};

if (typeof window !== 'undefined') {
  window.ProjectionsEngine = ProjectionsEngine;
}
