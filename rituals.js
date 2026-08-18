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
    "000111": { number: 12, name: "Standstill (Stagnation)", pinyin: "Pǐ (否)", symbol: "䷋", upper: "Heaven (乾)", lower: "Earth (坤)", judgment: "Evil people do not further the perseverance of the noble person. The great departs, the small approaches.", image: "Heaven and earth do not unite: Thus the noble person falls back on inner virtue to escape difficulties.", theme: "Inner Retreat & Guarding Integrity" },
    "101111": { number: 13, name: "Fellowship with Men", pinyin: "Tóngrén (同人)", symbol: "䷌", upper: "Heaven (乾)", lower: "Fire (離)", judgment: "Fellowship with people in the open. Success. It furthers one to cross the great water and to persevere.", image: "Heaven together with fire: the image of fellowship. Thus the noble person organizes clans and distinguishes things by categories.", theme: "Universal Kinship & Transparent Alliance" },
    "111101": { number: 14, name: "Possession in Great Measure", pinyin: "Dàyǒu (大有)", symbol: "䷍", upper: "Fire (離)", lower: "Heaven (乾)", judgment: "Possession in great measure. Supreme success, illuminated by inner strength and heavenly favor.", image: "Fire in heaven above: the image of possession in great measure. Thus the noble person curbs evil and furthers good, obeying the benevolent will of heaven.", theme: "Radiant Abundance & Benevolent Stewardship" },
    "001000": { number: 15, name: "Modesty", pinyin: "Qiān (謙)", symbol: "䷎", upper: "Earth (坤)", lower: "Mountain (艮)", judgment: "Modesty creates success. The noble person carries things through to their conclusion.", image: "Within the earth, a mountain: the image of modesty. Thus the noble person reduces what is too much, augmenting what is too little, weighing and equalizing.", theme: "Humility That Elevates" },
    "000100": { number: 16, name: "Enthusiasm", pinyin: "Yù (豫)", symbol: "䷏", upper: "Thunder (震)", lower: "Earth (坤)", judgment: "Enthusiasm. It furthers one to install helpers and to set armies marching.", image: "Thunder comes resounding out of the earth: the image of enthusiasm. Thus the ancient sovereigns made music to honor merit, offering it with splendor to the Supreme Deity.", theme: "Joyful Readiness & Collective Momentum" },
    "100110": { number: 17, name: "Following", pinyin: "Suí (隨)", symbol: "䷐", upper: "Lake (兑)", lower: "Thunder (震)", judgment: "Following has supreme success. Perseverance furthers. No blame.", image: "Thunder in the middle of the lake: the image of following. Thus the noble person, at nightfall, goes indoors for rest and recuperation.", theme: "Adaptive Surrender to the Current" },
    "011001": { number: 18, name: "Work on What Has Been Spoiled", pinyin: "Gǔ (蠱)", symbol: "䷑", upper: "Mountain (艮)", lower: "Wind (巽)", judgment: "Work on what has been spoiled has supreme success. It furthers one to cross the great water. Three days before, three days after.", image: "Wind blows low beneath the mountain: the image of decay. Thus the noble person stirs up the people and strengthens their spirit.", theme: "Courageous Remedy of Accumulated Neglect" },
    "110000": { number: 19, name: "Approach", pinyin: "Lín (臨)", symbol: "䷒", upper: "Earth (坤)", lower: "Lake (兑)", judgment: "Approach has supreme success. Perseverance furthers. When the eighth month comes, there will be misfortune.", image: "The earth above the lake: the image of approach. Thus the noble person is inexhaustible in teaching, and boundless in tolerating and protecting the people.", theme: "Rising Influence & Generous Oversight" },
    "000011": { number: 20, name: "Contemplation", pinyin: "Guān (觀)", symbol: "䷓", upper: "Wind (巽)", lower: "Earth (坤)", judgment: "Contemplation. The ablution has been made, but not yet the offering. Full of sincerity and dignity.", image: "The wind moves above the earth: the image of contemplation. Thus the ancient sovereigns visited the regions, contemplated the people, and gave them instruction.", theme: "Watchful Vantage Before Action" },
    "100101": { number: 21, name: "Biting Through", pinyin: "Shìkè (噬嗑)", symbol: "䷔", upper: "Fire (離)", lower: "Thunder (震)", judgment: "Biting through has success. It is favorable to let justice be administered.", image: "Thunder and lightning: the image of biting through. Thus the ancient sovereigns made firm the laws through the clarity of penalties.", theme: "Decisive Judgment Dissolving Obstruction" },
    "101001": { number: 22, name: "Grace", pinyin: "Bì (賁)", symbol: "䷕", upper: "Mountain (艮)", lower: "Fire (離)", judgment: "Grace has success. In small matters it is favorable to undertake something.", image: "Fire at the foot of the mountain: the image of grace. Thus the noble person illuminates matters of the present, but ventures no rash decisions.", theme: "Elegant Form Refining Substance" },
    "000001": { number: 23, name: "Splitting Apart", pinyin: "Bō (剝)", symbol: "䷖", upper: "Mountain (艮)", lower: "Earth (坤)", judgment: "Splitting apart. It does not further one to go anywhere.", image: "The mountain rests on the earth: the image of splitting apart. Thus those above can ensure their position only by giving generously to those below.", theme: "Withdraw and Await the Turning Tide" },
    "100000": { number: 24, name: "Return", pinyin: "Fù (復)", symbol: "䷗", upper: "Earth (坤)", lower: "Thunder (震)", judgment: "Return brings success. Going out and coming in without error. Friends come without blame. It furthers one to have somewhere to go.", image: "Thunder within the earth: the image of the turning point. Thus the ancient sovereigns closed the passes at the winter solstice; merchants and strangers did not travel.", theme: "Renewal After the Depth of Winter" },
    "100111": { number: 25, name: "Innocence", pinyin: "Wúwàng (无妄)", symbol: "䷘", upper: "Heaven (乾)", lower: "Thunder (震)", judgment: "Innocence brings supreme success, and it furthers one to be persevering. If one is not as he should be, misfortune befalls him.", image: "Under heaven, thunder rolls: all things attain the natural state of innocence. Thus the ancient sovereigns, rich in virtue, nurtured all beings in harmony with the time.", theme: "Spontaneous Integrity Without Calculation" },
    "111001": { number: 26, name: "The Taming Power of the Great", pinyin: "Dàxù (大畜)", symbol: "䷙", upper: "Mountain (艮)", lower: "Heaven (乾)", judgment: "The taming power of the great. Perseverance furthers. Not eating at home brings good fortune. It furthers one to cross the great water.", image: "Heaven within the mountain: the image of great taming power. Thus the noble person acquaints himself with many sayings of antiquity, in order to sustain his character.", theme: "Disciplined Restraint of Vast Potential" },
    "100001": { number: 27, name: "Nourishment", pinyin: "Yí (頤)", symbol: "䷚", upper: "Mountain (艮)", lower: "Thunder (震)", judgment: "Nourishment. Perseverance brings good fortune. Pay heed to providing nourishment and to what a person seeks to fill their own mouth with.", image: "At the foot of the mountain, thunder: the image of providing nourishment. Thus the noble person is careful of words and temperate in eating and drinking.", theme: "What You Feed Body, Mind & Word" },
    "011110": { number: 28, name: "Preponderance of the Great", pinyin: "Dàguò (大過)", symbol: "䷛", upper: "Lake (兑)", lower: "Wind (巽)", judgment: "Preponderance of the great. The ridgepole sags to the breaking point. It furthers one to have somewhere to go. Success.", image: "The lake rises above the trees: the image of the preponderance of the great. Thus the noble person, when he stands alone, is unconcerned, and if he must renounce the world, is undaunted.", theme: "The Central Beam Near Breaking" },
    "010010": { number: 29, name: "The Abysmal (Water)", pinyin: "Kǎn (坎)", symbol: "䷜", upper: "Water (坎)", lower: "Water (坎)", judgment: "The abysmal repeated. Through sincerity you attain success in your heart, and whatever you do succeeds.", image: "Water flows on uninterruptedly and reaches its goal: the image of the abyss repeated. Thus the noble person walks in lasting virtue and carries on the business of teaching.", theme: "Constancy Through Repeated Peril" },
    "101101": { number: 30, name: "The Clinging (Fire)", pinyin: "Lí (離)", symbol: "䷝", upper: "Fire (離)", lower: "Fire (離)", judgment: "The clinging. Perseverance furthers. It brings success. Care of the cow brings good fortune.", image: "That which is bright rises twice: the image of fire. Thus the great person, by perpetuating this brightness, illuminates the four quarters of the world.", theme: "Luminous Clarity & Devoted Attachment" },
    "001110": { number: 31, name: "Influence (Wooing)", pinyin: "Xián (咸)", symbol: "䷞", upper: "Lake (兑)", lower: "Mountain (艮)", judgment: "Influence. Success. Perseverance furthers. To take a maiden to wife brings good fortune.", image: "A lake on the mountain: the image of influence. Thus the noble person encourages people to approach him by his readiness to receive them.", theme: "Sincere Resonance Before Formal Union" },
    "011100": { number: 32, name: "Duration", pinyin: "Héng (恆)", symbol: "䷟", upper: "Thunder (震)", lower: "Wind (巽)", judgment: "Duration. Success. No blame. Perseverance furthers. It furthers one to have somewhere to go.", image: "Thunder and wind: the image of duration. Thus the noble person stands firm and does not change his direction.", theme: "Rhythmic Constancy Through Change" },
    "001111": { number: 33, name: "Retreat", pinyin: "Dùn (遯)", symbol: "䷠", upper: "Heaven (乾)", lower: "Mountain (艮)", judgment: "Retreat. Success. In what is small, perseverance furthers.", image: "Mountain beneath heaven: the image of retreat. Thus the noble person keeps the inferior person at a distance, not with hatred, but with reserve.", theme: "Dignified Withdrawal from Rising Force" },
    "111100": { number: 34, name: "The Power of the Great", pinyin: "Dàzhuàng (大壯)", symbol: "䷡", upper: "Thunder (震)", lower: "Heaven (乾)", judgment: "The power of the great. Perseverance furthers.", image: "Thunder in heaven above: the image of the power of the great. Thus the noble person does not tread upon paths that do not accord with established order.", theme: "Great Strength Tempered by Propriety" },
    "000101": { number: 35, name: "Progress", pinyin: "Jìn (晉)", symbol: "䷢", upper: "Fire (離)", lower: "Earth (坤)", judgment: "Progress. The powerful prince is honored with horses in large numbers. In a single day he is granted audience three times.", image: "The sun rises over the earth: the image of progress. Thus the noble person himself brightens his bright virtue.", theme: "Virtuous Advancement Recognized From Above" },
    "101000": { number: 36, name: "Darkening of the Light", pinyin: "Míngyí (明夷)", symbol: "䷣", upper: "Earth (坤)", lower: "Fire (離)", judgment: "Darkening of the light. In adversity it furthers one to be persevering.", image: "The light has sunk into the earth: the image of darkening of the light. Thus does the noble person live with the great mass; he veils his light, yet still shines.", theme: "Conceal True Light Through Adversity" },
    "101011": { number: 37, name: "The Family", pinyin: "Jiārén (家人)", symbol: "䷤", upper: "Wind (巽)", lower: "Fire (離)", judgment: "The family. The perseverance of the woman furthers.", image: "Wind comes forth from fire: the image of the family. Thus the noble person has substance in his words and duration in his way of life.", theme: "Correct Roles Radiating Outward" },
    "110101": { number: 38, name: "Opposition", pinyin: "Kuí (睽)", symbol: "䷥", upper: "Fire (離)", lower: "Lake (兑)", judgment: "Opposition. In small matters, good fortune.", image: "Above, fire; below, the lake: the image of opposition. Thus amid all fellowship the noble person retains his individuality.", theme: "Common Ground Amid Contradiction" },
    "001010": { number: 39, name: "Obstruction", pinyin: "Jiǎn (蹇)", symbol: "䷦", upper: "Water (坎)", lower: "Mountain (艮)", judgment: "Obstruction. The southwest furthers. The northeast does not further. It furthers one to see the great person. Perseverance brings good fortune.", image: "Water on the mountain: the image of obstruction. Thus the noble person turns his attention to himself and molds his character.", theme: "The Indirect Route to Crossing" },
    "010100": { number: 40, name: "Deliverance", pinyin: "Jiě (解)", symbol: "䷧", upper: "Thunder (震)", lower: "Water (坎)", judgment: "Deliverance. The southwest furthers. If there is no longer anything where one has to go, return brings good fortune.", image: "Thunder and rain set in: the image of deliverance. Thus the noble person pardons mistakes and forgives misdeeds.", theme: "Tension Dissolving Like Spring Ice" },
    "110001": { number: 41, name: "Decrease", pinyin: "Sǔn (損)", symbol: "䷨", upper: "Mountain (艮)", lower: "Lake (兑)", judgment: "Decrease combined with sincerity brings supreme good fortune without blame. One may be persevering in this. It furthers one to undertake something.", image: "At the foot of the mountain, the lake: the image of decrease. Thus the noble person controls his anger and restrains his instincts.", theme: "Sincere Restraint Transforming Loss" },
    "100011": { number: 42, name: "Increase", pinyin: "Yì (益)", symbol: "䷩", upper: "Wind (巽)", lower: "Thunder (震)", judgment: "Increase. It furthers one to undertake something. It furthers one to cross the great water.", image: "Wind and thunder: the image of increase. Thus the noble person, if he sees good, imitates it; if he has faults, he rids himself of them.", theme: "Generosity Multiplying Benefit" },
    "111110": { number: 43, name: "Breakthrough (Resoluteness)", pinyin: "Guài (夬)", symbol: "䷪", upper: "Lake (兑)", lower: "Heaven (乾)", judgment: "Breakthrough. One must resolutely make the matter known at the court of the king. It must be announced truthfully. Danger.", image: "The lake has risen up to heaven: the image of breakthrough. Thus the noble person dispenses riches downward and refrains from resting on his virtue.", theme: "Resolute Decree Before Final Obstruction" },
    "011111": { number: 44, name: "Coming to Meet", pinyin: "Gòu (姤)", symbol: "䷫", upper: "Heaven (乾)", lower: "Wind (巽)", judgment: "Coming to meet. The maiden is powerful. One should not marry such a maiden.", image: "Under heaven, wind: the image of coming to meet. Thus does the prince act when disseminating his commands.", theme: "Discernment Amid Unforeseen Encounter" },
    "000110": { number: 45, name: "Gathering Together", pinyin: "Cuì (萃)", symbol: "䷬", upper: "Lake (兑)", lower: "Earth (坤)", judgment: "Gathering together. Success. The king approaches his temple. It furthers one to see the great person.", image: "Over the earth, the lake: the image of gathering together. Thus the noble person renews his weapons in order to meet the unforeseen.", theme: "Unified Purpose Amplifying Fortune" },
    "011000": { number: 46, name: "Pushing Upward", pinyin: "Shēng (升)", symbol: "䷭", upper: "Earth (坤)", lower: "Wind (巽)", judgment: "Pushing upward has supreme success. One must see the great person. Fear not. Departure toward the south brings good fortune.", image: "Within the earth, wood grows: the image of pushing upward. Thus the noble person of devoted character heaps up small things in order to achieve something high and great.", theme: "Sustained Effort Without Haste" },
    "010110": { number: 47, name: "Oppression (Exhaustion)", pinyin: "Kùn (困)", symbol: "䷮", upper: "Lake (兑)", lower: "Water (坎)", judgment: "Oppression. Success. Perseverance. The great person brings about good fortune. No blame. When one has something to say, it is not believed.", image: "There is no water in the lake: the image of exhaustion. Thus the noble person stakes his life on following his will.", theme: "Quiet Integrity Outlasting Confinement" },
    "011010": { number: 48, name: "The Well", pinyin: "Jǐng (井)", symbol: "䷯", upper: "Water (坎)", lower: "Wind (巽)", judgment: "The well. The town may be changed, but the well cannot be changed. It neither decreases nor increases.", image: "Water over wood: the image of the well. Thus the noble person encourages the people at their work, and exhorts them to help one another.", theme: "The Unchanging Communal Source" },
    "101110": { number: 49, name: "Revolution", pinyin: "Gé (革)", symbol: "䷰", upper: "Lake (兑)", lower: "Fire (離)", judgment: "Revolution. On your own day you are believed. Supreme success, furthering through perseverance. Remorse disappears.", image: "Fire in the lake: the image of revolution. Thus the noble person sets the calendar in order and makes the seasons clear.", theme: "Old Forms Shed in Their Season" },
    "011101": { number: 50, name: "The Cauldron", pinyin: "Dǐng (鼎)", symbol: "䷱", upper: "Fire (離)", lower: "Wind (巽)", judgment: "The cauldron. Supreme good fortune. Success.", image: "Fire over wood: the image of the cauldron. Thus the noble person consolidates his fate by making his position correct.", theme: "Transformation Refining Nourishment" },
    "100100": { number: 51, name: "The Arousing (Shock)", pinyin: "Zhèn (震)", symbol: "䷲", upper: "Thunder (震)", lower: "Thunder (震)", judgment: "Shock brings success. Shock comes — oh, oh! Laughing words — ha, ha! The shock terrifies for a hundred miles, and he does not let fall the sacrificial spoon.", image: "Thunder repeated: the image of shock. Thus in fear and trembling the noble person sets his life in order and examines himself.", theme: "Composure Amid Startling Upheaval" },
    "001001": { number: 52, name: "Keeping Still (Mountain)", pinyin: "Gèn (艮)", symbol: "䷳", upper: "Mountain (艮)", lower: "Mountain (艮)", judgment: "Keeping still. Keeping his back still so that he no longer feels his body. He goes into his courtyard and does not see his people. No blame.", image: "Mountains standing close together: the image of keeping still. Thus the noble person does not permit his thoughts to go beyond his situation.", theme: "Stillness Beyond Longing" },
    "001011": { number: 53, name: "Development", pinyin: "Jiàn (漸)", symbol: "䷴", upper: "Wind (巽)", lower: "Mountain (艮)", judgment: "Development. The maiden is given in marriage. Good fortune. Perseverance furthers.", image: "On the mountain, a tree: the image of development. Thus the noble person abides in dignity and virtue, in order to improve the mores.", theme: "Patient Progression Toward Union" },
    "110100": { number: 54, name: "The Marrying Maiden", pinyin: "Guīmèi (歸妹)", symbol: "䷵", upper: "Thunder (震)", lower: "Lake (兑)", judgment: "The marrying maiden. Undertakings bring misfortune. Nothing that would further.", image: "Thunder over the lake: the image of the marrying maiden. Thus the noble person understands the transitory in the light of the eternity of the end.", theme: "Restraint Entering a Subordinate Bond" },
    "101100": { number: 55, name: "Abundance", pinyin: "Fēng (豐)", symbol: "䷶", upper: "Thunder (震)", lower: "Fire (離)", judgment: "Abundance has success. The king attains abundance. Be not sad. Be like the sun at midday.", image: "Both thunder and lightning come: the image of abundance. Thus the noble person decides lawsuits and carries out punishments with the utmost clarity.", theme: "Wielding Fullness Before Its Waning" },
    "001101": { number: 56, name: "The Wanderer", pinyin: "Lǚ (旅)", symbol: "䷷", upper: "Fire (離)", lower: "Mountain (艮)", judgment: "The wanderer. Success through smallness. Perseverance brings good fortune to the wanderer.", image: "Fire on the mountain: the image of the wanderer. Thus the noble person is clear-minded and cautious in imposing penalties, and protracts no lawsuits.", theme: "Prospering Through Adaptability" },
    "011011": { number: 57, name: "The Gentle (Wind)", pinyin: "Xùn (巽)", symbol: "䷸", upper: "Wind (巽)", lower: "Wind (巽)", judgment: "The gentle. Success through what is small. It furthers one to have somewhere to go. It furthers one to see the great person.", image: "Winds following one upon the other: the image of the gently penetrating. Thus the noble person spreads his commands abroad and carries out his undertakings.", theme: "Persistent Influence Through Every Crevice" },
    "110110": { number: 58, name: "The Joyous (Lake)", pinyin: "Duì (兌)", symbol: "䷹", upper: "Lake (兑)", lower: "Lake (兑)", judgment: "The joyous. Success. Perseverance is favorable.", image: "Lakes resting one on the other: the image of the joyous. Thus the noble person joins with his friends for discussion and practice.", theme: "Shared Joy Tempered by Integrity" },
    "010011": { number: 59, name: "Dispersion", pinyin: "Huàn (渙)", symbol: "䷺", upper: "Wind (巽)", lower: "Water (坎)", judgment: "Dispersion. Success. The king approaches his temple. It furthers one to cross the great water. Perseverance furthers.", image: "Wind moves over water: the image of dispersion. Thus the ancient sovereigns offered sacrifice to the Supreme Deity and built temples.", theme: "Dissolving Separation Through Unity" },
    "110010": { number: 60, name: "Limitation", pinyin: "Jié (節)", symbol: "䷻", upper: "Water (坎)", lower: "Lake (兑)", judgment: "Limitation. Success. Galling limitation must not be persevered in.", image: "Water over the lake: the image of limitation. Thus the noble person creates number and measure, and examines the standards of conduct and virtue.", theme: "Disciplined Measure Sustaining Flow" },
    "110011": { number: 61, name: "Inner Truth", pinyin: "Zhōngfú (中孚)", symbol: "䷼", upper: "Wind (巽)", lower: "Lake (兑)", judgment: "Inner truth. Pigs and fishes. Good fortune. It furthers one to cross the great water. Perseverance furthers.", image: "Wind over the lake: the image of inner truth. Thus the noble person discusses criminal cases in order to delay executions.", theme: "Sincerity That Moves the Unseen" },
    "001100": { number: 62, name: "Preponderance of the Small", pinyin: "Xiǎoguò (小過)", symbol: "䷽", upper: "Thunder (震)", lower: "Mountain (艮)", judgment: "Preponderance of the small. Success. Perseverance furthers. It is not good to strive upward; it is good to remain below.", image: "Thunder on the mountain: the image of the preponderance of the small. Thus the noble person, in his conduct, is somewhat overscrupulous, and in his mourning, somewhat too sorrowful.", theme: "Modest Attention Where Ambition Falters" },
    "101010": { number: 63, name: "After Completion", pinyin: "Jìjì (既濟)", symbol: "䷾", upper: "Water (坎)", lower: "Fire (離)", judgment: "After completion. Success in small matters. Perseverance furthers. At the beginning, good fortune; at the end, disorder.", image: "Water over fire: the image of the condition in after completion. Thus the noble person takes thought of misfortune and arms himself against it in advance.", theme: "Vigilance at the Moment of Success" },
    "010101": { number: 64, name: "Before Completion", pinyin: "Wèijì (未濟)", symbol: "䷿", upper: "Fire (離)", lower: "Water (坎)", judgment: "Before completion. Success. But if the little fox, after nearly completing the crossing, gets his tail wet, there is nothing that would further.", image: "Fire over water: the image of the condition before transition. Thus the noble person is careful in the differentiation of things, so that each finds its place.", theme: "Caution at the Final Threshold" }
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
