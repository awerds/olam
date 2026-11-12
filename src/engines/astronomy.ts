import * as Astronomy from 'astronomy-engine';
import {
  CLASSICAL_PLANETS,
  MAZALOT,
  SHEM_HAMEPHORASH_72,
  type ClassicalPlanetInfo,
  type MazalInfo,
  type PlanetKey,
} from '../data/kabbalah';

export interface PlanetEphemeris {
  info: ClassicalPlanetInfo;
  longitude: number; // 0..360 geocentric ecliptic
  latitude: number;
  distanceAU: number;
  isRetrograde: boolean;
  dailyMotionDeg: number;
  mazal: MazalInfo;
  degreeInMazal: number;
  shem72: (typeof SHEM_HAMEPHORASH_72)[number];
  position3D: [number, number, number]; // Geocentric Hermetic sphere position
}

export interface PlanetaryAspect {
  planetA: PlanetKey;
  planetB: PlanetKey;
  type: 'Conjunction (Chibbur)' | 'Opposition (Lenekhed)' | 'Trine (Meshulash)' | 'Square (Meruba)' | 'Sextile (Meshusheh)';
  hebrewName: string;
  angle: number;
  orb: number;
  harmony: 'harmonic' | 'tense' | 'union';
}

export interface TeliNodes {
  roshLongitude: number; // North Node (Head of the Dragon - Rosh HaTeli)
  zanavLongitude: number; // South Node (Tail of the Dragon - Zanav HaTeli)
  roshMazal: MazalInfo;
  zanavMazal: MazalInfo;
}

export interface LunarState {
  phaseAngle: number; // 0..360 (0 = New, 180 = Full)
  illumination: number; // 0..1
  ageDays: number; // 0..29.53
  phaseNameHeb: string;
  phaseNameTranslit: string;
  phaseNameEn: string;
  zoharicState: string;
  isKiddushLevanahWindow: boolean; // 3 days to 14d18h after conjunction
  nextNewMoon: Date;
  nextFullMoon: Date;
  nextLunarEclipse: { date: Date; kind: string };
}

export interface CosmicSnapshot {
  date: Date;
  planets: Record<PlanetKey, PlanetEphemeris>;
  planetList: PlanetEphemeris[];
  lunar: LunarState;
  teli: TeliNodes;
  aspects: PlanetaryAspect[];
}

function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function getBodyEnum(key: PlanetKey): Astronomy.Body {
  switch (key) {
    case 'Saturn':
      return Astronomy.Body.Saturn;
    case 'Jupiter':
      return Astronomy.Body.Jupiter;
    case 'Mars':
      return Astronomy.Body.Mars;
    case 'Sun':
      return Astronomy.Body.Sun;
    case 'Venus':
      return Astronomy.Body.Venus;
    case 'Mercury':
      return Astronomy.Body.Mercury;
    case 'Moon':
      return Astronomy.Body.Moon;
  }
}

/**
 * Computes geocentric ecliptic longitude & latitude of any classical planet at Date.
 */
export function getGeocentricEcliptic(body: Astronomy.Body, date: Date): {
  lon: number;
  lat: number;
  dist: number;
} {
  const vec = Astronomy.GeoVector(body, date, true);
  const ecl = Astronomy.Ecliptic(vec);
  return {
    lon: normalizeDeg(ecl.elon),
    lat: ecl.elat,
    dist: vec.Length(),
  };
}

/**
 * Computes the Mean Ascending Lunar Node (Rosh HaTeli - Head of the Dragon in Sefer Yetzirah 6:1)
 */
export function computeTeliNodes(date: Date): TeliNodes {
  // Julian centuries from J2000.0
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525.0;
  // Meeus formula for Mean Longitude of Ascending Node
  const omega = normalizeDeg(
    125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000
  );
  const zanav = normalizeDeg(omega + 180);
  return {
    roshLongitude: omega,
    zanavLongitude: zanav,
    roshMazal: MAZALOT[Math.floor(omega / 30) % 12],
    zanavMazal: MAZALOT[Math.floor(zanav / 30) % 12],
  };
}

