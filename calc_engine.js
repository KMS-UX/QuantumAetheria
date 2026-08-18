/**
 * AETHERIA — Offline Astronomical & Calendar Calculation Engine (`calc_engine.js`)
 * 
 * High-precision, zero-external-dependency calculation engine:
 * 1. Astronomical True Solar Time (TST) with Equation of Time (EoT) & Longitude correction
 * 2. Complete BaZi (八字) Four Pillars of Destiny, 60 Sexagenary JiaZi cycle, Solar Terms, 
 *    Day Master identification, Ten Gods (十神), Hidden Stems (藏干), and 5 Elements Balance %
 * 3. Western Tropical Zodiac Astrological Ephemeris (Sun, Moon, Ascendant/Rising Sign, Planets)
 * 4. Authentic I Ching (周易) Coin Toss, Changing Lines, Hexagram Transmutations & 64 Hexagrams
 * 5. Unified "Natal JSON Payload" generator & localStorage persistence
 */

export const CalcEngine = {
  
  // --- ASTRONOMICAL TRUE SOLAR TIME (TST) ENGINE ---
  calculateTrueSolarTime(dateInput, timeStr, longitude, timezoneOffsetHours) {
    const [year, month, day] = dateInput.split('-').map(Number);
    let [hours, minutes, seconds] = (timeStr || "12:00:00").split(':').map(Number);
    if (isNaN(seconds)) seconds = 0;

    const localDate = new Date(year, month - 1, day, hours, minutes, seconds);

    // Day of Year (d)
    const startOfYear = new Date(year, 0, 1);
    const dayOfYear = Math.floor((localDate - startOfYear) / (24 * 60 * 60 * 1000)) + 1;

    // Fractional year angle B in radians
    // B = 360/365.242 * (d - 81)
    const B = (360 / 365.242) * (dayOfYear - 81) * (Math.PI / 180);

    // Equation of Time (EoT) approximation in minutes
    // EoT = 9.87*sin(2B) - 7.53*cos(B) - 1.5*sin(B)
    const eotMinutes = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

    // Standard meridian for the given timezone (15 degrees per hour)
    const standardMeridian = timezoneOffsetHours * 15;

    // Geographic Longitude Solar Offset (4 minutes per degree east of standard meridian)
    const lonOffsetMinutes = (longitude - standardMeridian) * 4;

    // Total solar adjustment in minutes
    const totalDeltaMinutes = eotMinutes + lonOffsetMinutes;

    // Adjusted True Solar Date/Time
    const tstTimeMillis = localDate.getTime() + totalDeltaMinutes * 60 * 1000;
    const tstDate = new Date(tstTimeMillis);

    const pad = (n) => String(n).padStart(2, '0');
    const tstFormattedTime = `${pad(tstDate.getHours())}:${pad(tstDate.getMinutes())}:${pad(tstDate.getSeconds())}`;
    const tst12Hour = tstDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    return {
      standardDate: localDate,
      tstDate,
      dayOfYear,
      eotMinutes,
      lonOffsetMinutes,
      totalDeltaMinutes,
      tstFormattedTime,
      tst12Hour,
      tstYear: tstDate.getFullYear(),
      tstMonth: tstDate.getMonth() + 1,
      tstDay: tstDate.getDate(),
      tstHour: tstDate.getHours(),
      tstMinute: tstDate.getMinutes()
    };
  },

  // --- BAZI (八字) FOUR PILLARS ENGINE ---
  // Stems: 甲 乙 丙 丁 戊 己 庚 辛 壬 癸
  HEAVENLY_STEMS: [
    { char: "甲", pinyin: "Jia", element: "Wood", polarity: "Yang", color: "var(--elem-wood)" },
    { char: "乙", pinyin: "Yi", element: "Wood", polarity: "Yin", color: "var(--elem-wood)" },
    { char: "丙", pinyin: "Bing", element: "Fire", polarity: "Yang", color: "var(--elem-fire)" },
    { char: "丁", pinyin: "Ding", element: "Fire", polarity: "Yin", color: "var(--elem-fire)" },
    { char: "戊", pinyin: "Wu", element: "Earth", polarity: "Yang", color: "var(--elem-earth)" },
    { char: "己", pinyin: "Ji", element: "Earth", polarity: "Yin", color: "var(--elem-earth)" },
    { char: "庚", pinyin: "Geng", element: "Metal", polarity: "Yang", color: "var(--elem-metal)" },
    { char: "辛", pinyin: "Xin", element: "Metal", polarity: "Yin", color: "var(--elem-metal)" },
    { char: "壬", pinyin: "Ren", element: "Water", polarity: "Yang", color: "var(--elem-water)" },
    { char: "癸", pinyin: "Gui", element: "Water", polarity: "Yin", color: "var(--elem-water)" }
  ],

  // Branches: 子 丑 寅 卯 辰 巳 午 未 申 酉 戌 亥
  EARTHLY_BRANCHES: [
    { char: "子", pinyin: "Zi (Rat)", element: "Water", polarity: "Yang", hiddenStems: ["癸"], hours: "23:00 - 01:00" },
    { char: "丑", pinyin: "Chou (Ox)", element: "Earth", polarity: "Yin", hiddenStems: ["己", "癸", "辛"], hours: "01:00 - 03:00" },
    { char: "寅", pinyin: "Yin (Tiger)", element: "Wood", polarity: "Yang", hiddenStems: ["甲", "丙", "戊"], hours: "03:00 - 05:00" },
    { char: "卯", pinyin: "Mao (Rabbit)", element: "Wood", polarity: "Yin", hiddenStems: ["乙"], hours: "05:00 - 07:00" },
    { char: "辰", pinyin: "Chen (Dragon)", element: "Earth", polarity: "Yang", hiddenStems: ["戊", "乙", "癸"], hours: "07:00 - 09:00" },
    { char: "巳", pinyin: "Si (Snake)", element: "Fire", polarity: "Yin", hiddenStems: ["丙", "庚", "戊"], hours: "09:00 - 11:00" },
    { char: "午", pinyin: "Wu (Horse)", element: "Fire", polarity: "Yang", hiddenStems: ["丁", "己"], hours: "11:00 - 13:00" },
    { char: "未", pinyin: "Wei (Goat)", element: "Earth", polarity: "Yin", hiddenStems: ["己", "丁", "乙"], hours: "13:00 - 15:00" },
    { char: "申", pinyin: "Shen (Monkey)", element: "Metal", polarity: "Yang", hiddenStems: ["庚", "壬", "戊"], hours: "15:00 - 17:00" },
    { char: "酉", pinyin: "You (Rooster)", element: "Metal", polarity: "Yin", hiddenStems: ["辛"], hours: "17:00 - 19:00" },
    { char: "戌", pinyin: "Xu (Dog)", element: "Earth", polarity: "Yang", hiddenStems: ["戊", "辛", "丁"], hours: "19:00 - 21:00" },
    { char: "亥", pinyin: "Hai (Pig)", element: "Water", polarity: "Yin", hiddenStems: ["壬", "甲"], hours: "21:00 - 23:00" }
  ],

  // 10 Gods (Shi Shen) Relationship Matrix based on Day Master
  getTenGod(dayMasterStemChar, targetStemChar) {
    const dmIndex = this.HEAVENLY_STEMS.findIndex(s => s.char === dayMasterStemChar);
    const targetIndex = this.HEAVENLY_STEMS.findIndex(s => s.char === targetStemChar);
    if (dmIndex === -1 || targetIndex === -1) return "Direct";

    const dm = this.HEAVENLY_STEMS[dmIndex];
    const target = this.HEAVENLY_STEMS[targetIndex];

    const elementOrder = ["Wood", "Fire", "Earth", "Metal", "Water"];
    const dmElemIdx = elementOrder.indexOf(dm.element);
    const targetElemIdx = elementOrder.indexOf(target.element);

    const isSamePolarity = dm.polarity === target.polarity;
    const diff = (targetElemIdx - dmElemIdx + 5) % 5;

    switch (diff) {
      case 0: // Same Element (Self)
        return isSamePolarity ? "Friend (比肩)" : "Rob Wealth (劫财)";
      case 1: // Produces (Output)
        return isSamePolarity ? "Eating God (食神)" : "Hurting Officer (伤官)";
      case 2: // Controls (Wealth)
        return isSamePolarity ? "Indirect Wealth (偏财)" : "Direct Wealth (正财)";
      case 3: // Controlled By (Power / Officer)
        return isSamePolarity ? "Seven Killings (七杀)" : "Direct Officer (正官)";
      case 4: // Produced By (Resource)
        return isSamePolarity ? "Indirect Resource (偏印)" : "Direct Resource (正印)";
      default:
        return "Self (日元)";
    }
  },

  // Julian Day Number Calculation
  getJulianDay(year, month, day, hour = 12, minute = 0) {
    if (month <= 2) {
      year -= 1;
      month += 12;
    }
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
    const dayFraction = (hour + minute / 60) / 24;
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + dayFraction + B - 1524.5;
  },

  // Julian Day from a possibly negative/>24 UT-hour offset (e.g. local hour minus a positive
  // timezone offset). Using utHours/24 directly as the day fraction avoids the sign mismatch
  // that Math.floor()/modulo decomposition produces for negative values.
  getJulianDayFromUTHours(year, month, day, utHours) {
    if (month <= 2) {
      year -= 1;
      month += 12;
    }
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
    const dayFraction = utHours / 24;
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + dayFraction + B - 1524.5;
  },

  // Sun's apparent ecliptic longitude (degrees, 0-360) at a given Julian Day.
  // Low-precision series (~0.01-0.02 deg accuracy), same formula used for Western astrology.
  getSolarEclipticLongitude(jd) {
    const T = (jd - 2451545.0) / 36525.0;
    const L0 = (280.46646 + 36000.76983 * T) % 360;
    const M_sun = (357.52911 + 35999.05029 * T) * (Math.PI / 180);
    const C_sun = (1.914602 - 0.004817 * T) * Math.sin(M_sun) + (0.019993 - 0.000101 * T) * Math.sin(2 * M_sun) + 0.000289 * Math.sin(3 * M_sun);
    return (L0 + C_sun + 360) % 360;
  },

  // Finds the Julian Day nearest `seedJD` at which the sun's ecliptic longitude equals
  // `targetLongitudeDeg` — i.e. the exact moment a solar term (Jie Qi) begins. Newton's method
  // using the sun's near-constant mean daily motion (~0.9856 deg/day) converges in a few steps.
  findSolarTermJD(targetLongitudeDeg, seedJD) {
    const MEAN_DAILY_MOTION = 360 / 365.2422;
    let jd = seedJD;
    for (let i = 0; i < 8; i++) {
      const lon = this.getSolarEclipticLongitude(jd);
      let diff = targetLongitudeDeg - lon;
      diff = ((diff + 180) % 360 + 360) % 360 - 180; // normalize to (-180, 180]
      if (Math.abs(diff) < 0.0005) break;
      jd += diff / MEAN_DAILY_MOTION;
    }
    return jd;
  },

  // Solar Term (Jie Qi) Month Branch Index — derived from the sun's real ecliptic longitude
  // at the given Julian Day, not a fixed calendar-day lookup table. The 12 "Jie" boundaries
  // (Li Chun, Jing Zhe, Qing Ming, ...) are exactly 30 degrees apart starting at 315 deg (Li Chun).
  getSolarMonthBranchIndex(jd) {
    const sunLon = this.getSolarEclipticLongitude(jd);
    const sectorOffset = Math.floor((((sunLon - 315) % 360 + 360) % 360) / 30);
    return (2 + sectorOffset) % 12; // 2 = Yin's index in EARTHLY_BRANCHES (Li Chun sector)
  },

  calculateBaZi(birthDate, birthTime, longitude, timezoneOffsetHours, useTST = true) {
    let activeDate = birthDate;
    let activeTime = birthTime;
    let tstData = null;

    if (useTST) {
      tstData = this.calculateTrueSolarTime(birthDate, birthTime, longitude, timezoneOffsetHours);
      const pad = (n) => String(n).padStart(2, '0');
      activeDate = `${tstData.tstYear}-${pad(tstData.tstMonth)}-${pad(tstData.tstDay)}`;
      activeTime = `${pad(tstData.tstHour)}:${pad(tstData.tstMinute)}:00`;
    }

    const [year, month, day] = activeDate.split('-').map(Number);
    const [hours, minutes] = activeTime.split(':').map(Number);

    // Real UT moment of birth (independent of the True Solar Time toggle above, which is a
    // BaZi-specific civil-clock adjustment, not an astronomical UT conversion) — used to find
    // this birth's true position relative to the sun's real ecliptic longitude for the Year
    // and Month Pillar solar-term boundaries.
    const [rawYear, rawMonth, rawDay] = birthDate.split('-').map(Number);
    const [rawHours, rawMinutes] = (birthTime || "12:00").split(':').map(Number);
    const utHours = rawHours + rawMinutes / 60 - timezoneOffsetHours;
    const birthJD = this.getJulianDayFromUTHours(rawYear, rawMonth, rawDay, utHours);

    // 1. Year Pillar:
    // Chinese Solar Year begins at the exact moment of Li Chun (sun's ecliptic longitude = 315 deg),
    // which falls on Feb 3, 4, or 5 depending on the year — found astronomically, not assumed fixed.
    const liChunSeedJD = this.getJulianDay(rawYear, 2, 4, 12, 0);
    const liChunJD = this.findSolarTermJD(315, liChunSeedJD);
    let baziYear = birthJD < liChunJD ? rawYear - 1 : rawYear;
    // 4 AD was Jia Zi (0, 0)
    const yearStemIdx = (baziYear - 4) % 10;
    const yearBranchIdx = (baziYear - 4) % 12;
    const yearStem = this.HEAVENLY_STEMS[(yearStemIdx + 10) % 10];
    const yearBranch = this.EARTHLY_BRANCHES[(yearBranchIdx + 12) % 12];

    // 2. Month Pillar:
    // Five Tigers Seeking Month (Wu Hu Dun):
    // Year Stem: Jia/Ji (0,5) -> Month 1 is Bing(2); Yi/Geng(1,6) -> Wu(4); Bing/Xin(2,7) -> Geng(6); Ding/Ren(3,8) -> Ren(8); Wu/Gui(4,9) -> Jia(0)
    const monthBranchIdx = this.getSolarMonthBranchIndex(birthJD);
    const monthBranch = this.EARTHLY_BRANCHES[monthBranchIdx];
    
    // Month sequence from Yin (index 2): Yin=0, Mao=1, Chen=2 ...
    const solarMonthOffset = (monthBranchIdx - 2 + 12) % 12;
    const tigerBaseStem = ((yearStemIdx % 5) * 2 + 2) % 10;
    const monthStemIdx = (tigerBaseStem + solarMonthOffset) % 10;
    const monthStem = this.HEAVENLY_STEMS[monthStemIdx];

    // 3. Day Pillar:
    // Julian Day Number algorithm for Sexagenary Day
    // Day Stem: (JD + 9) % 10; Day Branch: (JD + 1) % 12 (at 0:00 UT)
    const jd = this.getJulianDay(year, month, day, 12, 0);
    const dayStemIdx = Math.floor((jd + 9) % 10);
    const dayBranchIdx = Math.floor((jd + 1) % 12);
    const dayStem = this.HEAVENLY_STEMS[(dayStemIdx + 10) % 10];
    const dayBranch = this.EARTHLY_BRANCHES[(dayBranchIdx + 12) % 12];

    // 4. Hour Pillar:
    // Hour Branch: Zi (23:00-01:00 = 0), Chou (01:00-03:00 = 1), ..., Hai (21:00-23:00 = 11)
    let hourBranchIdx = Math.floor((hours + 1) / 2) % 12;
    const hourBranch = this.EARTHLY_BRANCHES[hourBranchIdx];

    // Five Rats Seeking Hour (Wu Shu Dun):
    // Day Stem: Jia/Ji (0,5) -> Zi hour is Jia(0); Yi/Geng(1,6) -> Bing(2); Bing/Xin(2,7) -> Wu(4); Ding/Ren(3,8) -> Geng(6); Wu/Gui(4,9) -> Ren(8)
    const ratBaseStem = ((dayStemIdx % 5) * 2) % 10;
    const hourStemIdx = (ratBaseStem + hourBranchIdx) % 10;
    const hourStem = this.HEAVENLY_STEMS[hourStemIdx];

    // 5. Day Master & 10 Gods (Shi Shen)
    const dayMaster = dayStem;
    const pillars = {
      year: {
        title: "Year Pillar (年柱)",
        stem: yearStem,
        branch: yearBranch,
        tenGod: this.getTenGod(dayMaster.char, yearStem.char),
        desc: "Ancestral roots, outer social demeanor & early upbringing"
      },
      month: {
        title: "Month Pillar (月柱)",
        stem: monthStem,
        branch: monthBranch,
        tenGod: this.getTenGod(dayMaster.char, monthStem.char),
        desc: "Career foundation, parentage & prime adult ambitions"
      },
      day: {
        title: "Day Pillar (日柱)",
        stem: dayStem,
        branch: dayBranch,
        tenGod: "Day Master (日元 / True Self)",
        desc: "Core identity, inner essence & life partner resonance"
      },
      hour: {
        title: "Hour Pillar (时柱)",
        stem: hourStem,
        branch: hourBranch,
        tenGod: this.getTenGod(dayMaster.char, hourStem.char),
        desc: "Inner aspirations, subconscious mind & later legacy"
      }
    };

    // 6. Five Elements Balance Calculation (Stem weights + Hidden Branch Stems weights)
    const elementScores = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };

    [yearStem, monthStem, dayStem, hourStem].forEach(stem => {
      elementScores[stem.element] += 15; // Primary stem points
    });

    [yearBranch, monthBranch, dayBranch, hourBranch].forEach((branch, bIdx) => {
      // Month branch carries heavy seasonal Qi (Commander)
      const multiplier = (bIdx === 1) ? 1.8 : 1.0;
      branch.hiddenStems.forEach((hStemChar, hIdx) => {
        const hStem = this.HEAVENLY_STEMS.find(s => s.char === hStemChar);
        if (hStem) {
          const weight = (hIdx === 0 ? 12 : 6) * multiplier;
          elementScores[hStem.element] += weight;
        }
      });
    });

    const totalScore = Object.values(elementScores).reduce((a, b) => a + b, 0) || 100;
    const elementPercentages = {
      Wood: Math.round((elementScores.Wood / totalScore) * 100),
      Fire: Math.round((elementScores.Fire / totalScore) * 100),
      Earth: Math.round((elementScores.Earth / totalScore) * 100),
      Metal: Math.round((elementScores.Metal / totalScore) * 100),
      Water: Math.round((elementScores.Water / totalScore) * 100)
    };

    // Normalize rounding to ensure 100%
    const sumP = Object.values(elementPercentages).reduce((a, b) => a + b, 0);
    if (sumP !== 100) {
      elementPercentages.Wood += (100 - sumP);
    }

    // Sort to find Dominant and Favorable Elements
    const sortedElements = Object.entries(elementPercentages).sort((a, b) => b[1] - a[1]);
    const dominantElement = sortedElements[0][0];
    const weakestElement = sortedElements[sortedElements.length - 1][0];

    return {
      dayMaster,
      pillars,
      elementScores,
      elementPercentages,
      dominantElement,
      weakestElement,
      dayMasterResonance: `${dayMaster.polarity} ${dayMaster.element} (${dayMaster.char} ${dayMaster.pinyin})`,
      dayBranchResonance: `${dayBranch.char} ${dayBranch.pinyin}`,
      tstData
    };
  },

  // --- WESTERN TROPICAL ASTROLOGY ENGINE ---
  ZODIAC_SIGNS: [
    { name: "Aries", glyph: "♈", element: "Fire", modality: "Cardinal", ruler: "Mars ♂", startDeg: 0 },
    { name: "Taurus", glyph: "♉", element: "Earth", modality: "Fixed", ruler: "Venus ♀", startDeg: 30 },
    { name: "Gemini", glyph: "♊", element: "Air", modality: "Mutable", ruler: "Mercury ☿", startDeg: 60 },
    { name: "Cancer", glyph: "♋", element: "Water", modality: "Cardinal", ruler: "Moon ☽", startDeg: 90 },
    { name: "Leo", glyph: "♌", element: "Fire", modality: "Fixed", ruler: "Sun ☉", startDeg: 120 },
    { name: "Virgo", glyph: "♍", element: "Earth", modality: "Mutable", ruler: "Mercury ☿", startDeg: 150 },
    { name: "Libra", glyph: "♎", element: "Air", modality: "Cardinal", ruler: "Venus ♀", startDeg: 180 },
    { name: "Scorpio", glyph: "♏", element: "Water", modality: "Fixed", ruler: "Pluto ♇ / Mars ♂", startDeg: 210 },
    { name: "Sagittarius", glyph: "♐", element: "Fire", modality: "Mutable", ruler: "Jupiter ♃", startDeg: 240 },
    { name: "Capricorn", glyph: "♑", element: "Earth", modality: "Cardinal", ruler: "Saturn ♄", startDeg: 270 },
    { name: "Aquarius", glyph: "♒", element: "Air", modality: "Fixed", ruler: "Uranus ♅ / Saturn ♄", startDeg: 300 },
    { name: "Pisces", glyph: "♓", element: "Water", modality: "Mutable", ruler: "Neptune ♆ / Jupiter ♃", startDeg: 330 }
  ],

  degToSign(degrees) {
    const deg = ((degrees % 360) + 360) % 360;
    const signIndex = Math.floor(deg / 30);
    const sign = this.ZODIAC_SIGNS[signIndex];
    const signDeg = Math.floor(deg % 30);
    const signMin = Math.floor((deg % 1) * 60);
    const pad = (n) => String(n).padStart(2, '0');
    return {
      totalDegree: deg,
      signIndex,
      signName: sign.name,
      glyph: sign.glyph,
      element: sign.element,
      ruler: sign.ruler,
      degreeInSign: signDeg,
      minuteInSign: signMin,
      formatted: `${sign.glyph} ${sign.name} ${pad(signDeg)}°${pad(signMin)}'`
    };
  },

  // --- LOW-PRECISION PLANETARY EPHEMERIS (real orbital-elements method) ---
  // Algorithm reference: Paul Schlyter, "How to compute planetary positions"
  // (stjarnhimlen.se/comp/ppcomp.html) — heliocentric Kepler-orbit elements combined with
  // Earth's own heliocentric position for geocentric longitude, accurate to ~1 arcminute
  // for planets over roughly 1800-2050. Elements: N=ascending node, i=inclination,
  // w=argument of perihelion, a=semi-major axis (AU), e=eccentricity, M=mean anomaly;
  // each [base, dailyRate] pair referenced to day d = 0 at 1999-12-31 00:00 UT.
  PLANET_ELEMENTS: {
    Mercury: { N: [48.3313, 3.24587e-5], i: [7.0047, 5.00e-8], w: [29.1241, 1.01444e-5], a: 0.387098, e: [0.205635, 5.59e-10], M: [168.6562, 4.0923344368] },
    Venus: { N: [76.6799, 2.46590e-5], i: [3.3946, 2.75e-8], w: [54.8910, 1.38374e-5], a: 0.723330, e: [0.006773, -1.302e-9], M: [48.0052, 1.6021302244] },
    Mars: { N: [49.5574, 2.11081e-5], i: [1.8497, -1.78e-8], w: [286.5016, 2.92961e-5], a: 1.523688, e: [0.093405, 2.516e-9], M: [18.6021, 0.5240207766] },
    Jupiter: { N: [100.4542, 2.76854e-5], i: [1.3030, -1.557e-7], w: [273.8777, 1.64505e-5], a: 5.20256, e: [0.048498, 4.469e-9], M: [19.8950, 0.0830853001] },
    Saturn: { N: [113.6634, 2.38980e-5], i: [2.4886, -1.081e-7], w: [339.3939, 2.97661e-5], a: 9.55475, e: [0.055546, -9.499e-9], M: [316.9670, 0.0334442282] }
  },

  // Solves Kepler's equation E - e*sin(E) = M for eccentric anomaly E (degrees).
  solveKeplerEquation(mDeg, e) {
    const RAD = Math.PI / 180;
    let E = mDeg + (e * 180 / Math.PI) * Math.sin(mDeg * RAD) * (1 + e * Math.cos(mDeg * RAD));
    for (let i = 0; i < 8; i++) {
      const delta = (E - (e * 180 / Math.PI) * Math.sin(E * RAD) - mDeg) / (1 - e * Math.cos(E * RAD));
      E -= delta;
      if (Math.abs(delta) < 1e-6) break;
    }
    return E;
  },

  // Heliocentric ecliptic rectangular coordinates (AU) for a planet's orbital elements at day-number d.
  getPlanetHeliocentricXYZ(elements, d) {
    const RAD = Math.PI / 180;
    const N = elements.N[0] + elements.N[1] * d;
    const i = elements.i[0] + elements.i[1] * d;
    const w = elements.w[0] + elements.w[1] * d;
    const a = elements.a;
    const e = elements.e[0] + elements.e[1] * d;
    const M = elements.M[0] + elements.M[1] * d;

    const E = this.solveKeplerEquation(M, e);
    const xv = a * (Math.cos(E * RAD) - e);
    const yv = a * (Math.sqrt(1 - e * e) * Math.sin(E * RAD));
    const v = Math.atan2(yv, xv) * (180 / Math.PI);
    const r = Math.sqrt(xv * xv + yv * yv);

    const vwRad = (v + w) * RAD;
    const nRad = N * RAD;
    const iRad = i * RAD;
    return {
      x: r * (Math.cos(nRad) * Math.cos(vwRad) - Math.sin(nRad) * Math.sin(vwRad) * Math.cos(iRad)),
      y: r * (Math.sin(nRad) * Math.cos(vwRad) + Math.cos(nRad) * Math.sin(vwRad) * Math.cos(iRad)),
      z: r * (Math.sin(vwRad) * Math.sin(iRad))
    };
  },

  // Earth's heliocentric ecliptic (x,y) via the Sun's own orbital elements (N=0, i=0 by definition).
  getEarthHeliocentricXY(d) {
    const RAD = Math.PI / 180;
    const w = 282.9404 + 4.70935e-5 * d;
    const e = 0.016709 - 1.151e-9 * d;
    const M = 356.0470 + 0.9856002585 * d;
    const E = this.solveKeplerEquation(M, e);
    const xv = Math.cos(E * RAD) - e;
    const yv = Math.sqrt(1 - e * e) * Math.sin(E * RAD);
    const v = Math.atan2(yv, xv) * (180 / Math.PI);
    const r = Math.sqrt(xv * xv + yv * yv);
    const vwRad = (v + w) * RAD;
    return { x: r * Math.cos(vwRad), y: r * Math.sin(vwRad) };
  },

  // Geocentric ecliptic longitude (degrees, 0-360) for a named planet at Julian Day jd.
  getPlanetGeocentricLongitude(planetName, jd) {
    const d = jd - 2451543.5; // Schlyter epoch: day 0 = 1999-12-31 00:00 UT
    const sun = this.getEarthHeliocentricXY(d);
    const helio = this.getPlanetHeliocentricXYZ(this.PLANET_ELEMENTS[planetName], d);
    const xg = helio.x + sun.x;
    const yg = helio.y + sun.y;
    return ((Math.atan2(yg, xg) * (180 / Math.PI)) % 360 + 360) % 360;
  },

  HOUSE_ORDINALS: ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"],

  // Equal House system: House 1 begins at the Ascendant, each subsequent house is +30 degrees.
  houseLabel(bodyLon, ascLon) {
    const offset = (((bodyLon - ascLon) % 360) + 360) % 360;
    const houseNum = Math.floor(offset / 30);
    return `${this.HOUSE_ORDINALS[houseNum]} House`;
  },

  calculateWesternAstrology(birthDate, birthTime, latitude, longitude, timezoneOffsetHours) {
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hours, minutes] = (birthTime || "12:00").split(':').map(Number);

    // Universal Time (UT) in hours
    const utHours = hours + minutes / 60 - timezoneOffsetHours;
    const jd = this.getJulianDayFromUTHours(year, month, day, utHours);

    // Julian centuries from J2000.0
    const T = (jd - 2451545.0) / 36525.0;

    // 1. Solar Ecliptic Longitude (Low-precision Ephemeris accurate to within ~0.05°)
    const sunLon = this.getSolarEclipticLongitude(jd);
    const sunPlacement = this.degToSign(sunLon);

    // 2. Lunar Ecliptic Longitude — truncated Meeus low-precision series (top ~13 periodic terms),
    // accurate to roughly 0.05 deg, a substantial upgrade from a 3-term approximation.
    const L_moon = 218.3164477 + 481267.88123421 * T; // mean longitude
    const D_moon = (297.8501921 + 445267.1114034 * T) * (Math.PI / 180); // mean elongation from Sun
    const M_moon = (134.9633964 + 477198.8675055 * T) * (Math.PI / 180); // mean anomaly
    const F_moon = (93.2720950 + 483202.0175233 * T) * (Math.PI / 180); // argument of latitude
    const Mm_sun = (357.5291092 + 35999.0502909 * T) * (Math.PI / 180); // Sun's mean anomaly

    const moonLonCorrection =
        6.288774 * Math.sin(M_moon)
      + 1.274027 * Math.sin(2 * D_moon - M_moon)
      + 0.658314 * Math.sin(2 * D_moon)
      + 0.213618 * Math.sin(2 * M_moon)
      - 0.185116 * Math.sin(Mm_sun)
      - 0.114332 * Math.sin(2 * F_moon)
      + 0.058793 * Math.sin(2 * D_moon - 2 * M_moon)
      + 0.057066 * Math.sin(2 * D_moon - Mm_sun - M_moon)
      + 0.053322 * Math.sin(2 * D_moon + M_moon)
      + 0.045758 * Math.sin(2 * D_moon - Mm_sun)
      - 0.040923 * Math.sin(Mm_sun - M_moon)
      - 0.034720 * Math.sin(D_moon)
      - 0.030383 * Math.sin(Mm_sun + M_moon);

    const moonLon = (((L_moon + moonLonCorrection) % 360) + 360) % 360;
    const moonPlacement = this.degToSign(moonLon);

    // Lunar Phase
    const phaseAngle = ((moonLon - sunLon + 360) % 360);
    let moonPhaseName = "New Moon 🌑";
    if (phaseAngle >= 22.5 && phaseAngle < 67.5) moonPhaseName = "Waxing Crescent 🌒";
    else if (phaseAngle >= 67.5 && phaseAngle < 112.5) moonPhaseName = "First Quarter 🌓";
    else if (phaseAngle >= 112.5 && phaseAngle < 157.5) moonPhaseName = "Waxing Gibbous 🌔";
    else if (phaseAngle >= 157.5 && phaseAngle < 202.5) moonPhaseName = "Full Moon 🌕";
    else if (phaseAngle >= 202.5 && phaseAngle < 247.5) moonPhaseName = "Waning Gibbous 🌖";
    else if (phaseAngle >= 247.5 && phaseAngle < 292.5) moonPhaseName = "Last Quarter 🌗";
    else if (phaseAngle >= 292.5 && phaseAngle < 337.5) moonPhaseName = "Waning Crescent 🌘";

    // 3. Ascendant / Rising Sign Calculation (RAMC + Obliquity of Ecliptic)
    // Greenwich Mean Sidereal Time (GMST) in degrees:
    const gmst0 = (100.46061837 + 36000.770053608 * T + 0.000387933 * T * T) % 360;
    const gmst = (gmst0 + utHours * 15.04107) % 360;
    const ramc = (gmst + longitude + 360) % 360; // Local Sidereal Time in degrees
    const ramcRad = ramc * (Math.PI / 180);
    const epsRad = (23.439291 - 0.0130042 * T) * (Math.PI / 180); // Obliquity
    const latRad = latitude * (Math.PI / 180);

    // Ascendant formula: tan(Asc) = -cos(RAMC) / (sin(RAMC)*cos(eps) + tan(lat)*sin(eps))
    const ascY = -Math.cos(ramcRad);
    const ascX = Math.sin(ramcRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad);
    let ascLon = Math.atan2(ascY, ascX) * (180 / Math.PI);
    ascLon = (ascLon + 360) % 360;
    const ascPlacement = this.degToSign(ascLon);

    // 4. Inner & Outer Planets — real heliocentric orbital-elements ephemeris (see PLANET_ELEMENTS
    // and getPlanetGeocentricLongitude above), not a decorative approximation of the Sun's position.
    const mercuryLon = this.getPlanetGeocentricLongitude('Mercury', jd);
    const venusLon = this.getPlanetGeocentricLongitude('Venus', jd);
    const marsLon = this.getPlanetGeocentricLongitude('Mars', jd);
    const jupiterLon = this.getPlanetGeocentricLongitude('Jupiter', jd);
    const saturnLon = this.getPlanetGeocentricLongitude('Saturn', jd);

    return {
      sun: sunPlacement,
      moon: moonPlacement,
      moonPhase: moonPhaseName,
      ascendant: ascPlacement,
      planets: [
        { name: "Sun", glyph: "☉", ...sunPlacement, house: this.houseLabel(sunLon, ascLon), dignity: "Sovereign Essence" },
        { name: "Moon", glyph: "☽", ...moonPlacement, house: this.houseLabel(moonLon, ascLon), dignity: "Subconscious Pulse" },
        { name: "Mercury", glyph: "☿", ...this.degToSign(mercuryLon), house: this.houseLabel(mercuryLon, ascLon), dignity: "Rational Mind" },
        { name: "Venus", glyph: "♀", ...this.degToSign(venusLon), house: this.houseLabel(venusLon, ascLon), dignity: "Aesthetic Harmony" },
        { name: "Mars", glyph: "♂", ...this.degToSign(marsLon), house: this.houseLabel(marsLon, ascLon), dignity: "Vital Drive" },
        { name: "Jupiter", glyph: "♃", ...this.degToSign(jupiterLon), house: this.houseLabel(jupiterLon, ascLon), dignity: "Great Benefic" },
        { name: "Saturn", glyph: "♄", ...this.degToSign(saturnLon), house: this.houseLabel(saturnLon, ascLon), dignity: "Great Malefic / Builder" }
      ]
    };
  },

  // --- I CHING (周易) COIN TOSS & 64 HEXAGRAMS ENGINE ---
  TRIGRAMS: [
    { binary: "111", name: "Qian (乾)", element: "Heaven ☰", nature: "Creative / Strong" },
    { binary: "000", name: "Kun (坤)", element: "Earth ☷", nature: "Receptive / Yielding" },
    { binary: "100", name: "Zhen (震)", element: "Thunder ☳", nature: "Arousing / Movement" },
    { binary: "011", name: "Xun (巽)", element: "Wind ☴", nature: "Gentle / Penetrating" },
    { binary: "010", name: "Kan (坎)", element: "Water ☵", nature: "Abyssal / Flow" },
    { binary: "101", name: "Li (離)", element: "Fire ☲", nature: "Clinging / Clarity" },
    { binary: "001", name: "Gen (艮)", element: "Mountain ☶", nature: "Stillness / Keeping Still" },
    { binary: "110", name: "Dui (兌)", element: "Lake ☱", nature: "Joyous / Open" }
  ],

  HEXAGRAM_DATABASE: {
    "111111": { num: 1, name: "Qian (乾) — The Creative", symbol: "䷀", judgement: "Supreme success through unyielding perseverance with absolute cosmic integrity." },
    "000000": { num: 2, name: "Kun (坤) — The Receptive", symbol: "䷁", judgement: "Earthly nourishment and devotion. Yielding like a gentle mare to celestial guidance brings boundless harmony." },
    "100010": { num: 3, name: "Zhun (屯) — Initial Difficulty", symbol: "䷂", judgement: "Blade of grass pushing through stone. Gather wise counsel; avoid reckless premature expansion." },
    "010001": { num: 4, name: "Meng (蒙) — Youthful Inexperience", symbol: "䷃", judgement: "Mountain spring seeks ocean. Cultivate humble inquiry rather than obstinate certainty." },
    "111010": { num: 5, name: "Xu (需) — Waiting & Nourishment", symbol: "䷄", judgement: "Clouds gather in heaven. Feast peacefully and replenish reserves while awaiting the ordained season." },
    "010111": { num: 6, name: "Song (訟) — Conflict Resolution", symbol: "䷅", judgement: "Sincerity encounters blockage. Seek impartial mediation and avoid pressing disputes to total destruction." },
    "010000": { num: 7, name: "Shi (師) — The Army & Discipline", symbol: "䷆", judgement: "Disciplined unity under virtuous leadership. Clarity of purpose dispels chaos." },
    "000010": { num: 8, name: "Bi (比) — Union & Alliance", symbol: "䷇", judgement: "Water flowing over fertile ground. Seek genuine companions whose spirits align with your high path." },
    "111011": { num: 9, name: "Xiao Chu (小畜) — Small Taming", symbol: "䷈", judgement: "Gentle winds brush the clouds. Restraint in small things builds the foundation for monumental shifts." },
    "110111": { num: 10, name: "Lu (履) — Treading With Grace", symbol: "䷉", judgement: "Treading behind the tiger without being bitten. Tact, respect, and fearless balance safeguard the seeker." },
    "111000": { num: 11, name: "Tai (泰) — Peace & Flourishing", symbol: "䷊", judgement: "Heaven and earth commune. Small departures, great arrivals. Supreme fortune." },
    "000111": { num: 12, name: "Pi (否) — Stagnation & Standstill", symbol: "䷋", judgement: "Heaven and earth disconnect. The wise withdraw into quiet virtue rather than seeking worldly acclaim." },
    "101111": { num: 13, name: "Tong Ren (同人) — Fellowship", symbol: "䷌", judgement: "Fire blazing in the open sky. Universal kinship and transparent alliance cross great waters." },
    "111101": { num: 14, name: "Da You (大有) — Great Possession", symbol: "䷍", judgement: "Sun high in the zenith. Radiant abundance channeled with humility and benevolence." },
    "001000": { num: 15, name: "Qian (謙) — Modesty", symbol: "䷎", judgement: "Mountain concealed within Earth. Humility elevates; the modest sage who abases outward pride harvests boundless respect and enduring fortune." },
    "000100": { num: 16, name: "Yu (豫) — Enthusiasm", symbol: "䷏", judgement: "Thunder emerging from Earth. Joyful readiness stirs the collective; align intention with rhythm before decisive movement, and multitudes will follow." },
    "100110": { num: 17, name: "Sui (隨) — Following", symbol: "䷐", judgement: "Lake trailing behind Thunder. Adaptive surrender to the moment's current brings harmonious accord; release rigid control and flow toward what truly beckons." },
    "011001": { num: 18, name: "Gu (蠱) — Decay", symbol: "䷑", judgement: "Mountain stilling Wind, a stagnant vessel. Corruption accumulated through neglect demands courageous remedy — three days before, three days after, act with resolve." },
    "110000": { num: 19, name: "Lin (臨) — Approach", symbol: "䷒", judgement: "Earth overlooking Lake, rising influence. Authority nears its zenith; nurture with generous oversight, for what approaches with integrity brings great fortune." },
    "000011": { num: 20, name: "Guan (觀) — Contemplation", symbol: "䷓", judgement: "Wind moving over Earth, a watchful vantage. Still observation reveals hidden currents; the sage who studies before acting perceives the true shape of destiny." },
    "100101": { num: 21, name: "Shi He (噬嗑) — Biting Through", symbol: "䷔", judgement: "Fire and Thunder combined, obstruction bitten through. Firm decisive judgment, like teeth closing on obstruction, dissolves what blocks union — apply the law without hesitation." },
    "101001": { num: 22, name: "Bi (賁) — Grace", symbol: "䷕", judgement: "Fire glowing beneath Mountain, radiant embellishment. Beauty and form refine the essential; adorn with elegance, yet remember substance must precede ornament." },
    "000001": { num: 23, name: "Bo (剝) — Splitting Apart", symbol: "䷖", judgement: "Mountain resting upon Earth, slow erosion. Decline advances by inches; the wise do not resist collapse directly, but withdraw and await the turning tide." },
    "100000": { num: 24, name: "Fu (復) — Return", symbol: "䷗", judgement: "Thunder stirring beneath Earth, the solstice point. The single yang line returns; after the depth of winter, renewal quickens — retreat, rest, then re-emerge." },
    "100111": { num: 25, name: "Wu Wang (无妄) — Innocence", symbol: "䷘", judgement: "Heaven moving above Thunder, spontaneous integrity. Acting without ulterior calculation invites heaven's own accord; contrived ambition invites misfortune where pure intention would prosper." },
    "111001": { num: 26, name: "Da Xu (大畜) — Great Taming", symbol: "䷙", judgement: "Heaven contained by Mountain, vast restrained potential. Discipline accumulates immense latent power; nourish inner strength before its grand release." },
    "100001": { num: 27, name: "Yi (頤) — Nourishment", symbol: "䷚", judgement: "Mountain over Thunder, the open jaw. Attend to what you feed body, mind, and word; provide for others as you would be nourished yourself." },
    "011110": { num: 28, name: "Da Guo (大過) — Great Exceeding", symbol: "䷛", judgement: "Lake submerging Wind, the ridgepole sagging. Extraordinary pressure bends the central beam near breaking; extraordinary times call for solitary, resolute action." },
    "010010": { num: 29, name: "Kan (坎) — The Abysmal", symbol: "䷜", judgement: "Water repeated, danger upon danger. Flow like water through the chasm's peril: sincerity and constant movement carry the sage safely through repeated trial." },
    "101101": { num: 30, name: "Li (離) — The Clinging", symbol: "䷝", judgement: "Fire doubled, radiant dependency. Brightness clings to what sustains it; cultivate luminous clarity and devoted attachment to what is genuinely worthy." },
    "001110": { num: 31, name: "Xian (咸) — Influence", symbol: "䷞", judgement: "Lake resting upon Mountain, mutual attraction. Sincere, spontaneous resonance between hearts precedes formal union; let feeling arise before force asserts itself." },
    "011100": { num: 32, name: "Heng (恆) — Duration", symbol: "䷟", judgement: "Thunder moving above Wind, constant motion. Enduring relationships and paths are sustained not by rigidity but by rhythmic, adaptable constancy through change." },
    "001111": { num: 33, name: "Dun (遯) — Retreat", symbol: "䷠", judgement: "Heaven withdrawing above Mountain. When lesser forces ascend, the superior person retreats with dignified timing, preserving strength rather than exhausting it in vain resistance." },
    "111100": { num: 34, name: "Da Zhuang (大壯) — Great Power", symbol: "䷡", judgement: "Thunder above Heaven, forceful ascent. Great strength must be tempered by propriety; power without restraint shatters against the very obstacles it seeks to overcome." },
    "000101": { num: 35, name: "Jin (晉) — Progress", symbol: "䷢", judgement: "Fire rising over Earth, dawn advancing. Like the sun ascending over the plain, virtuous advancement is recognized and rewarded by those above." },
    "101000": { num: 36, name: "Ming Yi (明夷) — Darkening of the Light", symbol: "䷣", judgement: "Fire buried within Earth. Brilliance obscured by adversity calls for inner steadfastness; conceal true light until the shadow of oppression passes." },
    "101011": { num: 37, name: "Jia Ren (家人) — The Family", symbol: "䷤", judgement: "Wind kindled by Fire, domestic order. Correct roles rightly held within the hearth radiate outward; the well-ordered household is the seed of the well-ordered world." },
    "110101": { num: 38, name: "Kui (睽) — Opposition", symbol: "䷥", judgement: "Fire and Lake, diverging polarities. Estrangement in small matters need not prevent eventual union; seek common ground even amid apparent contradiction." },
    "001010": { num: 39, name: "Jian (蹇) — Obstruction", symbol: "䷦", judgement: "Water above Mountain, the difficult pass. Obstacles bar the direct path; pause, gather wise counsel, and seek the indirect route toward eventual crossing." },
    "010100": { num: 40, name: "Jie (解) — Deliverance", symbol: "䷧", judgement: "Thunder freeing above Water, storm clearing. Tension dissolves like ice at spring's first thunder; forgive swiftly and act to release what has long bound you." },
    "110001": { num: 41, name: "Sun (損) — Decrease", symbol: "䷨", judgement: "Mountain above Lake, sincere sacrifice. What is diminished below may enrich what is above; sincere simplicity and restraint transform loss into hidden gain." },
    "100011": { num: 42, name: "Yi (益) — Increase", symbol: "䷩", judgement: "Wind and Thunder combined, mutual reinforcement. Generosity flowing downward from above multiplies benefit for all; the moment favors bold, beneficial undertakings." },
    "111110": { num: 43, name: "Guai (夬) — Breakthrough", symbol: "䷪", judgement: "Lake rising to Heaven's height, resolute decree. One last obstruction remains; announce your resolve openly and decisively, though firmness must be paired with fairness." },
    "011111": { num: 44, name: "Gou (姤) — Coming to Meet", symbol: "䷫", judgement: "Heaven beneath Wind, unforeseen encounter. A potent influence arises from below; approach beguiling coincidences with clear-eyed discernment rather than impulsive embrace." },
    "000110": { num: 45, name: "Cui (萃) — Gathering", symbol: "䷬", judgement: "Lake collecting above Earth, congregation. Multitudes gather beneath rightful authority; make ready great offerings, for unified purpose amplifies collective fortune." },
    "011000": { num: 46, name: "Sheng (升) — Pushing Upward", symbol: "䷭", judgement: "Wind rooted in Earth, gradual ascent. Like a tree growing from the soil, sustained effort without haste carries steady advancement toward the summit." },
    "010110": { num: 47, name: "Kun (困) — Oppression", symbol: "䷮", judgement: "Lake drained beneath Water, exhaustion. Though resources and words fail to persuade, the resolute heart's quiet integrity outlasts the season of confinement." },
    "011010": { num: 48, name: "Jing (井) — The Well", symbol: "䷯", judgement: "Water drawn up through Wind, communal source. The well nourishes all who come, unchanged by dynasty; renew what has grown stagnant and share its depths freely." },
    "101110": { num: 49, name: "Ge (革) — Revolution", symbol: "䷰", judgement: "Lake extinguishing Fire, transformative molting. Old forms must be shed once their season passes; revolution enacted with sincerity and proper timing wins the people's trust." },
    "011101": { num: 50, name: "Ding (鼎) — The Cauldron", symbol: "䷱", judgement: "Wind feeding Fire, the sacred vessel. Transformation refines raw substance into nourishment; the cauldron stands firm, uniting talents to sustain the greater community." },
    "100100": { num: 51, name: "Zhen (震) — The Arousing", symbol: "䷲", judgement: "Thunder redoubled, shock and awakening. Startling upheaval tests composure; the steady heart trembles yet does not lose the sacrificial spoon, and emerges wiser." },
    "001001": { num: 52, name: "Gen (艮) — Keeping Still", symbol: "䷳", judgement: "Mountain doubled, immovable stillness. True stillness arises when the back is turned even to one's own desires; in silence untouched by longing, clarity is restored." },
    "001011": { num: 53, name: "Jian (漸) — Development", symbol: "䷴", judgement: "Wind rooted above Mountain, gradual infiltration. Like the wild goose advancing by stages toward the shore, patient, proper progression secures a lasting union." },
    "110100": { num: 54, name: "Gui Mei (歸妹) — The Marrying Maiden", symbol: "䷵", judgement: "Thunder above Lake, subordinate union. Entering a bond from a position lacking full standing demands especial care and restraint to avoid eventual regret." },
    "101100": { num: 55, name: "Feng (豐) — Abundance", symbol: "䷶", judgement: "Thunder blazing above Fire, zenith fullness. At the sun's height shadows still fall; abundance achieved must be wielded with clarity before its inevitable waning." },
    "001101": { num: 56, name: "Lu (旅) — The Wanderer", symbol: "䷷", judgement: "Fire atop Mountain, the traveler's path. Away from home, small matters bring fortune through caution and modesty; the wanderer prospers by adaptability, not conquest." },
    "011011": { num: 57, name: "Xun (巽) — The Gentle", symbol: "䷸", judgement: "Wind doubled, penetrating persistence. Gentle, persistent influence, like wind through every crevice, achieves what force cannot; small steady steps yield great sway." },
    "110110": { num: 58, name: "Dui (兌) — The Joyous", symbol: "䷹", judgement: "Lake doubled, mirrored delight. Shared joy multiplies when sincere; open, joyous exchange between hearts, tempered by firm inner integrity, brings mutual encouragement." },
    "010011": { num: 59, name: "Huan (渙) — Dispersion", symbol: "䷺", judgement: "Wind scattering over Water, dissolving separation. Estrangement and fragmentation are dispersed through selfless unifying ritual; gather the scattered by dissolving rigid self-interest." },
    "110010": { num: 60, name: "Jie (節) — Limitation", symbol: "䷻", judgement: "Water contained by Lake, disciplined measure. Boundaries wisely set, like the joints of bamboo, allow sustainable flow; excessive restriction, like excessive freedom, brings hardship." },
    "110011": { num: 61, name: "Zhong Fu (中孚) — Inner Truth", symbol: "䷼", judgement: "Wind moving over Lake, sincere resonance. Inner sincerity moves even the unseen — like a crane's call answered by its unseen mate — trust unlocks great crossings." },
    "001100": { num: 62, name: "Xiao Guo (小過) — Small Exceeding", symbol: "䷽", judgement: "Thunder above Mountain, cautious deviation. Modest, careful attention to small matters succeeds where grand ambition falters; the flying bird should not soar too high." },
    "101010": { num: 63, name: "Ji Ji (既濟) — After Completion", symbol: "䷾", judgement: "Water above Fire, poised equilibrium. Order achieved is inherently fragile; the wise remain vigilant at the moment of success, lest careful balance dissolve into disorder." },
    "010101": { num: 64, name: "Wei Ji (未濟) — Before Completion", symbol: "䷿", judgement: "Fire above Water, threshold unmet. The great work approaches its final crossing yet remains unfinished; caution at the threshold ensures the fox's tail stays dry." }
  },

  // Perform authentic 3-coin toss calculation
  tossSingleLine() {
    // 3 Coins: Heads = 3, Tails = 2
    // Outcomes: 
    // 2+2+2 = 6 (Old Yin, Changing: ⚋ -> ⚊)
    // 2+2+3 = 7 (Young Yang, Stable: ⚊)
    // 2+3+3 = 8 (Young Yin, Stable: ⚋)
    // 3+3+3 = 9 (Old Yang, Changing: ⚊ -> ⚋)
    const c1 = Math.random() > 0.5 ? 3 : 2;
    const c2 = Math.random() > 0.5 ? 3 : 2;
    const c3 = Math.random() > 0.5 ? 3 : 2;
    const sum = c1 + c2 + c3;

    return {
      sum,
      coins: [c1, c2, c3],
      isYang: sum === 7 || sum === 9,
      isChanging: sum === 6 || sum === 9,
      name: sum === 9 ? "Old Yang (Changing ⚊ ➜ ⚋)" :
            sum === 7 ? "Young Yang (Stable ⚊)" :
            sum === 8 ? "Young Yin (Stable ⚋)" :
            "Old Yin (Changing ⚋ ➜ ⚊)"
    };
  },

  generateCompleteHexagram() {
    const lines = [];
    for (let i = 0; i < 6; i++) {
      lines.push(this.tossSingleLine());
    }

    // Binary key from bottom (Line 1) to top (Line 6)
    const primaryKey = lines.map(l => l.isYang ? '1' : '0').join('');
    
    // Resultant/Transformed hexagram if changing lines exist
    const transformedKey = lines.map(l => {
      if (l.sum === 9) return '0'; // Old Yang changes to Yin
      if (l.sum === 6) return '1'; // Old Yin changes to Yang
      return l.isYang ? '1' : '0';
    }).join('');

    const primaryHex = this.HEXAGRAM_DATABASE[primaryKey] || {
      num: 1,
      name: "Hexagram Matrix Synchronized",
      symbol: "䷀",
      judgement: "Cosmic balance active. Persevere in harmony with the cyclical tides."
    };

    const transformedHex = this.HEXAGRAM_DATABASE[transformedKey] || primaryHex;
    const changingCount = lines.filter(l => l.isChanging).length;

    return {
      lines,
      primaryKey,
      transformedKey,
      primaryHex,
      transformedHex,
      hasChanges: changingCount > 0,
      changingCount
    };
  },

  // --- COMPLETE NATAL JSON PAYLOAD BUILDER ---
  generateNatalPayload(profile) {
    const {
      name = "Seeker",
      gender = "Female / Yin",
      birthDate = "1998-08-16",
      birthTime = "11:45:00",
      birthCity = "Kyoto, Japan",
      latitude = 35.0116,
      longitude = 135.7681,
      timezoneOffsetHours = 9,
      useTrueSolarTime = true
    } = profile;

    // 1. TST Telemetry
    const tst = this.calculateTrueSolarTime(birthDate, birthTime, longitude, timezoneOffsetHours);

    // 2. BaZi Calculation
    const bazi = this.calculateBaZi(birthDate, birthTime, longitude, timezoneOffsetHours, useTrueSolarTime);

    // 3. Western Astrology Ephemeris
    const astrology = this.calculateWesternAstrology(birthDate, birthTime, latitude, longitude, timezoneOffsetHours);

    // 4. Daily I Ching Hexagram
    const iching = this.generateCompleteHexagram();

    const payload = {
      version: "2.0.0",
      generatedAt: new Date().toISOString(),
      profile: {
        name,
        gender,
        birthDate,
        birthTime,
        birthCity,
        latitude,
        longitude,
        timezoneOffsetHours,
        useTrueSolarTime
      },
      telemetry: {
        dayOfYear: tst.dayOfYear,
        eotMinutes: tst.eotMinutes.toFixed(2),
        lonOffsetMinutes: tst.lonOffsetMinutes.toFixed(2),
        totalDeltaMinutes: tst.totalDeltaMinutes.toFixed(2),
        standardTime: birthTime,
        trueSolarTime: tst.tstFormattedTime,
        trueSolar12Hour: tst.tst12Hour
      },
      bazi,
      astrology,
      iching,
      summaryHeader: {
        name,
        sunSignText: `Sun: ${astrology.sun.glyph} ${astrology.sun.signName}`,
        baziDayText: `BaZi: ${bazi.dayBranchResonance} Day (${bazi.dayMaster.char})`,
        tstClockText: `True Solar Time: ${tst.tst12Hour}`
      }
    };

    // Save to LocalStorage
    try {
      localStorage.setItem('aetheria_natal_payload', JSON.stringify(payload));
      localStorage.setItem('aetheria_profile', JSON.stringify(payload.profile));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    return payload;
  },

  // City preset helper for quick coordinates lookup
  CITY_PRESETS: [
    { city: "Kyoto, Japan", lat: 35.0116, lon: 135.7681, tz: 9 },
    { city: "Tokyo, Japan", lat: 35.6762, lon: 139.6503, tz: 9 },
    { city: "Beijing, China", lat: 39.9042, lon: 116.4074, tz: 8 },
    { city: "Shanghai, China", lat: 31.2304, lon: 121.4737, tz: 8 },
    { city: "Hong Kong", lat: 22.3193, lon: 114.1694, tz: 8 },
    { city: "Taipei, Taiwan", lat: 25.0330, lon: 121.5654, tz: 8 },
    { city: "Seoul, South Korea", lat: 37.5665, lon: 126.9780, tz: 9 },
    { city: "Singapore", lat: 1.3521, lon: 103.8198, tz: 8 },
    { city: "Bangkok, Thailand", lat: 13.7563, lon: 100.5018, tz: 7 },
    { city: "London, United Kingdom", lat: 51.5074, lon: -0.1278, tz: 0 },
    { city: "Paris, France", lat: 48.8566, lon: 2.3522, tz: 1 },
    { city: "Rome, Italy", lat: 41.9028, lon: 12.4964, tz: 1 },
    { city: "Athens, Greece", lat: 37.9838, lon: 23.7275, tz: 2 },
    { city: "Cairo, Egypt", lat: 30.0444, lon: 31.2357, tz: 2 },
    { city: "New York, USA", lat: 40.7128, lon: -74.0060, tz: -5 },
    { city: "Los Angeles, USA", lat: 34.0522, lon: -118.2437, tz: -8 },
    { city: "San Francisco, USA", lat: 37.7749, lon: -122.4194, tz: -8 },
    { city: "Sydney, Australia", lat: -33.8688, lon: 151.2093, tz: 10 }
  ]
};

if (typeof window !== 'undefined') {
  window.CalcEngine = CalcEngine;
}
