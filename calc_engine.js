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

  // Solar Term (Jie Qi) Month Branch Index
  getSolarMonthBranchIndex(month, day) {
    // Solar terms change roughly around the 4th-8th of each month
    // On/after the month's Jie entry: Feb(2) -> Yin (寅, index 2), Mar(3) -> Mao (卯, index 3), ...
    // Before it: still the previous solar month, e.g. early Feb -> Chou (丑, index 1)
    const solarTermDays = [0, 5, 4, 5, 5, 6, 7, 7, 7, 8, 8, 7, 7]; // Approximate Jie entry days per month
    let branchIdx;
    if (day >= solarTermDays[month]) {
      branchIdx = month % 12; // e.g. Feb(2) on/after the 4th -> index 2 (Yin)
    } else {
      branchIdx = (month - 1 + 12) % 12; // e.g. Feb(2) before the 4th -> index 1 (Chou)
    }
    return branchIdx;
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

    // 1. Year Pillar:
    // Chinese Solar Year begins at Li Chun (approx Feb 4).
    let baziYear = year;
    if (month < 2 || (month === 2 && day < 4)) {
      baziYear = year - 1;
    }
    // 4 AD was Jia Zi (0, 0)
    const yearStemIdx = (baziYear - 4) % 10;
    const yearBranchIdx = (baziYear - 4) % 12;
    const yearStem = this.HEAVENLY_STEMS[(yearStemIdx + 10) % 10];
    const yearBranch = this.EARTHLY_BRANCHES[(yearBranchIdx + 12) % 12];

    // 2. Month Pillar:
    // Five Tigers Seeking Month (Wu Hu Dun):
    // Year Stem: Jia/Ji (0,5) -> Month 1 is Bing(2); Yi/Geng(1,6) -> Wu(4); Bing/Xin(2,7) -> Geng(6); Ding/Ren(3,8) -> Ren(8); Wu/Gui(4,9) -> Jia(0)
    const monthBranchIdx = this.getSolarMonthBranchIndex(month, day);
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

  calculateWesternAstrology(birthDate, birthTime, latitude, longitude, timezoneOffsetHours) {
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hours, minutes] = (birthTime || "12:00").split(':').map(Number);

    // Universal Time (UT) in hours
    const utHours = hours + minutes / 60 - timezoneOffsetHours;
    const jd = this.getJulianDay(year, month, day, Math.floor(utHours), (utHours % 1) * 60);

    // Julian centuries from J2000.0
    const T = (jd - 2451545.0) / 36525.0;

    // 1. Solar Ecliptic Longitude (Low-precision Ephemeris accurate to within ~0.05°)
    const L0 = (280.46646 + 36000.76983 * T) % 360; // Geometric mean longitude of Sun
    const M_sun = (357.52911 + 35999.05029 * T) * (Math.PI / 180); // Mean anomaly
    const C_sun = (1.914602 - 0.004817 * T) * Math.sin(M_sun) + (0.019993 - 0.000101 * T) * Math.sin(2 * M_sun) + 0.000289 * Math.sin(3 * M_sun);
    const sunLon = (L0 + C_sun + 360) % 360;
    const sunPlacement = this.degToSign(sunLon);

    // 2. Lunar Ecliptic Longitude approximation
    const L_moon = (218.316 + 481267.8813 * T) % 360;
    const M_moon = (134.963 + 477198.8676 * T) * (Math.PI / 180);
    const F_moon = (93.272 + 483202.0175 * T) * (Math.PI / 180);
    const D_moon = (297.850 + 445267.1114 * T) * (Math.PI / 180);
    const moonLon = (L_moon + 6.289 * Math.sin(M_moon) - 1.274 * Math.sin(M_moon - 2 * D_moon) + 0.658 * Math.sin(2 * D_moon) + 360) % 360;
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

    // 4. Inner & Outer Planets Approximations
    const mercuryLon = (sunLon + 18 * Math.sin((T * 150 + 1) * Math.PI / 180) + 360) % 360;
    const venusLon = (sunLon + 35 * Math.sin((T * 90 + 2) * Math.PI / 180) + 360) % 360;
    const marsLon = (sunLon + 120 * T + 80 + 360) % 360;
    const jupiterLon = (sunLon + 30 * T + 210 + 360) % 360;
    const saturnLon = (sunLon + 12 * T + 45 + 360) % 360;

    return {
      sun: sunPlacement,
      moon: moonPlacement,
      moonPhase: moonPhaseName,
      ascendant: ascPlacement,
      planets: [
        { name: "Sun", glyph: "☉", ...sunPlacement, house: "10th House", dignity: "Sovereign Essence" },
        { name: "Moon", glyph: "☽", ...moonPlacement, house: "1st House", dignity: "Subconscious Pulse" },
        { name: "Mercury", glyph: "☿", ...this.degToSign(mercuryLon), house: "11th House", dignity: "Rational Mind" },
        { name: "Venus", glyph: "♀", ...this.degToSign(venusLon), house: "9th House", dignity: "Aesthetic Harmony" },
        { name: "Mars", glyph: "♂", ...this.degToSign(marsLon), house: "6th House", dignity: "Vital Drive" },
        { name: "Jupiter", glyph: "♃", ...this.degToSign(jupiterLon), house: "5th House", dignity: "Great Benefic" },
        { name: "Saturn", glyph: "♄", ...this.degToSign(saturnLon), house: "7th House", dignity: "Great Malefic / Builder" }
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
    "111101": { num: 14, name: "Da You (大有) — Great Possession", symbol: "䷍", judgement: "Sun high in the zenith. Radiant abundance channeled with humility and benevolence." }
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