export function computeCosmicSnapshot(date: Date): CosmicSnapshot {
  const dtMinus = new Date(date.getTime() - 6 * 3600 * 1000);
  const dtPlus = new Date(date.getTime() + 6 * 3600 * 1000);

  const planetsMap = {} as Record<PlanetKey, PlanetEphemeris>;
  const planetList: PlanetEphemeris[] = [];

  for (const info of CLASSICAL_PLANETS) {
    const body = getBodyEnum(info.key);
    const nowEcl = getGeocentricEcliptic(body, date);
    const prevEcl = getGeocentricEcliptic(body, dtMinus);
    const nextEcl = getGeocentricEcliptic(body, dtPlus);

    let diff = nextEcl.lon - prevEcl.lon;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const dailyMotionDeg = diff * 2; // 12h span * 2 = 24h motion
    const isRetrograde =
      info.key !== 'Sun' && info.key !== 'Moon' && dailyMotionDeg < 0;

    const mazalIdx = Math.floor(nowEcl.lon / 30) % 12;
    const mazal = MAZALOT[mazalIdx];
    const degreeInMazal = nowEcl.lon % 30;
    const shemIdx = Math.floor(nowEcl.lon / 5) % 72;
    const shem72 = SHEM_HAMEPHORASH_72[shemIdx];

    const rad = (nowEcl.lon * Math.PI) / 180;
    const latRad = (nowEcl.lat * Math.PI) / 180;
    const r = info.orbitRadius3D;
    const x = r * Math.cos(rad) * Math.cos(latRad);
    const z = -r * Math.sin(rad) * Math.cos(latRad);
    const y = r * Math.sin(latRad) * 2.2;

    const eph: PlanetEphemeris = {
      info,
      longitude: nowEcl.lon,
      latitude: nowEcl.lat,
      distanceAU: nowEcl.dist,
      isRetrograde,
      dailyMotionDeg,
      mazal,
      degreeInMazal,
      shem72,
      position3D: [x, y, z],
    };

    planetsMap[info.key] = eph;
    planetList.push(eph);
  }

  // Lunar Phase & Zoharic state
  const phaseAngle = Astronomy.MoonPhase(date); // 0..360
  const illumInfo = Astronomy.Illumination(Astronomy.Body.Moon, date);
  const synodicMonth = 29.530588853;
  const ageDays = (phaseAngle / 360) * synodicMonth;

  let phaseNameHeb = 'מוֹלָד הַלְּבָנָה';
  let phaseNameTranslit = 'Molad HaLevanah';
  let phaseNameEn = 'New Moon / Birth of the Vessel';
  let zoharicState =
    'Mi’ut HaLevanah (Concealment): Malkhut stands at the threshold of renewal, awaiting fresh influx from Keter through Yesod.';

  if (phaseAngle < 15 || phaseAngle >= 345) {
    phaseNameHeb = 'מוֹלָד הַחֹדֶשׁ';
    phaseNameTranslit = 'Molad / Rosh Chodesh';
    phaseNameEn = 'New Moon (Seed of Renewal)';
    zoharicState =
      'Point of Conception: The Lunar vessel (Nukva/Malkhut) resets in humility to receive a new monthly garment of solar light.';
  } else if (phaseAngle < 75) {
    phaseNameHeb = 'סַהַר הַמִּתְחַדֵּשׁ';
    phaseNameTranslit = 'Sahar HaMitchadesh';
    phaseNameEn = 'Waxing Crescent';
    zoharicState =
      'Awakening from Below (Itaruta d’Letata): The first visible crescent opens the gate of Kiddush Levanah (Sanctification of the Moon).';
  } else if (phaseAngle < 105) {
    phaseNameHeb = 'חֲצִי הַלְּבָנָה (ימין)';
    phaseNameTranslit = 'Chatzi HaLevanah';
    phaseNameEn = 'First Quarter (Pillar of Chesed)';
    zoharicState =
      'Right-Side Illumination: Solar Tiferet fills the right hemisphere of the Lunar vessel with expansive Chesed.';
  } else if (phaseAngle < 165) {
    phaseNameHeb = 'גִּדּוּל הַלְּבָנָה';
    phaseNameTranslit = 'Giddul HaLevanah';
    phaseNameEn = 'Waxing Gibbous';
    zoharicState =
      'Approaching Perfection (Ashlag / Zohar): The 14 steps of ascent toward the throne of Solomon are nearly complete.';
  } else if (phaseAngle < 195) {
    phaseNameHeb = 'מִלּוּי הַלְּבָנָה (פָּנִים בְּפָנִים)';
    phaseNameTranslit = 'Milui HaLevanah — Panim be-Panim';
    phaseNameEn = 'Full Moon (15th of the Month)';
    zoharicState =
      'Zivug Panim-be-Panim (Face-to-Face Union): On the 15th night, Tiferet (Sun) and Malkhut (Moon) stand in direct unimpeded union ("The Moon shines as the Sun").';
  } else if (phaseAngle < 255) {
    phaseNameHeb = 'גְּרִיעַת הַלְּבָנָה';
    phaseNameTranslit = 'Geri’at HaLevanah';
    phaseNameEn = 'Waning Gibbous';
    zoharicState =
      'Internalization of Light: Having received full illumination on the 15th, the vessel begins distilling light inward into earthly vessels.';
  } else if (phaseAngle < 285) {
    phaseNameHeb = 'חֲצִי הַלְּבָנָה (שמאל)';
    phaseNameTranslit = 'Chatzi HaLevanah (Gevurah)';
    phaseNameEn = 'Third Quarter (Pillar of Gevurah)';
    zoharicState =
      'Left-Side Refinement: Discernment and boundary (Gevurah) temper the remaining lunar light.';
  } else {
    phaseNameHeb = 'מִעוּט הַלְּבָנָה';
    phaseNameTranslit = "Mi'ut HaLevanah";
    phaseNameEn = 'Waning Crescent (Yom Kippur Katan)';
    zoharicState =
      'Teshuvah of the Moon: The final narrowing before the Molad, traditionally observed on the 29th as Yom Kippur Katan (Minor Day of Atonement) to rectify the month’s root.';
  }

  const nextNew = Astronomy.SearchMoonPhase(0, date, 35);
  const nextFull = Astronomy.SearchMoonPhase(180, date, 35);
  const lunarEclipse = Astronomy.SearchLunarEclipse(date);

  const isKiddushLevanahWindow = ageDays >= 3.0 && ageDays <= 14.75;

  // Compute classical Ptolemaic/Kabbalistic aspects between planets
  const aspects: PlanetaryAspect[] = [];
  const aspectDefs: {
    angle: number;
    maxOrb: number;
    type: PlanetaryAspect['type'];
    hebrewName: string;
    harmony: PlanetaryAspect['harmony'];
  }[] = [
    {
      angle: 0,
      maxOrb: 7,
      type: 'Conjunction (Chibbur)',
      hebrewName: 'חִבּוּר (יִחוּד)',
      harmony: 'union',
    },
    {
      angle: 180,
      maxOrb: 7,
      type: 'Opposition (Lenekhed)',
      hebrewName: 'נִגּוּד (פָּנִים בְּפָנִים)',
      harmony: 'tense',
    },
    {
      angle: 120,
      maxOrb: 6,
      type: 'Trine (Meshulash)',
      hebrewName: 'מַבָּט מְשֻׁלָּשׁ (חֶסֶד)',
      harmony: 'harmonic',
    },
    {
      angle: 90,
      maxOrb: 6,
      type: 'Square (Meruba)',
      hebrewName: 'מַבָּט מְרֻבָּע (דִּין)',
      harmony: 'tense',
    },
    {
      angle: 60,
      maxOrb: 5,
      type: 'Sextile (Meshusheh)',
      hebrewName: 'מַבָּט מְשֻׁשֶּׁה',
      harmony: 'harmonic',
    },
  ];

  for (let i = 0; i < planetList.length; i++) {
    for (let j = i + 1; j < planetList.length; j++) {
      const pA = planetList[i];
      const pB = planetList[j];
      let sep = Math.abs(pA.longitude - pB.longitude);
      if (sep > 180) sep = 360 - sep;
      for (const def of aspectDefs) {
        const orb = Math.abs(sep - def.angle);
        if (orb <= def.maxOrb) {
          aspects.push({
            planetA: pA.info.key,
            planetB: pB.info.key,
            type: def.type,
            hebrewName: def.hebrewName,
            angle: Math.round(sep * 10) / 10,
            orb: Math.round(orb * 10) / 10,
            harmony: def.harmony,
          });
          break;
        }
      }
    }
  }

  return {
    date,
    planets: planetsMap,
    planetList,
    lunar: {
      phaseAngle,
      illumination: illumInfo.phase_fraction,
      ageDays,
      phaseNameHeb,
      phaseNameTranslit,
      phaseNameEn,
      zoharicState,
      isKiddushLevanahWindow,
      nextNewMoon: nextNew ? nextNew.date : date,
      nextFullMoon: nextFull ? nextFull.date : date,
      nextLunarEclipse: {
        date: lunarEclipse.peak.date,
        kind: lunarEclipse.kind,
      },
    },
    teli: computeTeliNodes(date),
    aspects,
  };
}

