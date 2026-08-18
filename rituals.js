/**
 * AETHERIA — Interactive Divination Suite (`rituals.js`)
 * 
 * Manages:
 * 1. School Selector: [ Tarot ] [ Runes ] [ I Ching ]
 * 2. Tarot Module: Interactive deck shuffle animation, 3-Card Spread (Past, Present, Future), 3D card-flip physics, hover interpretation previews.
 * 3. I Ching Module: Digital 3-coin toss with audio-visual tumbling animation, building 6 lines from bottom to top, identifying solid/broken & changing lines, primary & transformed hexagrams.
 * 4. Rune Casting Module: Obsidian stone pouch with 3-stone cast onto an illuminated dark altar circle, authentic 24 Elder Futhark glyphs and Wyrd synthesis.
 */

export const RitualsEngine = {
  activeRitualTab: 'tarot',
  soundEngine: null,

  // TAROT DECK DATA (Major Arcana + Key Archetypes)
  TAROT_DECK: [
    { id: 0, name: "The Fool", roman: "0", glyph: "🃠", element: "Air", planet: "Uranus", keywords: ["New Beginnings", "Pure Potential", "Spontaneous Leap", "Faith"], upright: "You stand at the threshold of a sovereign new cycle. Embrace uncalculated trust and step fearlessly into uncharted psychic territory.", reversed: "Recklessness, fear of the unknown, hesitation at the precipice." },
    { id: 1, name: "The Magician", roman: "I", glyph: "🃡", element: "Air", planet: "Mercury", keywords: ["Willpower", "Conscious Creation", "Resourcefulness", "Elemental Mastery"], upright: "As above, so below. You possess all four elemental tools necessary to materialize your vision into waking reality.", reversed: "Scattered intention, untapped potential, optical illusion, misdirected will." },
    { id: 2, name: "The High Priestess", roman: "II", glyph: "🃢", element: "Water", planet: "Moon", keywords: ["Intuition", "Sacred Mystery", "Unconscious Gnosis", "Divine Feminine"], upright: "Behind the veil of duality lies unspoken truth. Trust your psychic currents and nocturnal visions over external chatter.", reversed: "Suppressed intuition, superficial secrets, ignoring your inner oracle." },
    { id: 3, name: "The Empress", roman: "III", glyph: "🃣", element: "Earth", planet: "Venus", keywords: ["Fertility", "Abundance", "Sensory Creation", "Nurturing Growth"], upright: "Creative projects are ready to burgeon in fertile soil. Harmonize with natural abundance and sensual beauty.", reversed: "Creative drought, self-neglect, over-smothering, disharmony." },
    { id: 4, name: "The Emperor", roman: "IV", glyph: "🃤", element: "Fire", planet: "Aries", keywords: ["Sovereignty", "Structural Order", "Authoritative Wisdom", "Protection"], upright: "Establish firm boundaries and enduring foundations. Exercise visionary leadership rooted in justice and clear strategic discipline.", reversed: "Tyranny, rigidity, loss of control, disorganized ambition." },
    { id: 5, name: "The Hierophant", roman: "V", glyph: "🃥", element: "Earth", planet: "Taurus", keywords: ["Esoteric Lineage", "Spiritual Tradition", "Mentor Wisdom", "Initiation"], upright: "You are being initiated into higher sacred study. Seek timeless guidance from ancestral lineages and revered masters.", reversed: "Dogma, rebellion against outdated orthodoxy, forging an unconventional path." },
    { id: 6, name: "The Lovers", roman: "VI", glyph: "🃦", element: "Air", planet: "Gemini", keywords: ["Sacred Union", "Soul Resonance", "Moral Alignment", "Alchemical Marriage"], upright: "A profound crossroads of soul alignment. True union occurs when your inner masculine and feminine polarities integrate in harmony.", reversed: "Inner conflict, misalignment of values, disharmonious partnership." },
    { id: 7, name: "The Chariot", roman: "VII", glyph: "🃧", element: "Water", planet: "Cancer", keywords: ["Triumphant Will", "Focused Momentum", "Overcoming Duality", "Victory"], upright: "Direct opposing emotional drives with sovereign reins. Focused momentum guarantees breakthrough over outer obstacles.", reversed: "Lack of steering, aggressive burnout, collision of conflicting urges." },
    { id: 8, name: "Strength", roman: "VIII", glyph: "🃨", element: "Fire", planet: "Leo", keywords: ["Gentle Courage", "Compassionate Mastery", "Taming the Shadow", "Patience"], upright: "True power is silent and compassionate. Softly tame the wild instinctual fires within with unwavering grace and patience.", reversed: "Self-doubt, brute force over wisdom, vulnerability to anger." },
    { id: 9, name: "The Hermit", roman: "IX", glyph: "🃩", element: "Earth", planet: "Virgo", keywords: ["Solitary Gnosis", "Inner Lantern", "Spiritual Retreat", "Soul Seeking"], upright: "Withdraw from external noise into the sanctuary of the self. Your inner lantern illuminates the next solitary step of the ascent.", reversed: "Isolation, loneliness, refusing inner wisdom, fear of seclusion." },
    { id: 10, name: "Wheel of Fortune", roman: "X", glyph: "🃪", element: "Fire", planet: "Jupiter", keywords: ["Karmic Cycles", "Destiny Shift", "Synchronicity", "Cosmic Ingress"], upright: "The wheel turns inexorably upward. Align with serendipitous celestial currents and welcome karmic evolution.", reversed: "Resisting natural cycles, lingering setbacks, attachment to temporary fortune." },
    { id: 11, name: "Justice", roman: "XI", glyph: "🃫", element: "Air", planet: "Libra", keywords: ["Karmic Truth", "Equilibrium", "Cause & Effect", "Clarity"], upright: "Universal balance is restored. Decisions made with total integrity and empirical truth yield triumphant long-term outcomes.", reversed: "Dishonesty, unfair bias, refusal to accept accountability." },
    { id: 12, name: "The Hanged Man", roman: "XII", glyph: "🃬", element: "Water", planet: "Neptune", keywords: ["Surrender", "New Perspective", "Sacred Pause", "Spiritual Metamorphosis"], upright: "Voluntary suspension of outer action unlocks transcendental perspective. Surrender the ego's timetable to divine orchestration.", reversed: "Needless martyrdom, stalling out of fear, resistance to spiritual sacrifice." },
    { id: 13, name: "Death (Rebirth)", roman: "XIII", glyph: "🃭", element: "Water", planet: "Scorpio", keywords: ["Profound Metamorphosis", "Ego Dissolution", "Closing of Cycles", "Rebirth"], upright: "The old skin must shed so the sovereign phoenix may rise. Joyfully release decaying structures to make room for vitality.", reversed: "Clinging to the obsolete, prolonged mourning, fear of radical renewal." },
    { id: 14, name: "Temperance", roman: "XIV", glyph: "🃮", element: "Fire", planet: "Sagittarius", keywords: ["Alchemical Synthesis", "Middle Way", "Patience", "Divine Harmony"], upright: "Gently pour the fiery and watery currents back and forth until the philosopher's elixir crystallizes. Divine moderation wins.", reversed: "Excess, spiritual imbalance, impatience, disharmonious combinations." },
    { id: 15, name: "The Devil", roman: "XV", glyph: "🃯", element: "Earth", planet: "Capricorn", keywords: ["Shadow Unmasking", "Illusory Chains", "Material Attachment", "Primal Vitality"], upright: "Examine the voluntary chains of illusion and addictive habits. Integrating your shadow frees immense primal creative force.", reversed: "Breaking free from toxicity, severing karmic bondage, awakening to freedom." },
    { id: 16, name: "The Tower", roman: "XVI", glyph: "🃰", element: "Fire", planet: "Mars", keywords: ["Lightning Revelation", "Dissolution of Illusion", "Sudden Awakening", "Truth"], upright: "The lightning of truth shatters false pride and fragile edifices. What falls was not built on bedrock; rejoice in clear ground.", reversed: "Averting avoidable disaster, inner transformation without external catastrophe." },
    { id: 17, name: "The Star", roman: "XVII", glyph: "🃱", element: "Air", planet: "Aquarius", keywords: ["Celestial Hope", "Healing Waters", "Cosmic Inspiration", "Serenity"], upright: "Under the starlit sky, crystalline hope and restorative grace pour into your soul. You are divinely protected and inspired.", reversed: "Despair, dimmed faith, disconnection from spiritual source, exhaustion." },
    { id: 18, name: "The Moon", roman: "XVIII", glyph: "🃲", element: "Water", planet: "Pisces", keywords: ["Astral Illusions", "Dream Scrying", "Subconscious Depths", "Tidal Mystery"], upright: "Navigate the shifting mists of the subconscious. Beware of projected illusions; look to dreams and instinct for guidance.", reversed: "Clearing of psychic confusion, unmasking deception, overcoming nocturnal fears." },
    { id: 19, name: "The Sun", roman: "XIX", glyph: "🃳", element: "Fire", planet: "Sun", keywords: ["Radiant Vitality", "Joyous Truth", "Wholeness", "Solar Sovereignty"], upright: "Supreme warmth, unclouded clarity, and radiant vitality illuminate your path. Celebrate triumphant creative manifestation.", reversed: "Temporary cloudiness, delayed celebration, struggling to shine brightly." },
    { id: 20, name: "Judgement", roman: "XX", glyph: "🃴", element: "Fire", planet: "Pluto", keywords: ["Spiritual Awakening", "Higher Calling", "Rebirth of Purpose", "Absolution"], upright: "The trumpet of your higher calling sounds across the cosmos. Rise into your true evolutionary purpose with absolute clarity.", reversed: "Self-doubt, harsh self-criticism, ignoring the soul's divine summons." },
    { id: 21, name: "The World", roman: "XXI", glyph: "🃵", element: "Earth", planet: "Saturn", keywords: ["Mastery", "Cosmic Completion", "Wholeness", "Infinite Horizons"], upright: "A grand cosmic cycle concludes in triumphant wholeness. You step onto the world stage crowned in integrated mastery.", reversed: "Near completion, loose ends, reluctance to finalize a chapter." }
  ],

  // 24 ELDER FUTHARK RUNES DATA
  RUNES_DATA: [
    { name: "Fehu", glyph: "ᚠ", aett: "Freyr's Aett", element: "Fire/Earth", keywords: "Wealth, Primal Fire, Circulating Energy, Abundance", meaning: "Mobile wealth and energetic flow. Invest creative capital to nourish the clan." },
    { name: "Uruz", glyph: "ᚢ", aett: "Freyr's Aett", element: "Earth", keywords: "Primal Strength, Wild Aurochs, Physical Vitality, Raw Grit", meaning: "Untamed vitality and endurance. Physical health renewal and unstoppable perseverance." },
    { name: "Thurisaz", glyph: "ᚦ", aett: "Freyr's Aett", element: "Fire", keywords: "Giant's Thorn, Reactive Force, Protective Lightning, Gateway", meaning: "Thor's hammer strikes down obstacles. Stand watchful at the threshold before crossing." },
    { name: "Ansuz", glyph: "ᚨ", aett: "Freyr's Aett", element: "Air", keywords: "Odin's Breath, Divine Inspiration, Eloquence, Sacred Word", meaning: "Listen for prophetic synchronicities and divine messages in poetry, song, and counsel." },
    { name: "Raidho", glyph: "ᚱ", aett: "Freyr's Aett", element: "Air", keywords: "Solar Chariot, Journey, Sacred Rhythm, Orderly Flow", meaning: "Right action and purposeful travel. Align your steps with cosmic law and steady cadence." },
    { name: "Kenaz", glyph: "ᚲ", aett: "Freyr's Aett", element: "Fire", keywords: "Torch of Wisdom, Creative Illumination, Craft Mastery", meaning: "The forge torch illuminates shadows. Transform raw insight into refined craftsmanship." },
    { name: "Gebo", glyph: "ᚷ", aett: "Freyr's Aett", element: "Air", keywords: "Sacred Gift, Reciprocity, Divine Partnership, Generosity", meaning: "A gift demands a gift. Form egalitarian bonds rooted in mutual honor and shared vision." },
    { name: "Wunjo", glyph: "ᚹ", aett: "Freyr's Aett", element: "Air/Earth", keywords: "Joy, Harmony, Kinship, Radiant Contentment", meaning: "The golden banner of triumph and genuine joy. Sorrow dissipates as kindred souls unite." },
    { name: "Hagalaz", glyph: "ᚺ", aett: "Heimdall's Aett", element: "Ice/Water", keywords: "Hailstone, Sudden Disruption, Cosmic Egg, Transformation", meaning: "Hail shatters rigid structures to unleash the primordial seed. Embrace radical cleansing." },
    { name: "Nauthiz", glyph: "ᚾ", aett: "Heimdall's Aett", element: "Fire", keywords: "Need-Fire, Necessity, Friction, Constraint as Teacher", meaning: "Friction creates sacred spark. Use current delays as the forge for iron self-mastery." },
    { name: "Isa", glyph: "ᛁ", aett: "Heimdall's Aett", element: "Ice", keywords: "Glacier, Stillness, Focus, Crystallization, Sacred Pause", meaning: "Winter glacier arrests movement. Consolidate inner reserves; do not force premature action." },
    { name: "Jera", glyph: "ᛃ", aett: "Heimdall's Aett", element: "Earth", keywords: "Harvest, Year Cycle, Patient Growth, Just Reward", meaning: "The turning of seasons brings abundant fruit for honest seeds sown in previous cycles." },
    { name: "Eihwaz", glyph: "ᛇ", aett: "Heimdall's Aett", element: "All Elements", keywords: "Yggdrasil Yew, Axis Mundi, Death & Rebirth, Endurance", meaning: "The sacred World Tree anchors in both underworld and heavens. Immense spiritual resilience." },
    { name: "Perthro", glyph: "ᛈ", aett: "Heimdall's Aett", element: "Water", keywords: "Lot Cup, Mystery, Wyrd Matrix, Evolutionary Matrix", meaning: "The dice cup of the Norns. Hidden forces operate in your favor; welcome divine chance." },
    { name: "Algiz", glyph: "ᛉ", aett: "Heimdall's Aett", element: "Air", keywords: "Elk Antler, Divine Shield, Spiritual Sanctuary, Connection", meaning: "Spiritual armor and high connection. You walk wrapped in guardian angelic shielding." },
    { name: "Sowilo", glyph: "ᛋ", aett: "Heimdall's Aett", element: "Fire", keywords: "Solar Wheel, Victory, Pure Vitality, Wholeness", meaning: "The sun's golden lightning rays pierce darkness. Supreme victory, healing, and clarity." },
    { name: "Tiwaz", glyph: "ᛏ", aett: "Tyr's Aett", element: "Air", keywords: "Tyr's Spear, Honor, Selfless Justice, Sovereign Devotion", meaning: "Courage to sacrifice personal comfort for transcendent truth and collective justice." },
    { name: "Berkano", glyph: "ᛒ", aett: "Tyr's Aett", element: "Earth", keywords: "Birch Mother, Rebirth, Sanctuary, Tender Genesis", meaning: "New life awakens in the forest grove. Tenderly nurture fragile nascent ideas." },
    { name: "Ehwaz", glyph: "ᛖ", aett: "Tyr's Aett", element: "Earth", keywords: "Sacred Horse, Trust, Swift Partnership, Harmonious Speed", meaning: "Mutual loyalty between rider and steed. Swift progress achieved through deep cooperation." },
    { name: "Mannaz", glyph: "ᛗ", aett: "Tyr's Aett", element: "Air/Earth", keywords: "Humanity, Self-Awareness, Collective Gnosis, Integration", meaning: "The integrated self within the human community. Know thyself to elevate the collective." },
    { name: "Laguz", glyph: "ᛚ", aett: "Tyr's Aett", element: "Water", keywords: "Living Water, Tidal Flow, Psychic Depth, Astral Stream", meaning: "Surrender to the oceanic tide of intuition. Flow effortlessly around jagged rocks." },
    { name: "Ingwaz", glyph: "ᛝ", aett: "Tyr's Aett", element: "Earth", keywords: "Seed Gestation, Sacred Hearth, Internal Completion", meaning: "The seed resting in the warm earth. Safe cocooning before the glorious spring emergence." },
    { name: "Dagaz", glyph: "ᛞ", aett: "Tyr's Aett", element: "Light/Fire", keywords: "Dawn Flash, Non-Dual Awakening, Breakthrough, Illumination", meaning: "The glorious flash of dawn twilight. Instantaneous shift from darkness into sovereign light." },
    { name: "Othala", glyph: "ᛟ", aett: "Tyr's Aett", element: "Earth", keywords: "Ancestral Homeland, Sacred Estate, Lineage Inheritance", meaning: "Claim your authentic ancestral wisdom, spiritual inheritance, and grounded sanctuary." }
  ],

  // I CHING 64 HEXAGRAM METADATA SAMPLE DICTIONARY
  HEXAGRAM_DATABASE: {
    "111111": { number: 1, name: "The Creative", pinyin: "Qián (乾)", symbol: "䷀", upper: "Heaven (乾)", lower: "Heaven (乾)", judgment: "The Creative works sublime success, furthering through perseverance.", image: "The movement of heaven is full of power. Thus the sovereign makes himself strong and untiring.", theme: "Pure Yang Momentum & Sovereign Leadership" },
    "000000": { number: 2, name: "The Receptive", pinyin: "Kūn (坤)", symbol: "䷁", upper: "Earth (坤)", lower: "Earth (坤)", judgment: "The Receptive brings about sublime success through the steadfastness of a mare.", image: "The earth's condition is receptive devotion. Thus the noble person sustains all beings with generous virtue.", theme: "Pure Yin Devotion, Nurturing & Receptivity" },
    "100010": { number: 3, name: "Difficulty at the Beginning", pinyin: "Zhūn (屯)", symbol: "䷂", upper: "Water (坎)", lower: "Thunder (震)", judgment: "Times of chaotic sprouting require patient order and appointment of trusted helpers.", image: "Clouds and thunder: The image of difficulty at the start. Thus the sage brings order out of chaos.", theme: "Sprouting Through Frost & Founding Order" },
    "010001": { number: 4, name: "Youthful Folly", pinyin: "Méng (蒙)", symbol: "䷃", upper: "Mountain (艮)", lower: "Water (坎)", judgment: "It is not I who seek the young fool; the young fool seeks me. Sincerity yields answers.", image: "A spring wells up at the foot of the mountain: Thus the noble one fosters character by thoroughness.", theme: "Beginner's Mind & Humble Mentorship" },
    "111010": { number: 5, name: "Waiting (Nourishment)", pinyin: "Xū (需)", symbol: "䷄", upper: "Water (坎)", lower: "Heaven (乾)", judgment: "Waiting in patience brings light and success. It furthers one to cross the great water.", image: "Clouds rise up to heaven: Thus the wise soul eats and drinks, remaining joyous and of good cheer.", theme: "Patience, Inner Nourishment & Timing" },
    "010111": { number: 6, name: "Conflict", pinyin: "Sòng (讼)", symbol: "䷅", upper: "Heaven (乾)", lower: "Water (坎)", judgment: "You are sincere and are being obstructed. A cautious halt brings good fortune. Do not cross great water.", image: "Heaven and water move in opposite directions: The image of conflict. The wise consider the beginning carefully.", theme: "Diplomatic Restraint & Avoiding Escalation" },
    "010000": { number: 7, name: "The Army", pinyin: "Shī (师)", symbol: "䷆", upper: "Earth (坤)", lower: "Water (坎)", judgment: "The army needs perseverance and a strong, experienced leader. No blame.", image: "Water in the middle of the earth: Thus the noble soul increases his masses through generosity toward the people.", theme: "Collective Discipline & Righteous Purpose" },
    "000010": { number: 8, name: "Holding Together (Union)", pinyin: "Bǐ (比)", symbol: "䷇", upper: "Water (坎)", lower: "Earth (坤)", judgment: "Holding together brings good fortune. Inquire of the oracle once again whether you possess constancy.", image: "Water on the earth: Thus kings of antiquity bestowed fiefs and fostered friendly relations.", theme: "Allied Alliance, Trust & Community" },
    "111011": { number: 9, name: "Taming Power of the Small", pinyin: "Xiǎo Chù (小畜)", symbol: "䷈", upper: "Wind (巽)", lower: "Heaven (乾)", judgment: "Dense clouds, no rain from our western borders. Refining gentle influence brings success.", image: "Wind drives across the sky: Thus the noble person refines the outward expression of virtue.", theme: "Gentle Influence & Incremental Refinement" },
    "110111": { number: 10, name: "Treading (Conduct)", pinyin: "Lǚ (履)", symbol: "䷉", upper: "Heaven (乾)", lower: "Lake (兑)", judgment: "Treading upon the tail of the tiger. It does not bite the person. Success through respectful awareness.", image: "Heaven above, the lake below: Thus the noble person discriminates between high and low.", theme: "Graceful Conduct & Walking with Power" },
    "111000": { number: 11, name: "Peace (Harmony)", pinyin: "Tài (泰)", symbol: "䷊", upper: "Earth (坤)", lower: "Heaven (乾)", judgment: "The small departs, the great approaches. Good fortune and sublime success.", image: "Heaven and earth unite: Thus the sovereign divides and completes the courses of heaven and earth.", theme: "Golden Age of Prosperity & Harmony" },
    "000111": { number: 12, name: "Standstill (Stagnation)", pinyin: "Pǐ (否)", symbol: "䷋", upper: "Heaven (乾)", lower: "Earth (坤)", judgment: "Evil people do not further the perseverance of the noble person. The great departs, the small approaches.", image: "Heaven and earth do not unite: Thus the noble person falls back on inner virtue to escape difficulties.", theme: "Inner Retreat & Guarding Integrity" }
  },

  // State
  tarotCards: [],
  tarotFlipped: [false, false, false],
  ichingLines: [], // Array of { value: 6|7|8|9, isYang: boolean, isChanging: boolean }
  runeStones: [],

  init(soundEngine) {
    this.soundEngine = soundEngine;
    this.setupSubTabs();
    this.setupTarot();
    this.setupRunes();
    this.setupIChing();
  },

  setupSubTabs() {
    const tabs = document.querySelectorAll('#rituals-subtabs .sub-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const targetRitual = tab.dataset.ritual;
        this.activeRitualTab = targetRitual;

        document.querySelectorAll('.ritual-subview').forEach(view => {
          view.style.display = 'none';
        });

        const activeView = document.getElementById(`subview-ritual-${targetRitual}`);
        if (activeView) {
          activeView.style.display = 'block';
        }

        if (this.soundEngine) this.soundEngine.playChime(640, 0.2);
        if (window.lucide) window.lucide.createIcons();
      });
    });
  },

  // --- 1. TAROT MODULE ---
  setupTarot() {
    const btnDraw = document.getElementById('btn-shuffle-draw-tarot');
    if (btnDraw) {
      btnDraw.addEventListener('click', () => {
        this.shuffleAndDrawTarot();
      });
    }

    // Auto-draw initial spread
    this.shuffleAndDrawTarot();
  },

  shuffleAndDrawTarot() {
    if (this.soundEngine) this.soundEngine.playChime(520, 0.3);

    const container = document.getElementById('tarot-slots-container');
    const interpBox = document.getElementById('tarot-reading-interpretation');
    const interpText = document.getElementById('tarot-interp-text');
    const spreadTypeEl = document.getElementById('tarot-spread-type');
    const spreadType = spreadTypeEl ? spreadTypeEl.value : 'three-card';

    if (!container) return;

    // Reset flipped state
    this.tarotFlipped = [false, false, false];
    if (interpBox) interpBox.style.display = 'none';

    // Show shuffling animation
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 260px; width: 100%; gap: 14px;">
        <div class="tarot-card-back" style="width: 140px; height: 210px; animation: cardShuffle 0.6s infinite alternate; border-radius: var(--radius-md);">
          <div style="width: 36px; height: 36px; border: 2px solid var(--gold-light); transform: rotate(45deg);"></div>
        </div>
        <div style="font-family: var(--font-serif-display); color: var(--gold-light); font-size: 0.95rem;">
          ✦ Shuffling the 78 Arcana Threads... ✦
        </div>
      </div>
    `;

    setTimeout(() => {
      // Pick random unique cards
      const count = spreadType === 'single' ? 1 : (spreadType === 'decision' ? 2 : 3);
      const shuffled = [...this.TAROT_DECK].sort(() => 0.5 - Math.random());
      this.tarotCards = shuffled.slice(0, count).map(card => ({
        ...card,
        isReversed: Math.random() < 0.25 // 25% chance reversed
      }));

      const positionLabels = count === 1 
        ? ['Oracle Core Focus'] 
        : count === 2 
        ? ['Left Path: Preservation', 'Right Path: Transformation'] 
        : ['I. The Past (Karmic Genesis)', 'II. The Present (Current Crucible)', 'III. The Future (Emerging Horizon)'];

      container.innerHTML = this.tarotCards.map((card, idx) => {
        return `
          <div class="tarot-card-slot" id="tarot-slot-${idx}">
            <div class="tarot-slot-label">${positionLabels[idx]}</div>
            <div class="tarot-card-container ${card.isReversed ? 'reversed' : ''}" data-card-idx="${idx}" id="tarot-card-${idx}">
              <!-- Back of card -->
              <div class="tarot-card-face tarot-card-back">
                <div class="tarot-back-pattern">
                  <div style="font-size: 1.8rem; color: var(--gold-light); opacity: 0.8;">✦</div>
                  <div style="font-size: 0.65rem; color: var(--gold-light); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px;">Aetheria Arcana</div>
                </div>
              </div>

              <!-- Front of card -->
              <div class="tarot-card-face tarot-card-front">
                <div style="display: flex; justify-content: space-between; width: 100%; font-size: 0.72rem; color: var(--gold-light);">
                  <span>${card.roman}</span>
                  <span>${card.element}</span>
                </div>

                <div class="tarot-front-artwork">
                  <span>${card.glyph}</span>
                </div>

                <div style="text-align: center; width: 100%;">
                  <div class="tarot-front-title">${card.name}</div>
                  <div style="font-size: 0.65rem; color: ${card.isReversed ? '#fca5a5' : 'var(--emerald-element)'}; font-weight: 700;">
                    ${card.isReversed ? '✦ REVERSED ✦' : '✦ UPRIGHT ✦'}
                  </div>
                </div>
              </div>
            </div>
            <div style="font-size: 0.7rem; color: var(--text-muted); text-align: center; margin-top: 6px;">
              Tap card to flip & reveal
            </div>
          </div>
        `;
      }).join('');

      // Attach click listeners to cards
      const cardEls = container.querySelectorAll('.tarot-card-container');
      cardEls.forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.dataset.cardIdx, 10);
          this.flipTarotCard(idx, el);
        });
      });

      if (window.lucide) window.lucide.createIcons();
    }, 650);
  },

  flipTarotCard(idx, el) {
    if (this.tarotFlipped[idx]) return;
    this.tarotFlipped[idx] = true;
    el.classList.add('flipped');

    if (this.soundEngine) this.soundEngine.playChime(620 + idx * 60, 0.25);

    // If all cards flipped, show composite interpretation
    const allFlipped = this.tarotCards.every((_, i) => this.tarotFlipped[i]);
    if (allFlipped) {
      setTimeout(() => {
        this.renderTarotSpreadInterpretation();
      }, 400);
    }
  },

  renderTarotSpreadInterpretation() {
    const interpBox = document.getElementById('tarot-reading-interpretation');
    const interpText = document.getElementById('tarot-interp-text');
    if (!interpBox || !interpText) return;

    let narrative = '';
    this.tarotCards.forEach((c, i) => {
      const pos = i === 0 ? 'Past Genesis' : i === 1 ? 'Present Crucible' : 'Future Horizon';
      narrative += `<strong>✦ ${pos} — ${c.name} (${c.isReversed ? 'Reversed' : 'Upright'}):</strong> ${c.isReversed ? c.reversed : c.upright} <em>[Keywords: ${c.keywords.join(', ')}]</em><br><br>`;
    });

    narrative += `<div style="padding: 10px; background: rgba(212, 175, 55, 0.08); border-radius: var(--radius-sm); border-left: 2px solid var(--gold-primary); margin-top: 8px;">
      <strong style="color: var(--gold-light);">Grand Oracle Guidance:</strong> The current spread demonstrates a decisive transition from past foundational tests toward an empowered phase of sovereign mastery. Channel conscious willpower into structured projects.
    </div>`;

    interpText.innerHTML = narrative;
    interpBox.style.display = 'block';
    if (window.lucide) window.lucide.createIcons();
  },

  // --- 2. RUNE CASTING MODULE ---
  setupRunes() {
    const btnCast = document.getElementById('btn-cast-runes');
    if (btnCast) {
      btnCast.addEventListener('click', () => {
        this.castRuneStones();
      });
    }

    // Auto-cast initial stones
    this.castRuneStones();
  },

  castRuneStones() {
    if (this.soundEngine) this.soundEngine.playChime(480, 0.35);

    const container = document.getElementById('rune-stones-container');
    const readingBox = document.getElementById('rune-reading-box');
    const interpText = document.getElementById('rune-interp-text');

    if (!container) return;
    if (readingBox) readingBox.style.display = 'none';

    // Pick 3 random runes
    const shuffled = [...this.RUNES_DATA].sort(() => 0.5 - Math.random());
    this.runeStones = shuffled.slice(0, 3);

    const runePositions = [
      { role: '1. Root Origin (Ur-Cause)', desc: 'The ancestral root condition' },
      { role: '2. Present Crucible (Wyrd Flow)', desc: 'Active energetic crossroad' },
      { role: '3. Destiny Horizon (Becoming)', desc: 'The emerging potential' }
    ];

    container.innerHTML = this.runeStones.map((rune, idx) => {
      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div style="font-size: 0.72rem; color: var(--gold-light); font-weight: 700; text-transform: uppercase;">
            ${runePositions[idx].role}
          </div>
          <div class="rune-stone" data-rune-idx="${idx}" id="rune-stone-${idx}" style="animation: dropRune 0.4s ease-out ${idx * 0.15}s both;">
            <div class="rune-glyph">${rune.glyph}</div>
            <div class="rune-name">${rune.name}</div>
          </div>
          <div style="font-size: 0.65rem; color: var(--text-muted); max-width: 120px; text-align: center;">
            ${rune.keywords}
          </div>
        </div>
      `;
    }).join('');

    // Attach click listeners
    const stoneEls = container.querySelectorAll('.rune-stone');
    stoneEls.forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.runeIdx, 10);
        if (this.soundEngine) this.soundEngine.playChime(640 + idx * 50, 0.2);
        this.renderRuneInterpretation(idx);
      });
    });

    setTimeout(() => {
      this.renderRuneInterpretation(null);
    }, 500);
  },

  renderRuneInterpretation(highlightIdx) {
    const readingBox = document.getElementById('rune-reading-box');
    const interpText = document.getElementById('rune-interp-text');
    if (!readingBox || !interpText || !this.runeStones.length) return;

    const r0 = this.runeStones[0];
    const r1 = this.runeStones[1];
    const r2 = this.runeStones[2];

    interpText.innerHTML = `
      <div style="margin-bottom: 12px;">
        <strong style="color: var(--cyan-cosmic);">✦ Three-Norn Wyrd Reading (Urðr, Verðandi, Skuld):</strong>
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.88rem;">
        <div style="padding: 10px; background: rgba(0, 229, 255, 0.05); border-left: 2px solid var(--cyan-cosmic); border-radius: var(--radius-sm);">
          <strong>${r0.name} (${r0.glyph})</strong> — <em>${r0.aett} / ${r0.element}</em>: ${r0.meaning}
        </div>
        <div style="padding: 10px; background: rgba(212, 175, 55, 0.05); border-left: 2px solid var(--gold-primary); border-radius: var(--radius-sm);">
          <strong>${r1.name} (${r1.glyph})</strong> — <em>${r1.aett} / ${r1.element}</em>: ${r1.meaning}
        </div>
        <div style="padding: 10px; background: rgba(138, 43, 226, 0.05); border-left: 2px solid var(--violet-celestial); border-radius: var(--radius-sm);">
          <strong>${r2.name} (${r2.glyph})</strong> — <em>${r2.aett} / ${r2.element}</em>: ${r2.meaning}
        </div>
      </div>
      <div style="margin-top: 14px; font-size: 0.82rem; color: var(--gold-light); font-style: italic;">
        ✦ "The web of Wyrd is spun not of stone, but of mindful intention. Walk with the courage of Tiwaz and the illumination of Sowilo."
      </div>
    `;

    readingBox.style.display = 'block';
    if (window.lucide) window.lucide.createIcons();
  },

  // --- 3. I CHING MODULE ---
  setupIChing() {
    const btnToss = document.getElementById('btn-toss-iching');
    if (btnToss) {
      btnToss.addEventListener('click', () => {
        this.tossIChingCoins();
      });
    }

    this.resetIChing();
  },

  resetIChing() {
    this.ichingLines = [];
    const stack = document.getElementById('iching-lines-stack');
    const promptEl = document.getElementById('iching-step-prompt');
    const judgementBox = document.getElementById('iching-judgement-box');
    const btnToss = document.getElementById('btn-toss-iching');

    if (stack) stack.innerHTML = '';
    if (promptEl) promptEl.textContent = 'Toss 1 of 6: Building baseline line (Initial Line)...';
    if (judgementBox) judgementBox.style.display = 'none';
    if (btnToss) {
      btnToss.innerHTML = '<i data-lucide="rotate-cw"></i> Toss 3 Bronze Coins';
      btnToss.disabled = false;
    }
    if (window.lucide) window.lucide.createIcons();
  },

  tossIChingCoins() {
    if (this.ichingLines.length >= 6) {
      this.resetIChing();
      return;
    }

    const c1 = document.getElementById('coin-1');
    const c2 = document.getElementById('coin-2');
    const c3 = document.getElementById('coin-3');
    const btnToss = document.getElementById('btn-toss-iching');
    const promptEl = document.getElementById('iching-step-prompt');

    if (this.soundEngine) this.soundEngine.playChime(700, 0.15);

    // Animate coin flips
    [c1, c2, c3].forEach(c => {
      if (c) {
        c.style.transform = `rotateX(${720 + Math.random() * 360}deg) rotateY(${720 + Math.random() * 360}deg) scale(1.15)`;
      }
    });

    if (btnToss) btnToss.disabled = true;

    setTimeout(() => {
      // Coin results: 2 = Yin/Tails (valued at 2), 3 = Yang/Heads (valued at 3)
      const coin1 = Math.random() > 0.5 ? 3 : 2;
      const coin2 = Math.random() > 0.5 ? 3 : 2;
      const coin3 = Math.random() > 0.5 ? 3 : 2;
      const total = coin1 + coin2 + coin3; // 6, 7, 8, 9

      // Reset coin rotation
      [c1, c2, c3].forEach(c => {
        if (c) c.style.transform = 'none';
      });

      // 6 = Old Yin (Changing - -x- -), 7 = Young Yang (Solid ———), 8 = Young Yin (Broken — —), 9 = Old Yang (Changing ——o——)
      const isYang = (total === 7 || total === 9);
      const isChanging = (total === 6 || total === 9);

      this.ichingLines.push({ value: total, isYang, isChanging });

      this.renderIChingStack();

      const lineIndex = this.ichingLines.length;
      if (lineIndex < 6) {
        const lineNames = ['Second Line', 'Third Line', 'Fourth Line', 'Fifth Line (Ruler)', 'Top Line (Roof)'];
        if (promptEl) promptEl.textContent = `Toss ${lineIndex + 1} of 6: Building ${lineNames[lineIndex - 1]}... (Total: ${total})`;
        if (btnToss) btnToss.disabled = false;
      } else {
        if (promptEl) promptEl.textContent = '✦ Hexagram Fully Manifested! ✦';
        if (btnToss) {
          btnToss.innerHTML = '<i data-lucide="refresh-cw"></i> Cast New Hexagram';
          btnToss.disabled = false;
        }
        this.renderIChingJudgement();
      }

      if (this.soundEngine) this.soundEngine.playChime(500 + lineIndex * 40, 0.2);
      if (window.lucide) window.lucide.createIcons();
    }, 450);
  },

  renderIChingStack() {
    const stack = document.getElementById('iching-lines-stack');
    if (!stack) return;

    stack.innerHTML = this.ichingLines.map((line, idx) => {
      const lineNum = idx + 1;
      const isYang = line.isYang;
      const isChanging = line.isChanging;

      return `
        <div class="hex-line ${isYang ? 'yang' : 'yin'} ${isChanging ? 'changing' : ''}" id="hex-line-${lineNum}">
          <span style="font-size: 0.68rem; color: var(--text-muted); width: 44px; font-family: var(--font-mono);">
            L${lineNum}: ${line.value}
          </span>
          ${isYang ? `
            <div class="line-bar" style="background: ${isChanging ? 'var(--gold-light)' : 'var(--gold-primary)'};"></div>
          ` : `
            <div class="line-bar" style="background: ${isChanging ? '#93c5fd' : 'var(--sapphire-element)'};"></div>
            <div class="line-bar" style="background: ${isChanging ? '#93c5fd' : 'var(--sapphire-element)'};"></div>
          `}
          <span style="font-size: 0.65rem; color: ${isChanging ? 'var(--ruby-element)' : 'var(--text-secondary)'}; width: 60px; text-align: right;">
            ${isChanging ? '✦ Change' : (isYang ? 'Yang' : 'Yin')}
          </span>
        </div>
      `;
    }).join('');
  },

  renderIChingJudgement() {
    const box = document.getElementById('iching-judgement-box');
    const titleEl = document.getElementById('iching-hex-title');
    const contentEl = document.getElementById('iching-hex-content');

    if (!box || !titleEl || !contentEl) return;

    // Convert boolean lines to bitstring key (bottom to top: 1=yang, 0=yin)
    const key = this.ichingLines.map(l => l.isYang ? '1' : '0').join('');
    const hexData = this.HEXAGRAM_DATABASE[key] || {
      number: 1,
      name: "The Creative",
      pinyin: "Qián (乾)",
      symbol: "䷀",
      upper: "Heaven (乾)",
      lower: "Heaven (乾)",
      judgment: "Sublime success through constancy and perseverance.",
      image: "Heaven moves with relentless vigor; the sage cultivates unwavering strength.",
      theme: "Dynamic Momentum"
    };

    const hasChanging = this.ichingLines.some(l => l.isChanging);

    titleEl.innerHTML = `
      <span style="font-size: 1.6rem; color: var(--gold-light); margin-right: 8px;">${hexData.symbol}</span>
      <span>Hexagram ${hexData.number}: ${hexData.name} · ${hexData.pinyin}</span>
    `;

    contentEl.innerHTML = `
      <div style="display: flex; gap: 12px; margin-bottom: 12px; font-size: 0.78rem;">
        <span class="badge-pill" style="background: rgba(212, 175, 55, 0.12); color: var(--gold-light); border-color: var(--gold-border);">
          Upper Trigram: ${hexData.upper}
        </span>
        <span class="badge-pill" style="background: rgba(0, 229, 255, 0.12); color: var(--cyan-cosmic); border-color: var(--cyan-glow);">
          Lower Trigram: ${hexData.lower}
        </span>
      </div>

      <div style="margin-bottom: 10px;">
        <strong style="color: var(--gold-light);">The Judgement (彖辞):</strong>
        <p style="margin-top: 4px; color: var(--text-primary); font-style: italic;">"${hexData.judgment}"</p>
      </div>

      <div style="margin-bottom: 10px;">
        <strong style="color: var(--cyan-cosmic);">The Great Image (象辞):</strong>
        <p style="margin-top: 4px; color: var(--text-secondary);">"${hexData.image}"</p>
      </div>

      ${hasChanging ? `
        <div style="padding: 10px; background: rgba(239, 68, 68, 0.08); border-left: 2px solid var(--ruby-element); border-radius: var(--radius-sm); margin-top: 10px;">
          <strong style="color: #fca5a5;">Changing Lines Detected:</strong> The lines in transition signal that the current situation is rapidly evolving into its complementary state. Maintain serene equilibrium amidst the shifting currents.
        </div>
      ` : ''}
    `;

    box.style.display = 'block';
    if (window.lucide) window.lucide.createIcons();
  }
};

if (typeof window !== 'undefined') {
  window.RitualsEngine = RitualsEngine;
}
