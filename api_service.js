/**
 * AETHERIA — Centralized API Integration Service Layer (`api_service.js`)
 * 
 * Supports:
 * - Option A: Dify / n8n Webhook API endpoint integration.
 * - Option B: Direct / Proxied Google Gemini API endpoint with High Thinking.
 * - Master Prompt Synthesizer injection following strict multi-school directives.
 * - Robust error handling, offline mock fallback engine, and network status notifications.
 */

export const APIService = {
  // Config state saved in localStorage
  config: {
    provider: 'gemini', // 'gemini' | 'webhook'
    webhookUrl: '',
    webhookAuthToken: '',
    customApiKey: '',
    timeoutMs: 30000
  },

  MASTER_PROMPT_TEMPLATE: `# ROLE & IDENTITY
You are "The Master Synthesizer," an elite multi-school divination and destiny analyst. You combine Western Astrology, BaZi (Four Pillars), Zi Wei Dou Shu, I Ching, Tarot, and ancient occult traditions into cohesive, deeply insightful life guidance.

# CORE OPERATING DIRECTIVES
1. STRICT DATA GROUNDING: Base all readings EXCLUSIVELY on the provided \`USER_NATAL_JSON\` and \`CURRENT_TRANSIT_JSON\`. Do not alter calculated degrees, elements, or stem/branch placements.
2. HOLISTIC SYNTHESIS: Never present readings as disjointed bullet lists from separate schools. Synthesize them into a single coherent story.
3. CONFLICT RESOLUTION PROTOCOL:
   - External Timing / Action: Prioritize Eastern Systems (BaZi Luck Pillars & Day Stems) for macro timing and elemental harmony.
   - Internal Psychological Landscape: Prioritize Western Astrology (Transits & Houses) for emotional processing and inner growth.
   - Immediate Tactical Guidance: Prioritize Horary tools (Tarot, Runes, I Ching) for present-moment decision-making.
4. TONE & STYLE: Adapt to the requested \`TONE_PREFERENCE\` (e.g., Mystical & Poetic, Direct & Pragmatic, Psychological, Historical & Analytical). Maintain an empowering, non-deterministic stance—fortune telling shows energetic weather, not unalterable fate.
5. BOUNDARIES: Refrain from diagnosing medical conditions, giving exact legal advice, or making specific stock market/financial guarantees.

# DYNAMIC INPUT CONTEXT
- User Profile: {{USER_PROFILE}}
- Active Schools Enabled: {{ACTIVE_SCHOOLS}}
- Calculated Natal Payload: {{USER_NATAL_JSON}}
- Active Transits / Current Energy: {{CURRENT_TRANSIT_JSON}}
- Custom School Injected Rules: {{CUSTOM_SCHOOL_RULES}}
- Requested Horizon / Focus: {{TIME_HORIZON_OR_QUESTION}}

# RESPONSE OUTPUT STRUCTURE
1. Executive Energetic Weather (Core theme & overall energy index)
2. Elemental & Planetary Dynamics (Key interactions between active systems)
3. Strategic Guidance & Opportunities (Actionable advice)
4. Shadows & Blindspots (Cautions and friction points)
5. Oracle Reflection (Closing synthesis or journal prompt)`,

  init() {
    this.loadConfig();
  },

  loadConfig() {
    try {
      const saved = localStorage.getItem('aetheria_api_config');
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not load API config:', e);
    }
  },

  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem('aetheria_api_config', JSON.stringify(this.config));
  },

  /**
   * Request Builder: Combines User Question + Natal JSON + Active School Settings + Custom School Prompts
   */
  buildRequestPayload(options) {
    const {
      question,
      userProfile = {},
      activeSchools = ['bazi', 'astrology', 'tarot', 'dream', 'iching'],
      natalPayload = {},
      transitsPayload = {},
      customSchoolRules = '',
      tone = 'mystical',
      activeAgent = 'synthesizer'
    } = options;

    const formattedMasterPrompt = this.MASTER_PROMPT_TEMPLATE
      .replace('{{USER_PROFILE}}', JSON.stringify(userProfile, null, 2))
      .replace('{{ACTIVE_SCHOOLS}}', activeSchools.join(', '))
      .replace('{{USER_NATAL_JSON}}', JSON.stringify(natalPayload, null, 2))
      .replace('{{CURRENT_TRANSIT_JSON}}', JSON.stringify(transitsPayload, null, 2))
      .replace('{{CUSTOM_SCHOOL_RULES}}', customSchoolRules || 'None')
      .replace('{{TIME_HORIZON_OR_QUESTION}}', question);

    return {
      masterPrompt: formattedMasterPrompt,
      systemPrompt: formattedMasterPrompt,
      school: activeAgent,
      prompt: question,
      tone: tone,
      activeSchools: activeSchools,
      userProfile: userProfile,
      natalPayload: natalPayload,
      transitsPayload: transitsPayload,
      customSchoolRules: customSchoolRules,
      meta: {
        timestamp: new Date().toISOString(),
        clientVersion: '3.1.0-master-synthesizer'
      }
    };
  },

  /**
   * Main Dispatcher for Divination Consultations
   */
  async consult(options) {
    const payload = this.buildRequestPayload(options);

    if (this.config.provider === 'webhook' && this.config.webhookUrl) {
      return this.callWebhookEndpoint(payload);
    } else {
      return this.callGeminiBackend(payload);
    }
  },

  /**
   * Backend Dispatcher Option A: Dify / n8n Webhook API endpoint
   */
  async callWebhookEndpoint(payload) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      if (this.config.webhookAuthToken) {
        headers['Authorization'] = `Bearer ${this.config.webhookAuthToken}`;
      }

      const res = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Webhook responded with HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      // Handle standard Dify / n8n formats
      const responseText = data.answer || data.text || data.response || data.output || (typeof data === 'string' ? data : JSON.stringify(data));
      const thinkingText = data.thinking || data.reasoning || `Webhook workflow processed by external engine.`;

      return {
        success: true,
        response: responseText,
        thinking: thinkingText,
        provider: 'webhook',
        modelUsed: data.model || 'Dify/n8n Automation Node'
      };
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('Webhook dispatch failed, falling back to local synthesis engine:', err);
      return this.generateOfflineFallback(payload, err.message);
    }
  },

  /**
   * Backend Dispatcher Option B: Google Gemini API Endpoint via server proxy
   */
  async callGeminiBackend(payload) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const res = await fetch('/api/divination/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      return {
        success: true,
        response: data.response || "Cosmic channel clear.",
        thinking: data.thinking || "Unified multi-school synthesis verified across planetary ephemeris, stem-branch dynamics, and archetypal matrices.",
        provider: 'gemini',
        modelUsed: data.modelUsed || 'gemini-3.1-pro-preview'
      };
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('Server divination call failed, executing local offline engine:', err);
      return this.generateOfflineFallback(payload, err.message);
    }
  },

  /**
   * Robust Offline Synthesis Engine
   */
  generateOfflineFallback(payload, errorMessage = '') {
    const name = payload.userProfile?.name || 'Seeker';
    const activeSchoolsStr = (payload.activeSchools || []).join(', ') || 'BaZi, Astrology, Tarot, Dream, I Ching';
    const tone = payload.tone || 'mystical';
    const q = payload.prompt || 'General Cosmic Synthesis';

    const fallbackResponse = `### Executive Energetic Weather
The energetic current surrounding your inquiry (*"${q.slice(0, 50)}..."*) reflects an active convergence of foundational potential and emerging opportunity. Your astrological midheaven configurations and Yang Wood Day Master establish an expansive baseline (Energy Index: 88/100).

### Elemental & Planetary Dynamics
- **Astrological Ephemeris**: Transiting celestial bodies stimulate your visionary 9th and 10th houses, inviting high-level long-range planning.
- **BaZi & Five Elements**: Favorable Water and Wood Qi are elevated; maintain equilibrium by grounding through Earth and avoiding impulsive Metal friction.
- **Active Schools (${activeSchoolsStr})**: The symbols align toward deliberate cultivation over hasty reaction.

### Strategic Guidance & Opportunities
1. **Pacing & Manifestation**: Take proactive strides during the morning solar window (09:00 - 11:00).
2. **Harmonic Resonance**: Anchor clear physical boundaries in your workspace with natural wood or crystal focal points.

### Shadows & Blindspots
Be mindful of cognitive overwhelm caused by taking on secondary obligations too quickly. Ensure foundational structures are secure before expanding scope.

### Oracle Reflection
*"The celestial loom weaves both thread and tension; sovereign clarity transforms the tapestry into destiny."*`;

    return {
      success: true,
      response: fallbackResponse,
      thinking: `[Offline Local Synthesis Engine Active] Processed inquiry with master prompt directives across ${activeSchoolsStr} with ${tone} tone. Notice: ${errorMessage || 'Local mode active.'}`,
      provider: 'offline-local',
      modelUsed: 'Aetheria-Esoteric-Core-Local'
    };
  }
};

if (typeof window !== 'undefined') {
  window.APIService = APIService;
}
