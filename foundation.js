/**
 * AETHERIA — Foundation & Life Analysis Engine (`foundation.js`)
 * 
 * Manages:
 * 1. Interactive BaZi 4-Pillars Table with exact Five Element color palette:
 *    Wood=#22c55e (Green), Fire=#ef4444 (Red), Earth=#eab308 (Yellow/Gold), Metal=#f1f5f9 (White/Silver), Water=#00e5ff (Blue/Cyan)
 * 2. Zi Wei Dou Shu 12-Palace Matrix with Major Stars, Brightness ratings, Sihua badges, and interactive Center Hub.
 * 3. Element Balance Meter with 5 elemental percentage gauges and Yong Shen (Favorable Element) diagnostics.
 * 4. Life Master Summary Panel with 4 tabbed deep synthesis views (Temperament, Career, Relationships, Health).
 */

import { CalcEngine } from './calc_engine.js';

export const FoundationEngine = {
  activeSchoolTab: 'bazi',
  activeLifeMasterTab: 'temperament',
  selectedPillarIndex: 2, // Default Day Pillar
  selectedZiWeiPalace: 'ming',
  soundEngine: null,

  init(soundEngine) {
    this.soundEngine = soundEngine;
    this.setupSubTabs();
    this.setupLifeMasterTabs();
    this.renderAll();
  },

  setupSubTabs() {
    const tabs = document.querySelectorAll('#foundation-subtabs .sub-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const targetTab = tab.dataset.schoolTab;
        this.activeSchoolTab = targetTab;

        document.querySelectorAll('.school-subview').forEach(view => {
          view.style.display = 'none';
        });

        const activeView = document.getElementById(`subview-${targetTab}`);
        if (activeView) {
          activeView.style.display = 'block';
        }

        if (this.soundEngine) this.soundEngine.playChime(640, 0.2);
        if (window.lucide) window.lucide.createIcons();
      });
    });
  },

  setupLifeMasterTabs() {
    const tabs = document.querySelectorAll('.life-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const targetPane = tab.dataset.lifeTab;
        this.activeLifeMasterTab = targetPane;

        document.querySelectorAll('.life-tab-pane').forEach(pane => {
          pane.classList.remove('active');
        });

        const activePane = document.getElementById(`life-pane-${targetPane}`);
        if (activePane) {
          activePane.classList.add('active');
        }

        if (this.soundEngine) this.soundEngine.playChime(720, 0.15);
        if (window.lucide) window.lucide.createIcons();
      });
    });
  },

  getElementColorClass(element) {
    switch ((element || '').toLowerCase()) {
      case 'wood': return 'elem-char-wood';
      case 'fire': return 'elem-char-fire';
      case 'earth': return 'elem-char-earth';
      case 'metal': return 'elem-char-metal';
      case 'water': return 'elem-char-water';
      default: return 'elem-char-wood';
    }
  },

  renderAll(payload) {
    const p = payload || (window.AetheriaState ? window.AetheriaState.natalPayload : null);
    if (!p) return;

    this.renderBaZiPillars(p);
    this.renderElementBalance(p);
    this.renderZiWeiMatrix(p);
    this.renderLifeMasterSummary(p);
    if (window.lucide) window.lucide.createIcons();
  },

  // 1. BAZI INTERACTIVE FOUR PILLARS TABLE
  renderBaZiPillars(p) {
    const container = document.getElementById('bazi-pillars-render');
    const inspectorEl = document.getElementById('bazi-pillar-inspector');
    if (!container || !p.bazi || !p.bazi.pillars) return;

    const pillarKeys = ['year', 'month', 'day', 'hour'];
    const pillarLabels = ['Year Pillar (年柱)', 'Month Pillar (月柱)', 'Day Pillar (日柱 - Self)', 'Hour Pillar (时柱)'];
    const pillarDomains = ['Ancestral Karma & Root', 'Parents, Career & Season', 'Day Master & Soul Essence', 'Children, Creation & Legacy'];

    container.innerHTML = pillarKeys.map((key, idx) => {
      const pil = p.bazi.pillars[key];
      const stemColorClass = this.getElementColorClass(pil.stem.element);
      const branchColorClass = this.getElementColorClass(pil.branch.element);
      const isActive = idx === this.selectedPillarIndex;

      return `
        <div class="bazi-pillar-column ${isActive ? 'active-pillar' : ''}" data-pillar-idx="${idx}" id="bazi-pillar-${key}">
          <div class="pillar-name-tag">
            <i data-lucide="${idx === 2 ? 'sparkles' : 'columns-4'}" style="width: 13px; height: 13px;"></i>
            <span>${pillarLabels[idx]}</span>
          </div>
          <div style="font-size: 0.68rem; color: var(--text-muted);">${pillarDomains[idx]}</div>

          <!-- Heavenly Stem -->
          <div class="stem-card">
            <span class="ten-god-tag">${pil.stem.tenGod}</span>
            <div class="character-chinese ${stemColorClass}">${pil.stem.char}</div>
            <div class="pinyin-element" style="color: var(--text-secondary);">
              <strong>${pil.stem.pinyin}</strong> · ${pil.stem.polarity} ${pil.stem.element}
            </div>
          </div>

          <!-- Earthly Branch -->
          <div class="branch-card">
            <div class="character-chinese ${branchColorClass}">${pil.branch.char}</div>
            <div class="pinyin-element" style="color: var(--text-secondary);">
              <strong>${pil.branch.pinyin}</strong> (${pil.branch.animal || ''})
            </div>
            <span style="font-size: 0.65rem; color: var(--text-muted);">${pil.branch.hours || ''}</span>
          </div>

          <!-- Hidden Stems (Cang Gan 藏干) -->
          <div class="hidden-stems-box">
            <div style="font-size: 0.65rem; color: var(--gold-light); font-weight: 700; text-transform: uppercase; margin-bottom: 2px;">
              Hidden Roots (藏干)
            </div>
            ${(pil.hiddenStems || []).map(hs => {
              const hsColor = this.getElementColorClass(hs.element);
              return `
                <div class="hidden-stem-item">
                  <span class="${hsColor}" style="font-weight: 700;">${hs.char} (${hs.pinyin})</span>
                  <span style="font-size: 0.65rem; color: var(--text-muted);">${hs.tenGod}</span>
                  <span style="font-family: var(--font-mono); font-size: 0.65rem; color: var(--cyan-cosmic);">${hs.percentage}%</span>
                </div>
              `;
            }).join('')}
          </div>

          <!-- NaYin Element -->
          <div style="font-size: 0.68rem; color: var(--gold-light); background: rgba(212, 175, 55, 0.08); border-radius: 4px; padding: 3px 6px;">
            NaYin: ${pil.nayin || 'Flowing Stream Water'}
          </div>
        </div>
      `;
    }).join('');

    // Attach click events to pillars
    const pillarEls = container.querySelectorAll('.bazi-pillar-column');
    pillarEls.forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.pillarIdx, 10);
        this.selectedPillarIndex = idx;
        pillarEls.forEach(p => p.classList.remove('active-pillar'));
        el.classList.add('active-pillar');

        if (this.soundEngine) this.soundEngine.playChime(580 + idx * 40, 0.2);
        this.renderPillarInspector(idx, p);
      });
    });

    this.renderPillarInspector(this.selectedPillarIndex, p);
  },

  renderPillarInspector(pillarIdx, p) {
    const inspectorEl = document.getElementById('bazi-pillar-inspector');
    if (!inspectorEl || !p.bazi || !p.bazi.pillars) return;

    const keys = ['year', 'month', 'day', 'hour'];
    const titles = ['Year Pillar: Ancestral Roots & Social Outer Persona', 'Month Pillar: Career Order, Parents & Seasonal Dominance', 'Day Pillar: Day Master (Soul Kernel) & Marriage Palace', 'Hour Pillar: Creative Legacy, Deep Desires & Children'];
    const curPillar = p.bazi.pillars[keys[pillarIdx]];

    const stemColor = this.getElementColorClass(curPillar.stem.element);
    const branchColor = this.getElementColorClass(curPillar.branch.element);

    inspectorEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid rgba(212, 175, 55, 0.15); padding-bottom: 8px;">
        <h4 style="font-family: var(--font-serif-display); color: var(--gold-light); font-size: 0.98rem; display: flex; align-items: center; gap: 8px;">
          <i data-lucide="compass" style="width: 16px; height: 16px;"></i>
          <span>${titles[pillarIdx]}</span>
        </h4>
        <span class="badge-pill" style="background: rgba(212, 175, 55, 0.12); color: var(--gold-light); border-color: var(--gold-border);">
          Stem: <strong class="${stemColor}">${curPillar.stem.char}</strong> · Branch: <strong class="${branchColor}">${curPillar.branch.char}</strong>
        </span>
      </div>
      <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 10px;">
        ${pillarIdx === 2 
          ? `Your <strong>Day Master (${curPillar.stem.polarity} ${curPillar.stem.element} - ${curPillar.stem.char})</strong> sits on the <strong>${curPillar.branch.char} (${curPillar.branch.pinyin})</strong> branch. This constitutes your core metaphysical identity. As ${curPillar.stem.pinyin} ${curPillar.stem.element}, your soul operates with steadfast integrity, branching out into intellectual and creative frontiers.`
          : pillarIdx === 1
          ? `The Month Branch controls the seasonal climatic order of your birth chart. Sitting under <strong>${curPillar.stem.tenGod}</strong>, this pillar governs your vocational aptitude, public status, and relationship with industry authorities.`
          : pillarIdx === 0
          ? `The Year Pillar reflects your ancestral heritage and childhood environment. Operating under <strong>${curPillar.stem.tenGod}</strong>, it gives you early resilience and a broad visionary compass in societal interactions.`
          : `The Hour Pillar reflects your private sanctuary, entrepreneurial instincts, and late-life accomplishments. The hidden roots here channel continuous motivation into manifesting original projects.`
        }
      </p>
      <div style="display: flex; gap: 12px; font-size: 0.76rem; color: var(--text-muted);">
        <span>✦ Pillar Ten God: <strong style="color: var(--gold-light);">${curPillar.stem.tenGod}</strong></span>
        <span>✦ NaYin Energy: <strong style="color: var(--cyan-cosmic);">${curPillar.nayin || 'Firmamental Spark'}</strong></span>
        <span>✦ Transformation: <strong style="color: var(--emerald-element);">Harmonious Integration</strong></span>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  // 2. FIVE ELEMENTS BALANCE METER & DIAGNOSTICS
  renderElementBalance(p) {
    const container = document.getElementById('bazi-element-breakdown-container');
    if (!container || !p.bazi || !p.bazi.elementPercentages) return;

    const ep = p.bazi.elementPercentages;
    const elements = [
      { name: 'Wood (木)', key: 'Wood', color: '#22c55e', organs: 'Liver & Gallbladder', trait: 'Vision & Growth' },
      { name: 'Fire (火)', key: 'Fire', color: '#ef4444', organs: 'Heart & Small Intestine', trait: 'Passion & Clarity' },
      { name: 'Earth (土)', key: 'Earth', color: '#eab308', organs: 'Spleen & Stomach', trait: 'Grounding & Stability' },
      { name: 'Metal (金)', key: 'Metal', color: '#f1f5f9', organs: 'Lungs & Large Intestine', trait: 'Discernment & Structure' },
      { name: 'Water (水)', key: 'Water', color: '#00e5ff', organs: 'Kidneys & Bladder', trait: 'Wisdom & Adaptability' }
    ];

    container.innerHTML = `
      <div class="element-grid-5">
        ${elements.map(el => {
          const val = ep[el.key] || 0;
          return `
            <div class="element-stat-card ${el.key.toLowerCase()}">
              <div style="font-size: 0.78rem; font-weight: 700; color: ${el.color}; text-transform: uppercase;">
                ${el.name}
              </div>
              <div style="font-size: 1.4rem; font-weight: 800; font-family: var(--font-serif-display); color: var(--text-pure);">
                ${val}%
              </div>
              <div class="opp-progress-track" style="width: 100%; height: 6px; margin: 4px 0;">
                <div class="opp-progress-fill" style="width: ${val}%; background: ${el.color};"></div>
              </div>
              <div style="font-size: 0.68rem; color: var(--text-secondary); margin-top: 2px;">
                ${el.trait}
              </div>
              <div style="font-size: 0.62rem; color: var(--text-muted);">
                ${el.organs}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; padding: 12px; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--gold-border);">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 0.82rem; color: var(--gold-light); font-weight: 700;">✦ Favorable Element (用神 Yong Shen):</span>
          <span class="badge-pill" style="background: rgba(34, 197, 94, 0.15); color: var(--elem-wood); border-color: rgba(34, 197, 94, 0.3);">
            Wood (木) & Water (水) Nourishment
          </span>
        </div>
        <div style="font-size: 0.78rem; color: var(--text-secondary);">
          Dynamic Pattern: <strong style="color: var(--gold-light);">Artistic Flow & Resource Generation</strong>
        </div>
      </div>
    `;
  },

  // 3. ZI WEI DOU SHU 12-PALACE MATRIX WITH CENTER HUB
  renderZiWeiMatrix(p) {
    const gridEl = document.getElementById('ziwei-palaces-grid');
    if (!gridEl) return;

    // Traditional 12 palaces sequence (arranged around the outer edge of 4x4 grid)
    // Layout indices in 4x4 matrix:
    // Row 0: [0,0]=Si (Snake), [0,1]=Wu (Horse), [0,2]=Wei (Goat), [0,3]=Shen (Monkey)
    // Row 1: [1,0]=Chen (Dragon), [1,1]=CENTER, [1,2]=CENTER, [1,3]=You (Rooster)
    // Row 2: [2,0]=Mao (Rabbit),  [2,1]=CENTER, [2,2]=CENTER, [2,3]=Xu (Dog)
    // Row 3: [3,0]=Yin (Tiger),   [3,1]=Chou (Ox), [3,2]=Zi (Rat),   [3,3]=Hai (Pig)

    const palaces = [
      { id: 'ming', name: 'Ming Palace (命宫)', branch: 'Si 巳', branchName: 'Snake', major: [{ name: 'Zi Wei (紫微)', bright: 'Miao 庙', sihua: 'Quan 权' }, { name: 'Qi Sha (七杀)', bright: 'Wang 旺' }], minor: ['Zuo Fu', 'Tian Yue'], ageRange: '12 - 21', isMing: true },
      { id: 'parents', name: 'Parents (父母宫)', branch: 'Wu 午', branchName: 'Horse', major: [{ name: 'Tian Ji (天机)', bright: 'Miao 庙', sihua: 'Ke 科' }], minor: ['Wen Chang', 'Tian Kui'], ageRange: '22 - 31' },
      { id: 'fortune', name: 'Fortune & Karma (福德宫)', branch: 'Wei 未', branchName: 'Goat', major: [{ name: 'Tai Yang (太阳)', bright: 'De 得' }, { name: 'Tai Yin (太阴)', bright: 'Miao 庙' }], minor: ['Tian Xi', 'Hong Luan'], ageRange: '32 - 41' },
      { id: 'property', name: 'Property (田宅宫)', branch: 'Shen 申', branchName: 'Monkey', major: [{ name: 'Wu Qu (武曲)', bright: 'Miao 庙', sihua: 'Lu 禄' }, { name: 'Tian Fu (天府)', bright: 'Wang 旺' }], minor: ['Lu Cun', 'San Tai'], ageRange: '42 - 51' },
      { id: 'career', name: 'Career / Bureau (官禄宫)', branch: 'You 酉', branchName: 'Rooster', major: [{ name: 'Tian Tong (天同)', bright: 'Ping 平' }], minor: ['Wen Qu', 'Tian Guan'], ageRange: '52 - 61' },
      { id: 'friends', name: 'Friends / Servants (交友宫)', branch: 'Xu 戌', branchName: 'Dog', major: [{ name: 'Lian Zhen (廉贞)', bright: 'Li 利' }, { name: 'Tian Fu (天府)', bright: 'Miao 庙' }], minor: ['Ba Zuo', 'Tian Fu'], ageRange: '62 - 71' },
      { id: 'travel', name: 'Travel & Migration (迁移宫)', branch: 'Hai 亥', branchName: 'Pig', major: [{ name: 'Tan Lang (贪狼)', bright: 'Wang 旺', sihua: 'Ji 忌' }], minor: ['Qing Yang', 'Tian Ma'], ageRange: '72 - 81' },
      { id: 'health', name: 'Health & Illness (疾厄宫)', branch: 'Zi 子', branchName: 'Rat', major: [{ name: 'Ju Men (巨门)', bright: 'Miao 庙' }], minor: ['Tuo Luo', 'Tian Xing'], ageRange: '82 - 91' },
      { id: 'wealth', name: 'Wealth & Prosperity (财帛宫)', branch: 'Chou 丑', branchName: 'Ox', major: [{ name: 'Tian Xiang (天相)', bright: 'Miao 庙' }, { name: 'Tian Liang (天梁)', bright: 'Wang 旺' }], minor: ['You Bi', 'Tian Wu'], ageRange: '92 - 101' },
      { id: 'children', name: 'Children & Creation (子女宫)', branch: 'Yin 寅', branchName: 'Tiger', major: [{ name: 'Po Jun (破军)', bright: 'Wang 旺' }], minor: ['Di Kong', 'Di Jie'], ageRange: '2 - 11' },
      { id: 'spouse', name: 'Spouse & Marriage (夫妻宫)', branch: 'Mao 卯', branchName: 'Rabbit', major: [{ name: 'Tian Tong (天同)', bright: 'Miao 庙' }, { name: 'Tai Yin (太阴)', bright: 'Wang 旺' }], minor: ['Xian Chi', 'Tian Yao'], ageRange: '102 - 111' },
      { id: 'siblings', name: 'Siblings & Peers (兄弟宫)', branch: 'Chen 辰', branchName: 'Dragon', major: [{ name: 'Tian Liang (天梁)', bright: 'Miao 庙' }], minor: ['Tian De', 'Yue De'], ageRange: '112 - 121' }
    ];

    // Grid placement map
    const gridPlacement = [
      { row: 1, col: 1, palace: palaces[0] },  // Si
      { row: 1, col: 2, palace: palaces[1] },  // Wu
      { row: 1, col: 3, palace: palaces[2] },  // Wei
      { row: 1, col: 4, palace: palaces[3] },  // Shen
      { row: 2, col: 4, palace: palaces[4] },  // You
      { row: 3, col: 4, palace: palaces[5] },  // Xu
      { row: 4, col: 4, palace: palaces[6] },  // Hai
      { row: 4, col: 3, palace: palaces[7] },  // Zi
      { row: 4, col: 2, palace: palaces[8] },  // Chou
      { row: 4, col: 1, palace: palaces[9] },  // Yin
      { row: 3, col: 1, palace: palaces[10] }, // Mao
      { row: 2, col: 1, palace: palaces[11] }, // Chen
    ];

    let cellsHtml = '';

    // Render outer 12 palace cells with CSS grid positioning
    gridPlacement.forEach(item => {
      const pal = item.palace;
      const isSelected = pal.id === this.selectedZiWeiPalace;

      cellsHtml += `
        <div class="palace-cell ${pal.isMing ? 'ming-palace' : ''} ${isSelected ? 'selected-palace' : ''}" 
             style="grid-column: ${item.col}; grid-row: ${item.row};"
             data-palace-id="${pal.id}">
          <div class="palace-header-row">
            <span class="palace-name-badge">${pal.name}</span>
            <span class="palace-branch-tag">${pal.branch}</span>
          </div>

          <div class="stars-container">
            ${pal.major.map(m => `
              <div class="major-star-row">
                <span>
                  <i data-lucide="sparkle" style="width: 10px; height: 10px; display: inline-block;"></i>
                  ${m.name}
                  ${m.sihua ? `<span class="sihua-badge sihua-${m.sihua === '权' || m.sihua === 'Quan 权' ? 'quan' : m.sihua === '禄' || m.sihua === 'Lu 禄' ? 'lu' : m.sihua === '科' || m.sihua === 'Ke 科' ? 'ke' : 'ji'}">${m.sihua}</span>` : ''}
                </span>
                <span class="star-brightness ${m.bright.toLowerCase().includes('miao') ? 'miao' : 'wang'}">${m.bright}</span>
              </div>
            `).join('')}

            <div class="minor-stars-list">
              ${pal.minor.join(' · ')}
            </div>
          </div>

          <div class="palace-footer-row">
            <span>Da Yun: ${pal.ageRange}</span>
            <span style="color: var(--cyan-cosmic);">${pal.branchName}</span>
          </div>
        </div>
      `;
    });

    // Center Hub
    cellsHtml += `
      <div class="palace-center-hub" id="ziwei-center-hub">
        <!-- Dynamically updated by selectPalace -->
      </div>
    `;

    gridEl.innerHTML = cellsHtml;

    // Attach click listeners to palace cells
    const cellEls = gridEl.querySelectorAll('.palace-cell');
    cellEls.forEach(el => {
      el.addEventListener('click', () => {
        const palId = el.dataset.palaceId;
        if (!palId) return;
        this.selectedZiWeiPalace = palId;
        cellEls.forEach(c => c.classList.remove('selected-palace'));
        el.classList.add('selected-palace');

        if (this.soundEngine) this.soundEngine.playChime(620, 0.18);
        this.updateZiWeiCenterHub(palId, palaces, p);
      });
    });

    this.updateZiWeiCenterHub(this.selectedZiWeiPalace, palaces, p);
  },

  updateZiWeiCenterHub(palaceId, palaces, p) {
    const hub = document.getElementById('ziwei-center-hub');
    if (!hub) return;

    const pal = palaces.find(pl => pl.id === palaceId) || palaces[0];

    hub.innerHTML = `
      <div>
        <div style="font-size: 0.72rem; color: var(--gold-light); text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700; margin-bottom: 4px;">
          Imperial Zi Wei Matrix · Palace Inspection
        </div>
        <h3 style="font-family: var(--font-serif-display); color: var(--text-pure); font-size: 1.25rem; margin-bottom: 6px;">
          ${pal.name} <span style="font-size: 0.85rem; color: var(--cyan-cosmic);">(${pal.branch})</span>
        </h3>
        <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 12px;">
          ${pal.major.map(m => `
            <span class="badge-pill" style="background: rgba(212, 175, 55, 0.12); color: var(--gold-light); border-color: var(--gold-border);">
              ${m.name} (${m.bright})
            </span>
          `).join('')}
        </div>
        <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; max-width: 380px; margin: 0 auto;">
          ${pal.id === 'ming' 
            ? 'The <strong>Ming Palace (Soul Seat)</strong> holds the imperial <strong>Zi Wei & Qi Sha</strong> stars, granting strong command authority, fearless entrepreneurial vision, and sharp discernment.'
            : pal.id === 'career'
            ? 'The <strong>Career Palace</strong> shows harmonious flow through <strong>Tian Tong</strong>, favoring diplomacy, creative arts, media synthesis, and strategic advisory.'
            : pal.id === 'wealth'
            ? 'The <strong>Wealth Palace</strong> is illuminated by <strong>Tian Xiang & Tian Liang</strong>, indicating enduring wealth built through professional integrity and long-term asset building.'
            : `The <strong>${pal.name}</strong> channels celestial energy through the ${pal.branchName} branch, establishing a strong harmonic anchor in your natal constellation.`
          }
        </p>
      </div>

      <div style="display: flex; justify-content: space-around; font-size: 0.75rem; color: var(--text-muted); border-top: 1px solid rgba(212, 175, 55, 0.15); padding-top: 10px; margin-top: 10px;">
        <span>✦ Active Age Epoch: <strong style="color: var(--gold-light);">${pal.ageRange}</strong></span>
        <span>✦ Primary Star Quality: <strong style="color: var(--emerald-element);">Imperial Noble</strong></span>
        <span>✦ Palace Harmony: <strong style="color: var(--cyan-cosmic);">96% Resonant</strong></span>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  // 4. LIFE MASTER SUMMARY PANEL (TABBED METAPHYSICAL SYNTHESIS)
  renderLifeMasterSummary(p) {
    const container = document.getElementById('life-master-summary-panel');
    if (!container || !p.bazi) return;

    const dm = p.bazi.dayMaster;

    container.innerHTML = `
      <div class="life-summary-tabs-nav">
        <button class="life-tab-btn ${this.activeLifeMasterTab === 'temperament' ? 'active' : ''}" data-life-tab="temperament">
          <i data-lucide="sparkles"></i> <span>Core Temperament</span>
        </button>
        <button class="life-tab-btn ${this.activeLifeMasterTab === 'career' ? 'active' : ''}" data-life-tab="career">
          <i data-lucide="briefcase"></i> <span>Career & Wealth Affinity</span>
        </button>
        <button class="life-tab-btn ${this.activeLifeMasterTab === 'relationship' ? 'active' : ''}" data-life-tab="relationship">
          <i data-lucide="heart-handshake"></i> <span>Relationship Dynamics</span>
        </button>
        <button class="life-tab-btn ${this.activeLifeMasterTab === 'health' ? 'active' : ''}" data-life-tab="health">
          <i data-lucide="activity"></i> <span>Health & Vulnerabilities</span>
        </button>
      </div>

      <!-- Tab 1: Core Temperament -->
      <div class="life-tab-pane ${this.activeLifeMasterTab === 'temperament' ? 'active' : ''}" id="life-pane-temperament">
        <div class="life-section-quote">
          "The Day Master of ${dm.polarity} ${dm.element} (${dm.char} ${dm.pinyin}) embodies the towering ancient redwood — principled, forward-looking, seeking high horizons with deep subterranean roots."
        </div>
        <div class="life-attribute-grid">
          <div class="life-attribute-box">
            <div class="life-attribute-title"><i data-lucide="shield-check" style="color: var(--emerald-element);"></i> Sovereign Strengths & Gifts</div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.55;">
              Innate visionary architecture, relentless self-discipline, unwavering moral compass, and a natural aptitude for synthesizing complex systems into actionable clarity.
            </p>
          </div>
          <div class="life-attribute-box">
            <div class="life-attribute-title"><i data-lucide="alert-triangle" style="color: #fca5a5;"></i> Shadow Archetypes & Pitfalls</div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.55;">
              Tendency toward unbending stubbornness when faced with sudden environmental shifts. Can over-extend energy reserves rather than delegating intermediate tasks.
            </p>
          </div>
        </div>
      </div>

      <!-- Tab 2: Career Affinity -->
      <div class="life-tab-pane ${this.activeLifeMasterTab === 'career' ? 'active' : ''}" id="life-pane-career">
        <div class="life-section-quote">
          "Optimal vocation merges Wood's architectural growth with Fire's expressive visibility — high-agency leadership, philosophical advisory, and technical design."
        </div>
        <div class="life-attribute-grid">
          <div class="life-attribute-box">
            <div class="life-attribute-title"><i data-lucide="trending-up" style="color: var(--gold-light);"></i> Favorable Sectors & Industries</div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.55;">
              Advanced Technology & AI System Design, Strategic Consultancy, Architectural Arts, Publishing & Metaphysical Sciences, Asset Portfolio Stewardship.
            </p>
          </div>
          <div class="life-attribute-box">
            <div class="life-attribute-title"><i data-lucide="coins" style="color: var(--cyan-cosmic);"></i> Wealth Manifestation Mechanics</div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.55;">
              Wealth flourishes through intellectual property creation, indirect asset multiplication, and holding equity in compounding visionary enterprises.
            </p>
          </div>
        </div>
      </div>

      <!-- Tab 3: Relationship Dynamics -->
      <div class="life-tab-pane ${this.activeLifeMasterTab === 'relationship' ? 'active' : ''}" id="life-pane-relationship">
        <div class="life-section-quote">
          "The Spouse Palace in the Day Branch seeks a partner of intellectual substance and equal sovereign agency, harmonizing through water-borne intuition."
        </div>
        <div class="life-attribute-grid">
          <div class="life-attribute-box">
            <div class="life-attribute-title"><i data-lucide="users" style="color: var(--violet-cosmic);"></i> Partnership Synergy</div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.55;">
              Attracts partners with profound depth, emotional wisdom, and creative drive. Mutual respect for individual autonomy is the vital anchor for longevity.
            </p>
          </div>
          <div class="life-attribute-box">
            <div class="life-attribute-title"><i data-lucide="sparkles" style="color: var(--ruby-element);"></i> Peach Blossom (Tao Hua) Ingress</div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.55;">
              Subtle, magnetic charisma peaks during Water and Fire transits. Natural magnetism draws loyal allies and inspiring mentors into key life milestones.
            </p>
          </div>
        </div>
      </div>

      <!-- Tab 4: Health Vulnerabilities -->
      <div class="life-tab-pane ${this.activeLifeMasterTab === 'health' ? 'active' : ''}" id="life-pane-health">
        <div class="life-section-quote">
          "Wood-dominated constitution requires conscious liver meridian nourishment, regular nervous system decompression, and deep hydration cycles."
        </div>
        <div class="life-attribute-grid">
          <div class="life-attribute-box">
            <div class="life-attribute-title"><i data-lucide="activity" style="color: var(--emerald-element);"></i> Meridian & Organ Focus</div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.55;">
              Primary meridians: Liver & Gallbladder. Secondary watch: Nervous tension and ocular fatigue during prolonged intellectual marathons.
            </p>
          </div>
          <div class="life-attribute-box">
            <div class="life-attribute-title"><i data-lucide="sun" style="color: var(--gold-light);"></i> Chronobiological Rhythms</div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.55;">
              Thrives when syncing morning routines to true solar dawn. Incorporate herbal teas (Chrysanthemum, Goji, Reishi) to soften excess internal heat.
            </p>
          </div>
        </div>
      </div>
    `;

    this.setupLifeMasterTabs();
  }
};

if (typeof window !== 'undefined') {
  window.FoundationEngine = FoundationEngine;
}