/**
 * Generates a 4D Time-Helix trajectory of Sun, Moon, and Eclipses/Rosh Chodesh portals
 * across a span of days centered on the active date.
 */
export interface HelixPoint {
  date: Date;
  offsetDays: number;
  sunPos: [number, number, number];
  moonPos: [number, number, number];
  isRoshChodesh: boolean;
  isFullMoon: boolean;
  hebrewLabel?: string;
}

export function generateTimeHelix(centerDate: Date, spanDays = 60): HelixPoint[] {
  const points: HelixPoint[] = [];
  const stepDays = 1;
  for (let d = -spanDays; d <= spanDays; d += stepDays) {
    const dt = new Date(centerDate.getTime() + d * 86400000);
    const sunEcl = getGeocentricEcliptic(Astronomy.Body.Sun, dt);
    const moonEcl = getGeocentricEcliptic(Astronomy.Body.Moon, dt);
    const phase = Astronomy.MoonPhase(dt);

    const z = d * 0.28; // Time axis along Z
    const sunRad = (sunEcl.lon * Math.PI) / 180;
    const moonRad = (moonEcl.lon * Math.PI) / 180;

    const sunR = 5.2;
    const moonR = 2.8;

    const isRoshChodesh = phase < 6 || phase > 354;
    const isFullMoon = Math.abs(phase - 180) < 6;

    points.push({
      date: dt,
      offsetDays: d,
      sunPos: [sunR * Math.cos(sunRad), sunR * Math.sin(sunRad), z],
      moonPos: [moonR * Math.cos(moonRad), moonR * Math.sin(moonRad), z],
      isRoshChodesh,
      isFullMoon,
    });
  }
  return points;
}

