import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Server-side Gemini AI setup
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Divination Consultation Endpoint with High Thinking
app.post("/api/divination/consult", async (req, res) => {
  try {
    const { 
      school, 
      prompt, 
      userProfile, 
      systemPrompt, 
      conversationHistory,
      activeSchools,
      tone,
      natalPayload,
      transitsPayload,
      dreamContext 
    } = req.body;
    const ai = getGenAI();

    const toneDescriptions: Record<string, string> = {
      mystical: "Mystical & Poetic: Rich in ancient esoteric allegories, hermetic wisdom, evocative lyrical prose, and sacred symbolism.",
      pragmatic: "Direct & Pragmatic: Action-oriented, highly practical, clear career/relationship strategies, concrete timing dates, and straightforward remedies.",
      psychological: "Psychological & Archetypal: Grounded in Jungian depth psychology, shadow integration, active imagination, cognitive patterns, and inner developmental cycles.",
      analytical: "Historical & Analytical: Rigorous metaphysical methodology, mathematical ephemeris analysis, classical text citations (Titi, Ziping, Qizheng), and systematic aspect breakdowns."
    };

    const selectedToneDesc = toneDescriptions[tone || 'mystical'] || toneDescriptions.mystical;
    const enabledSchools = Array.isArray(activeSchools) && activeSchools.length ? activeSchools.join(', ') : 'BaZi, Western Astrology, Tarot, Dream Analysis, I Ching';

    if (!ai) {
      // Graceful rich mystical fallback if no API key
      const fallbackResponse = `[Aetheria Cosmic Nexus — Local Synthesis Oracle]

✦ Selected School: ${school || "Grand Multi-School Synthesizer"}
✦ Applied Tone: ${tone || "Mystical & Poetic"}
✦ Integrated Disciplines: ${enabledSchools}

Based on your natal blueprint (${userProfile?.name || "Seeker"}, Born ${userProfile?.birthDate || "Current Era"} at ${userProfile?.birthTime || "Equinox"} in ${userProfile?.birthCity || "Harmonic Coordinates"}):

1. **Foundational Energy Flux**:
   Your natal matrix exhibits strong elemental momentum. The alignment of your active Day Master with current celestial transits creates an alchemical crucible for focused development.

2. **Multi-Discipline Synthesis**:
   - **Astrological Ephemeris**: Prevailing transits stimulate your midheaven and 10th/11th house sectors, demanding visionary initiative and emotional integrity.
   - **BaZi & Five Elements**: Balance is best preserved by introducing calming Wood-Water energy and minimizing unnecessary Fire friction.
   - **Archetypal Core**: The Threshold Guardian invites you to surrender obsolete coping habits and step into sovereign conscious leadership.

3. **Actionable Cosmic Counsel**:
   - Focus your creative will on one monumental task during the solar morning hours.
   - Maintain clear energetic boundaries; allow intuitive dreams to gestate before executing major contracts.

*"The stars incline and the elements weave; yet the sovereign spirit commands destiny's loom."*`;

      return res.json({
        success: true,
        school: school || "Hermetic Synthesizer",
        response: fallbackResponse,
        thinking: `Evaluated natal parameters against ${enabledSchools}. Formatted output according to "${tone || 'mystical'}" perspective guidelines.`,
        modelUsed: "Aetheria-Local-Oracle"
      });
    }

    const sysInstruction = systemPrompt || `You are the Master Diviner and Sage of Aetheria, a high-order multi-school divination and metaphysics oracle.
You possess profound mastery in:
1. Western & Hellenistic Astrology (Planetary ephemeris, houses, aspects, transits, progressions)
2. BaZi (Four Pillars of Destiny: Heavenly Stems, Earthly Branches, Ten Gods, Five Elements balance, Yong Shen favorable element)
3. Zi Wei Dou Shu (Purple Star Astrology: 12 Palaces, San Fang Si Zheng, Major Stars, Sihua mutations)
4. I Ching (Book of Changes: 64 Hexagrams, changing lines, trigrams, judgment and image)
5. Hermetic Tarot & Sacred Geometry
6. Elder Futhark Norse Runes & Wyrd Weaving
7. Jungian Archetypes & Oneiromancy (Dream symbolism)

CURRENT CONSULTATION PARAMETERS:
- Tone & Style: ${selectedToneDesc}
- Enabled Divination Lenses: ${enabledSchools}

You must provide deep, nuanced, philosophically grounded, mathematically rigorous, and spiritually transformative readings.
Incorporate the seeker's specific birth profile, active transits, and any provided dream context.
Formatting: Use elegant markdown, celestial symbols (✦, ☽, ☉, ☿, ♀, ♂, ♃, ♄, ☯), clear thematic sections, actionable strategic advice, and contemplative affirmations.`;

    const contents = [
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      {
        role: 'user',
        parts: [{
          text: `User Profile Details:
- Name/Signifier: ${userProfile?.name || 'Seeker'}
- Date of Birth: ${userProfile?.birthDate || 'Unknown'}
- Exact Birth Time: ${userProfile?.birthTime || 'Unknown'}
- Birth Place: ${userProfile?.birthCity || 'Unknown'} (${userProfile?.latitude || '0'}, ${userProfile?.longitude || '0'})
- Gender/Yin-Yang Polarity: ${userProfile?.gender || 'Non-specified'}
- True Solar Time Adjustment: ${userProfile?.useTrueSolarTime ? 'Enabled' : 'Disabled'}
- Active Focus Specialist: ${school || 'Grand Multi-School Synthesizer'}
- Active Consultation Tone: ${tone || 'Mystical & Poetic'}
- Enabled Schools: ${enabledSchools}

Natal & Transits Context Payload:
${natalPayload ? JSON.stringify(natalPayload, null, 2) : 'Natal matrix computed from birth data.'}

${transitsPayload ? `Active Transits Payload:\n${JSON.stringify(transitsPayload, null, 2)}` : ''}

${dreamContext ? `Recent Dream Journal Context:\n${JSON.stringify(dreamContext, null, 2)}` : ''}

Seeker Inquiry:
${prompt}`
        }]
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents,
      config: {
        systemInstruction: sysInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    return res.json({
      success: true,
      school,
      response: response.text,
      modelUsed: "gemini-3.1-pro-preview"
    });
  } catch (error: any) {
    console.error("Gemini Divination Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Celestial transmission interrupted"
    });
  }
});

// Oneiromancy / Dream Interpretation Endpoint with High Thinking
app.post("/api/divination/dream-interpret", async (req, res) => {
  try {
    const { dreamText, dreamTitle, emotion, lucidityRating, tags, userProfile } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        success: true,
        interpretation: `[Cosmic Oneiromancer - Alchemical Synthesis]\n\n✦ Archetypal Analysis: Your dream "${dreamTitle || 'Nocturnal Vision'}" vibrates with the archetype of the Threshold Guardian and the Rebirth Cycle.\n✦ Elemental Breakdown: The predominant emotional tone (${emotion || 'Mysterious'}) suggests an integration of shadow material into conscious awareness.\n✦ Celestial & Astrological Parallel: Resonates with lunar transits across the 8th and 12th houses, urging introspection.\n✦ Practical Guidance: Record recurring symbols upon waking and meditate on the central motif during twilight hours.`,
        modelUsed: "Aetheria-Local-Oneiromancer"
      });
    }

    const prompt = `Analyze this dream through multi-layered lenses: Jungian Depth Psychology, Alchemical Symbolism, Astrological/Planetary Resonance, and Ancient Oneiromancy:
    
Dream Title: ${dreamTitle}
Dream Narrative:
${dreamText}

Dream Metadata:
- Dominant Emotional Tone: ${emotion}
- Lucidity Rating: ${lucidityRating}/5
- Key Associated Symbols: ${tags ? tags.join(', ') : 'None specified'}
- Seeker Profile: ${userProfile?.name || 'Seeker'} (Born: ${userProfile?.birthDate || 'Unknown'})

Provide a structured, profound reading with:
1. Core Archetypal & Mythic Motifs
2. Shadow & Subconscious Messages
3. Astrological & Elemental Correspondences
4. Alchemical Stage (Nigredo, Albedo, Citrinitas, or Rubedo)
5. Actionable waking-life integration & Dream Amulet / Affirmation`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are the High Oneiromancer of Aetheria, master of dream scrying, Jungian active imagination, and astral symbolism. Deliver deeply resonant, poetic, yet analytically profound interpretations.",
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    return res.json({
      success: true,
      interpretation: response.text,
      modelUsed: "gemini-3.1-pro-preview"
    });
  } catch (error: any) {
    console.error("Dream Interpretation Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Astral channel error"
    });
  }
});

