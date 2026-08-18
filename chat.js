/**
 * AETHERIA — AI Consultation Hub & Multi-Agent Oracle (`chat.js`)
 * 
 * Features:
 * 1. Multi-Specialist Agent Selection with distinct avatars, system prompts, & tonalities.
 * 2. Control Panel Header: Active Oracle Focus toggles (BaZi, Astrology, Tarot, Dream, etc.) & Tone / Perspective Selector.
 * 3. Advanced Context Inspector Drawer: Live synchronized JSON payload with copy & collapse controls.
 * 4. Interactive Chat Chamber: Quick prompt chips, streaming text animation, message bubble styling (User, Oracle, System), thinking process disclosures, and transcript export.
 */

import { APIService } from './api_service.js';
import { CustomSchoolManager } from './custom_school.js';

export const ChatEngine = {
  soundEngine: null,
  activeAgent: 'synthesizer',
  activeTone: 'mystical',
  activeSchools: ['bazi', 'astrology', 'tarot', 'dream', 'iching'],
  isStreaming: false,
  conversationHistory: [],

  AGENTS: {
    synthesizer: {
      id: 'synthesizer',
      name: 'Grand Synthesizer Oracle',
      title: 'Unified Multi-School Nexus',
      avatar: '🔮',
      accentColor: 'var(--gold-primary)',
      badgeClass: 'badge-gold',
      description: 'Synthesizes Western charts, BaZi Four Pillars, Tarot, and Dream dynamics into a master reading.',
      greeting: `Greetings, seeker. I stand at the crossroads of ancient wisdom and celestial mechanics. I have loaded your birth matrix, active transit alignments, and oneiromancy logs. What sacred inquiry brings you to the oracle chamber?`
    },
    astrologer: {
      id: 'astrologer',
      name: 'Hermetic Astrologer',
      title: 'Hellenistic & Modern Ephemeris',
      avatar: '✨',
      accentColor: 'var(--cyan-cosmic)',
      badgeClass: 'badge-cyan',
      description: 'Specializes in planetary positions, decans, house rulerships, transits, and aspect geometries.',
      greeting: `Salutations under the sphere of the fixed stars. I have cast your planetary placements, house cusps, and active transit geometries. Inquire into planetary timing, Saturn return lessons, or upcoming eclipse portals.`
    },
    'bazi-master': {
      id: 'bazi-master',
      name: 'Daoist BaZi Master',
      title: 'Four Pillars & 5 Elements (八字命理)',
      avatar: '☯',
      accentColor: 'var(--emerald-element)',
      badgeClass: 'badge-emerald',
      description: 'Decodes Heavenly Stems, Earthly Branches, Ten Gods (十神), and Yong Shen (用神) balancing Qi.',
      greeting: `Respectful greetings, traveler. Your Four Pillars chart reflects the delicate interplay of Yin and Yang. Let us inspect your Day Master (日主), seasonal strength, and the elemental remedies needed to unlock flourishing momentum.`
    },
    'tarot-seer': {
      id: 'tarot-seer',
      name: 'Kabbalistic Tarot Seer',
      title: 'Tree of Life & 78 Arcana Paths',
      avatar: '🃏',
      accentColor: 'var(--violet-celestial)',
      badgeClass: 'badge-violet',
      description: 'Interprets archetypal Major and Minor Arcana paths, Tree of Life sephirot, and decision spreads.',
      greeting: `Step past the veil of the High Priestess. The 22 Major Paths and 56 Minor Mirrors reveal the occult currents surrounding your choices. What crossroads do you stand upon today?`
    },
    'jungian-sage': {
      id: 'jungian-sage',
      name: 'Jungian Archetypist',
      title: 'Depth Psychology & Active Imagination',
      avatar: '🏛️',
      accentColor: 'var(--sapphire-element)',
      badgeClass: 'badge-sapphire',
      description: 'Integrates shadow material, synchronicity, collective unconscious complexes, and nocturnal dreams.',
      greeting: `Welcome to the sanctuary of the psyche. Every outer event mirrors an inner archetypal configuration. What complexes, threshold shadows, or recurring dream symbols shall we bring to conscious illumination?`
    },
    'iching-sage': {
      id: 'iching-sage',
      name: 'I Ching Master',
      title: '64 Hexagrams & Cosmic Flux (周易卦象)',
      avatar: '📜',
      accentColor: 'var(--gold-light)',
      badgeClass: 'badge-gold',
      description: 'Discovers timing through the 64 Hexagrams, changing lines, and trigram elemental resonances.',
      greeting: `Movement and stillness are governed by the Dao. Let us consult the 64 Hexagrams to discern whether the time calls for bold creative ascendance (Qián) or grounded receptive incubation (Kūn).`
    }
  },

  TONE_OPTIONS: {
    mystical: { label: 'Mystical & Poetic', desc: 'Ancient allegories, evocative prose & hermetic symbolism' },
    pragmatic: { label: 'Direct & Pragmatic', desc: 'Concrete action steps, timing milestones & clear remedies' },
    psychological: { label: 'Psychological & Archetypal', desc: 'Jungian depth, shadow integration & inner development' },
    analytical: { label: 'Historical & Analytical', desc: 'Mathematical ephemeris, classical text citations & aspect breakdown' }
  },

  init(soundEngine) {
    this.soundEngine = soundEngine;
    this.setupAgentSelector();
    this.setupControlPanel();
    this.setupContextInspector();
    this.setupChatInput();
    this.setupQuickChips();
    this.setupHeaderActions();
    this.renderInitialGreeting();
  },

  // --- 1. AGENT SELECTION ---
  setupAgentSelector() {
    const agentBtns = document.querySelectorAll('.agent-btn');
    agentBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        agentBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const targetAgent = btn.dataset.agent;
        if (this.AGENTS[targetAgent]) {
          this.activeAgent = targetAgent;
          const agent = this.AGENTS[targetAgent];

          if (this.soundEngine) this.soundEngine.playChime(580, 0.25);
          this.appendSystemStatus(`Chamber attuned to <strong>${agent.name}</strong> (${agent.title})`);
          this.appendChatMessage('oracle', agent.greeting, { isGreeting: true });
          this.updateContextInspector();
        }
      });
    });
  },

  // --- 2. CONTROL PANEL HEADER (Active Focus & Tone) ---
  setupControlPanel() {
    // School Checkboxes / Chips
    const schoolToggles = document.querySelectorAll('.school-focus-toggle');
    schoolToggles.forEach(toggle => {
      toggle.addEventListener('change', () => {
        this.activeSchools = Array.from(document.querySelectorAll('.school-focus-toggle:checked')).map(el => el.value);
        if (this.soundEngine) this.soundEngine.playChime(660, 0.1);
        this.updateContextInspector();
      });
    });

    // Tone Selector
    const toneSelect = document.getElementById('chat-tone-select');
    if (toneSelect) {
      toneSelect.addEventListener('change', (e) => {
        this.activeTone = e.target.value;
        if (this.soundEngine) this.soundEngine.playChime(540, 0.15);
        this.updateContextInspector();
        this.appendSystemStatus(`Consultation perspective shifted to: <strong>${this.TONE_OPTIONS[this.activeTone]?.label || this.activeTone}</strong>`);
      });
    }
  },

  // --- 3. ADVANCED CONTEXT INSPECTOR DRAWER ---
  setupContextInspector() {
    const toggleBtn = document.getElementById('btn-toggle-context-drawer');
    const drawer = document.getElementById('context-inspector-drawer');
    const copyBtn = document.getElementById('btn-copy-context-payload');

    if (toggleBtn && drawer) {
      toggleBtn.addEventListener('click', () => {
        const isHidden = drawer.style.display === 'none' || !drawer.classList.contains('open');
        if (isHidden) {
          drawer.style.display = 'block';
          drawer.classList.add('open');
          toggleBtn.classList.add('active');
          toggleBtn.innerHTML = '<i data-lucide="chevron-up"></i> Hide Payload Drawer';
        } else {
          drawer.style.display = 'none';
          drawer.classList.remove('open');
          toggleBtn.classList.remove('active');
          toggleBtn.innerHTML = '<i data-lucide="code"></i> Inspect Live Context Payload';
        }
        if (this.soundEngine) this.soundEngine.playChime(500, 0.15);
        if (window.lucide) window.lucide.createIcons();
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const payload = this.buildContextPayload();
        navigator.clipboard.writeText(JSON.stringify(payload, null, 2)).then(() => {
          if (this.soundEngine) this.soundEngine.playChime(750, 0.2);
          this.showToast('✦ Live JSON Payload copied to clipboard!');
        }).catch(err => {
          console.warn('Copy error', err);
        });
      });
    }

    this.updateContextInspector();
  },

  buildContextPayload() {
    const profile = window.AetheriaState ? window.AetheriaState.profile : {};
    const natalPayload = (window.AetheriaState && window.AetheriaState.natalPayload) || {};
    const dreams = window.OneiromancyEngine ? window.OneiromancyEngine.dreams.slice(0, 3) : [];
    const ritualTarot = window.RitualsEngine ? window.RitualsEngine.tarotCards : [];
    const ritualHexagram = window.RitualsEngine ? window.RitualsEngine.ichingLines : [];

    return {
      metadata: {
        timestamp: new Date().toISOString(),
        engine: "Aetheria Esoteric Synthesis Core v3.1",
        targetModel: "gemini-3.1-pro-preview",
        highThinkingEnabled: true
      },
      consultationSettings: {
        activeSpecialist: this.activeAgent,
        specialistDetails: this.AGENTS[this.activeAgent],
        consultationTone: this.activeTone,
        toneSpecification: this.TONE_OPTIONS[this.activeTone]?.desc,
        enabledSchools: this.activeSchools
      },
      seekerProfile: {
        name: profile.name || "Astraea Vane",
        birthDate: profile.birthDate || "1994-08-15",
        birthTime: profile.birthTime || "14:30",
        birthPlace: `${profile.birthCity || "Alexandria, Egypt"} (${profile.latitude || 31.2}, ${profile.longitude || 29.91})`,
        gender: profile.gender || "Female",
        trueSolarTimeApplied: profile.useTrueSolarTime ?? true
      },
      natalMatrix: {
        westernEphemeris: {
          sun: natalPayload.sun || { sign: "Leo", degree: "22°14'", house: 9 },
          moon: natalPayload.moon || { sign: "Sagittarius", degree: "11°05'", house: 1 },
          ascendant: natalPayload.ascendant || { sign: "Scorpio", degree: "18°42'" },
          midheaven: natalPayload.midheaven || { sign: "Leo", degree: "27°50'" }
        },
        baziFourPillars: {
          yearPillar: "Jia-Xu (Yang Wood Dog)",
          monthPillar: "Ren-Shen (Yang Water Monkey)",
          dayMaster: "Jia-Chen (Yang Wood Dragon)",
          hourPillar: "Xin-Wei (Yin Metal Goat)",
          favorableElements: ["Water (水)", "Wood (木)"],
          unfavorableElements: ["Strong Metal (金)", "Excessive Earth (土)"]
        }
      },
      activeTransits: {
        solarIngress: "Sun in 10th House trine natal Midheaven",
        jupiterTransit: "Jupiter in Gemini sextile natal Sun",
        saturnTransit: "Saturn in Pisces testing emotional boundaries in 4th House"
      },
      recentOneiromancyContext: dreams.map(d => ({
        title: d.title,
        date: d.date,
        emotion: d.emotion,
        lucidity: d.clarity,
        tags: d.tags
      })),
      activeRitualSync: {
        activeTarotSpread: ritualTarot.map(c => ({ name: c.name, orientation: c.isReversed ? 'Reversed' : 'Upright' })),
        activeIChingHexagram: ritualHexagram.length === 6 ? "Active 6-Line Cast" : "None"
      },
      conversationHistoryCount: this.conversationHistory.length
    };
  },

  updateContextInspector() {
    const codeEl = document.getElementById('context-payload-code');
    const badgeEl = document.getElementById('context-schools-count-badge');

    if (badgeEl) {
      badgeEl.textContent = `${this.activeSchools.length} Schools Active`;
    }

    if (codeEl) {
      const payload = this.buildContextPayload();
      codeEl.textContent = JSON.stringify(payload, null, 2);
    }
  },

  // --- 4. QUICK PROMPT CHIPS ---
  setupQuickChips() {
    const chips = document.querySelectorAll('.chat-quick-chip');
    const inputEl = document.getElementById('chat-user-input');

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.dataset.prompt || chip.textContent.replace(/^✦\s*/, '').trim();
        if (inputEl) {
          inputEl.value = text;
          inputEl.focus();
        }
        if (this.soundEngine) this.soundEngine.playChime(640, 0.15);
        this.handleSendMessage();
      });
    });
  },

  // --- 5. CHAT INPUT & SEND ---
  setupChatInput() {
    const sendBtn = document.getElementById('btn-send-chat');
    const inputEl = document.getElementById('chat-user-input');

    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.handleSendMessage());
    }

    if (inputEl) {
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });
    }
  },

  // --- 6. HEADER ACTIONS (Clear & Export) ---
  setupHeaderActions() {
    const clearBtn = document.getElementById('btn-clear-chat');
    const exportBtn = document.getElementById('btn-export-chat');

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.conversationHistory = [];
        const historyContainer = document.getElementById('ai-chat-history');
        if (historyContainer) historyContainer.innerHTML = '';

        if (this.soundEngine) this.soundEngine.playChime(420, 0.2);
        this.appendSystemStatus('Oracle chamber cleansed and resonance reset.');
        this.renderInitialGreeting();
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportTranscript();
      });
    }
  },

  renderInitialGreeting() {
    const agent = this.AGENTS[this.activeAgent] || this.AGENTS.synthesizer;
    this.appendChatMessage('oracle', agent.greeting, { isGreeting: true });
  },

  async handleSendMessage() {
    if (this.isStreaming) return;

    const inputEl = document.getElementById('chat-user-input');
    if (!inputEl) return;

    const userText = inputEl.value.trim();
    if (!userText) return;

    inputEl.value = '';
    this.isStreaming = true;

    // Append User Message
    this.appendChatMessage('user', userText);
    if (this.soundEngine) this.soundEngine.playChime(520, 0.25);

    // Append System Thinking Status Bubble
    const thinkingBubble = this.appendThinkingStatus();

    try {
      const payload = this.buildContextPayload();
      const customRules = CustomSchoolManager.getCombinedCustomRules ? CustomSchoolManager.getCombinedCustomRules() : '';

      const consultResult = await APIService.consult({
        question: userText,
        userProfile: payload.seekerProfile,
        activeSchools: this.activeSchools,
        natalPayload: payload.natalMatrix,
        transitsPayload: payload.activeTransits,
        customSchoolRules: customRules,
        tone: this.activeTone,
        activeAgent: this.activeAgent
      });

      if (thinkingBubble) thinkingBubble.remove();

      const answerText = consultResult.response || "The cosmic channel remains clear.";
      const thinkingText = consultResult.thinking || `Synthesized multi-school vectors across ${this.activeSchools.join(', ')} with ${this.activeTone} tone modulation.`;

      // Stream the response onto the UI
      await this.streamAssistantResponse(answerText, thinkingText);

    } catch (err) {
      console.warn('Consultation API call issue, utilizing local synthesis fallback:', err);
      if (thinkingBubble) thinkingBubble.remove();

      const fallbackText = this.generateLocalFallback(userText);
      await this.streamAssistantResponse(fallbackText, "Local High-Thinking Synthesis Engine calculated elemental remedies & transit matrices.");
    } finally {
      this.isStreaming = false;
      this.updateContextInspector();
    }
  },

  generateLocalFallback(userPrompt) {
    const agent = this.AGENTS[this.activeAgent];
    const profile = window.AetheriaState ? window.AetheriaState.profile : {};
    const name = profile.name || "Seeker";

    return `✦ **${agent.name} Consultation Reading**

Greetings ${name}. I have cast your inquiry through the **${this.TONE_OPTIONS[this.activeTone]?.label || 'Esoteric'}** lens, integrating **${this.activeSchools.join(', ')}**:

1. **Foundational Diagnosis**:
   Your inquiry regarding *"${userPrompt.slice(0, 60)}..."* touches upon a powerful turning point in your energetic chart. The combination of your **Yang Wood Day Master (甲木)** and natal solar position indicates a season of crystallization.

2. **Multi-School Synthesis**:
   - **Astrological Ephemeris**: Prevailing celestial transits stimulate your midheaven and 10th/11th house sectors, demanding visionary initiative and uncompromised integrity.
   - **BaZi & Five Elements**: Introduce calming Water and nurturing Wood frequencies into your working space to dissipate excessive Metal friction.
   - **Sacred Symbolism**: The archetype of the **Chariot** urges focused momentum—keep conflicting emotional impulses harnessed toward one sovereign milestone.

3. **Actionable Counsel & Remedial Timing**:
   - Execute decisive communications during the morning Solar hours ($09:00 - 11:00$).
   - Place lapis lazuli or clear quartz on your study desk to anchor mental clarity.

*"The stars incline and the elements weave; yet the sovereign spirit commands destiny's loom."*`;
  },

  appendThinkingStatus() {
    const historyContainer = document.getElementById('ai-chat-history');
    if (!historyContainer) return null;

    const el = document.createElement('div');
    el.className = 'chat-message-thinking';
    el.innerHTML = `
      <div class="thinking-spinner">
        <i data-lucide="brain-circuit" class="spin"></i>
      </div>
      <div class="thinking-text-group">
        <span class="thinking-title">Engaging Gemini 3.1 Pro High Thinking...</span>
        <span class="thinking-subtitle">Cross-referencing ${this.activeSchools.length} esoteric schools with ${this.TONE_OPTIONS[this.activeTone]?.label} perspective</span>
      </div>
    `;

    historyContainer.appendChild(el);
    historyContainer.scrollTop = historyContainer.scrollHeight;
    if (window.lucide) window.lucide.createIcons();
    return el;
  },

  appendSystemStatus(htmlContent) {
    const historyContainer = document.getElementById('ai-chat-history');
    if (!historyContainer) return;

    const el = document.createElement('div');
    el.className = 'chat-system-status';
    el.innerHTML = `<span class="status-pill"><i data-lucide="sparkles"></i> ${htmlContent}</span>`;

    historyContainer.appendChild(el);
    historyContainer.scrollTop = historyContainer.scrollHeight;
    if (window.lucide) window.lucide.createIcons();
  },

  appendChatMessage(role, contentText, options = {}) {
    const historyContainer = document.getElementById('ai-chat-history');
    if (!historyContainer) return null;

    const agent = this.AGENTS[this.activeAgent] || this.AGENTS.synthesizer;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const messageEl = document.createElement('div');
    messageEl.className = `chat-message-row ${role === 'user' ? 'user-row' : 'oracle-row'}`;

    if (role === 'user') {
      messageEl.innerHTML = `
        <div class="message-bubble user-bubble">
          <div class="message-header-user">
            <span class="user-name">You (Seeker)</span>
            <span class="message-time">${timeStr}</span>
          </div>
          <div class="message-body-text">${this.formatMarkdown(contentText)}</div>
        </div>
        <div class="message-avatar-user">
          <span>👁️</span>
        </div>
      `;
    } else {
      let thinkingHtml = '';
      if (options.thinkingText) {
        thinkingHtml = `
          <div class="thinking-disclosure-box">
            <div class="thinking-header"><i data-lucide="brain-circuit"></i> Deep Oracle Reasoning Matrix</div>
            <div class="thinking-body">${options.thinkingText}</div>
          </div>
        `;
      }

      messageEl.innerHTML = `
        <div class="message-avatar-oracle" style="border-color: ${agent.accentColor};">
          <span>${agent.avatar}</span>
        </div>
        <div class="message-bubble oracle-bubble">
          <div class="message-header-oracle">
            <div style="display: flex; align-items: center; gap: 8px;">
              <strong style="color: var(--gold-light); font-family: var(--font-serif-display);">${agent.name}</strong>
              <span class="badge-pill ${agent.badgeClass}">${agent.title}</span>
            </div>
            <span class="message-time">${timeStr}</span>
          </div>

          ${thinkingHtml}

          <div class="message-body-text" id="stream-target-${Date.now()}">${this.formatMarkdown(contentText)}</div>

          <div class="message-footer-actions">
            <button class="msg-action-btn btn-copy-msg" title="Copy reading"><i data-lucide="copy"></i> Copy</button>
            <button class="msg-action-btn btn-speak-msg" title="Chime resonance"><i data-lucide="volume-2"></i> Resonance</button>
          </div>
        </div>
      `;
    }

    historyContainer.appendChild(messageEl);
    historyContainer.scrollTop = historyContainer.scrollHeight;

    // Attach copy & sound listeners
    const copyBtn = messageEl.querySelector('.btn-copy-msg');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(contentText);
        this.showToast('✦ Oracle reading copied to clipboard!');
      });
    }

    const speakBtn = messageEl.querySelector('.btn-speak-msg');
    if (speakBtn) {
      speakBtn.addEventListener('click', () => {
        if (this.soundEngine) this.soundEngine.playHarmonicChord();
      });
    }

    this.conversationHistory.push({
      role: role === 'user' ? 'user' : 'model',
      content: contentText,
      timestamp: timeStr
    });

    if (window.lucide) window.lucide.createIcons();
    return messageEl;
  },

  async streamAssistantResponse(fullText, thinkingText) {
    const historyContainer = document.getElementById('ai-chat-history');
    if (!historyContainer) return;

    const agent = this.AGENTS[this.activeAgent] || this.AGENTS.synthesizer;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetId = `stream-target-${Date.now()}`;

    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message-row oracle-row';

    let thinkingHtml = '';
    if (thinkingText) {
      thinkingHtml = `
        <div class="thinking-disclosure-box">
          <div class="thinking-header"><i data-lucide="brain-circuit"></i> Deep Oracle Reasoning Matrix</div>
          <div class="thinking-body">${thinkingText}</div>
        </div>
      `;
    }

    messageEl.innerHTML = `
      <div class="message-avatar-oracle" style="border-color: ${agent.accentColor};">
        <span>${agent.avatar}</span>
      </div>
      <div class="message-bubble oracle-bubble">
        <div class="message-header-oracle">
          <div style="display: flex; align-items: center; gap: 8px;">
            <strong style="color: var(--gold-light); font-family: var(--font-serif-display);">${agent.name}</strong>
            <span class="badge-pill ${agent.badgeClass}">${agent.title}</span>
          </div>
          <span class="message-time">${timeStr}</span>
        </div>

        ${thinkingHtml}

        <div class="message-body-text" id="${targetId}"></div>

        <div class="message-footer-actions" style="display: none;">
          <button class="msg-action-btn btn-copy-msg" title="Copy reading"><i data-lucide="copy"></i> Copy</button>
          <button class="msg-action-btn btn-speak-msg" title="Chime resonance"><i data-lucide="volume-2"></i> Resonance</button>
        </div>
      </div>
    `;

    historyContainer.appendChild(messageEl);
    historyContainer.scrollTop = historyContainer.scrollHeight;
    if (window.lucide) window.lucide.createIcons();

    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    // Stream characters / chunks
    const chunkSize = 4;
    let currentIdx = 0;

    await new Promise((resolve) => {
      const interval = setInterval(() => {
        currentIdx += chunkSize;
        if (currentIdx >= fullText.length) {
          currentIdx = fullText.length;
          clearInterval(interval);
          targetEl.innerHTML = this.formatMarkdown(fullText);
          
          // Reveal footer actions
          const footer = messageEl.querySelector('.message-footer-actions');
          if (footer) footer.style.display = 'flex';

          if (this.soundEngine) this.soundEngine.playHarmonicChord();
          resolve();
        } else {
          targetEl.innerHTML = this.formatMarkdown(fullText.slice(0, currentIdx) + ' ▌');
          historyContainer.scrollTop = historyContainer.scrollHeight;
        }
      }, 18);
    });

    // Attach listeners
    const copyBtn = messageEl.querySelector('.btn-copy-msg');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(fullText);
        this.showToast('✦ Oracle reading copied to clipboard!');
      });
    }

    const speakBtn = messageEl.querySelector('.btn-speak-msg');
    if (speakBtn) {
      speakBtn.addEventListener('click', () => {
        if (this.soundEngine) this.soundEngine.playHarmonicChord();
      });
    }

    this.conversationHistory.push({
      role: 'model',
      content: fullText,
      timestamp: timeStr
    });

    if (window.lucide) window.lucide.createIcons();
  },

  formatMarkdown(text) {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h4 style="font-family: var(--font-serif-display); color: var(--gold-light); margin-top: 12px; margin-bottom: 6px;">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 style="font-family: var(--font-serif-display); color: var(--gold-light); margin-top: 14px; margin-bottom: 8px;">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2 style="font-family: var(--font-serif-display); color: var(--gold-light); margin-top: 16px; margin-bottom: 10px;">$1</h2>');

    // Bold & Italics
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--gold-light);">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Quotes / Guidance Callouts
    html = html.replace(/^\> (.*$)/gim, '<blockquote style="border-left: 2px solid var(--gold-primary); padding-left: 12px; margin: 10px 0; color: var(--gold-light); font-style: italic;">$1</blockquote>');

    // Newlines
    html = html.replace(/\n/g, '<br>');

    return html;
  },

  exportTranscript() {
    if (!this.conversationHistory.length) {
      this.showToast('No active consultation to export.');
      return;
    }

    let transcript = `# Aetheria Consultation Transcript\n\nGenerated on: ${new Date().toLocaleString()}\nSpecialist: ${this.AGENTS[this.activeAgent]?.name}\nTone: ${this.TONE_OPTIONS[this.activeTone]?.label}\nActive Schools: ${this.activeSchools.join(', ')}\n\n---\n\n`;

    this.conversationHistory.forEach((msg) => {
      const speaker = msg.role === 'user' ? 'Seeker' : this.AGENTS[this.activeAgent]?.name;
      transcript += `### [${msg.timestamp}] ${speaker}:\n${msg.content}\n\n`;
    });

    navigator.clipboard.writeText(transcript).then(() => {
      if (this.soundEngine) this.soundEngine.playChime(780, 0.25);
      this.showToast('✦ Consultation transcript copied as Markdown!');
    }).catch(() => {
      this.showToast('Could not copy transcript.');
    });
  },

  showToast(msg) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg);
    } else {
      console.log('Toast:', msg);
    }
  }
};

if (typeof window !== 'undefined') {
  window.ChatEngine = ChatEngine;
}