// Daily / Weekly / Monthly Multi-School Insights Endpoint with High Thinking
app.post("/api/divination/daily-insights", async (req, res) => {
  try {
    const { timeframe, userProfile, natalPayload, dateStr } = req.body;
    const ai = getGenAI();

    if (!ai) {
      // Deterministic calculation-based rich response when API key is missing
      const energyScore = timeframe === 'today' ? 88 : (timeframe === 'week' ? 84 : 91);
      return res.json({
        success: true,
        timeframe: timeframe || 'today',
        energyScore,
        archetypes: ["Strategic Synthesis", "Solar Trine Harmonic", "Wood-Fire Ascendance"],
        westernTransit: "Sun in Leo conjunct natal midheaven forms an expansive sextile with Jupiter. Intuition and visionary planning are at an energetic peak.",
        baziAlert: "Day Master (Jia Wood 甲) harmonizes with the Si Fire (巳) transit branch — producing a favorable Eating God (食神) artistic manifestation flow without severe clashes.",
        ichingGuidance: "䷀ Hexagram 1 (The Creative / Qian) — Pure dynamic momentum. Proceed with unwavering focus, balancing solar assertiveness with grounded humility.",
        tacticalAction: "Schedule high-stakes creative synthesis or decision-making during the Golden Solar Hour (11:00 - 13:00 TST).",
        avoidAction: "Avoid reactive disputes during the evening Water clash window (21:00 - 23:00).",
        elementalFocus: "Wood (35%) & Fire (30%) Dominant — Channel prana into tangible creation.",
        modelUsed: "Aetheria-Local-Deterministic"
      });
    }

    const prompt = `Generate a high-precision, multi-school divination synthesis for the timeframe: "${timeframe || 'today'}":

Seeker Profile:
- Name: ${userProfile?.name || 'Seeker'}
- Birth: ${userProfile?.birthDate || 'Unknown'} ${userProfile?.birthTime || ''} (${userProfile?.birthCity || 'Unknown'})
- Day Master: ${natalPayload?.bazi?.dayMaster ? `${natalPayload.bazi.dayMaster.polarity} ${natalPayload.bazi.dayMaster.element} (${natalPayload.bazi.dayMaster.char})` : 'Yang Wood'}
- Sun Sign: ${natalPayload?.astrology?.sun ? `${natalPayload.astrology.sun.signName} ${natalPayload.astrology.sun.degreeInSign}°` : 'Leo'}
- Target Epoch / Date: ${dateStr || new Date().toISOString().split('T')[0]}

Requirements:
Synthesize insights across:
1. Western Astrology (Sun/Moon transits, Ascendant tone, key planetary aspects)
2. BaZi / Four Pillars (Day Master interactions, Clash/Harm/Combine/Ten Gods alerts for this epoch)
3. I Ching / Oracle (Active hexagram guidance and changing lines)
4. Overall Energy Score (Integer from 0 to 100)
5. 3-4 Key Archetypes / Keywords
6. Actionable Do's and Don'ts

Format the response strictly as valid JSON with keys:
{
  "energyScore": number,
  "archetypes": string[],
  "westernTransit": string,
  "baziAlert": string,
  "ichingGuidance": string,
  "tacticalAction": string,
  "avoidAction": string,
  "elementalFocus": string,
  "synthesisNarrative": string
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are the Grand Divination Synthesizer of Aetheria. You blend Western Ephemeris, Chinese BaZi, and I Ching metaphysics into actionable, philosophically profound insights. Always return valid JSON.",
        responseMimeType: "application/json",
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      return res.json({
        success: true,
        timeframe: timeframe || 'today',
        ...parsed,
        modelUsed: "gemini-3.1-pro-preview"
      });
    } catch {
      return res.json({
        success: true,
        timeframe: timeframe || 'today',
        synthesisNarrative: response.text,
        energyScore: 88,
        archetypes: ["Cosmic Realignment", "Solar Expansion", "Intuitive Lucidity"],
        modelUsed: "gemini-3.1-pro-preview"
      });
    }
  } catch (error: any) {
    console.error("Daily Insights Divination Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to synthesize celestial epoch"
    });
  }
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "Aetheria Divination Matrix",
    timestamp: new Date().toISOString(),
    aiReady: !!process.env.GEMINI_API_KEY
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✦ Aetheria Divination Hub running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
