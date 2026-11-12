import { HDate, HebrewCalendar, gematriya, Sedra } from '@hebcal/core';
import { Temporal as PolyfillTemporal } from 'temporal-polyfill';
import {
  CLASSICAL_PLANETS,
  MAZALOT,
  SEFER_YETZIRAH_LETTERS,
  SEFIROT,
  SHEM_HAMEPHORASH_72,
  type ClassicalPlanetInfo,
  type MazalInfo,
  type SefirahData,
  type SeferYetzirahLetter,
} from '../data/kabbalah';

// Ensure Temporal is available per support-global-calendar-systems guide
const TemporalAPI: typeof PolyfillTemporal =
  (globalThis as unknown as { Temporal?: typeof PolyfillTemporal }).Temporal ??
  PolyfillTemporal;

export interface PlanetaryHourSlot {
  hourNumber: number; // 1..12
  period: 'Day (Yom)' | 'Night (Laylah)';
  planet: ClassicalPlanetInfo;
  startTime: Date;
  endTime: Date;
  isCurrent: boolean;
}

export interface MoladDetails {
  dayOfWeekHeb: string;
  dayOfWeekEn: string;
  hours: number;
  minutes: number;
  chalakim: number; // 0..17 (1 chelek = 3.33s)
  totalChalakimInHour: number; // 0..1079
  summaryString: string;
}

export interface OmerCountState {
  active: boolean;
  day: number; // 1..49
  week: number; // 1..7
  dayInWeek: number; // 1..7
  innerSefirah: SefirahData;
  outerSefirah: SefirahData;
  hebrewFormula: string;
  translitFormula: string;
}

export interface HebrewMysticalTime {
  gregorianDate: Date;
  hebrewYear: number;
  hebrewYearGematria: string;
  hebrewMonthName: string;
  hebrewMonthCode: string; // Stable Temporal monthCode (M01..M12, M05L)
  monthsInYear: number;
  daysInMonth: number;
  hebrewDay: number;
  hebrewDayGematria: string;
  fullHebrewString: string;
  localizedHebrewDisplay: string;
  timelineRelativeToToday: 'Past' | 'Today' | 'Future';
  isLeapYear: boolean; // Shanah Me'uberet
  metonicCycleYear: number; // 1..19 in Machzor Katan
  shmitaCycleYear: number; // 1..7 (7 = Shmita Sabbatical Year)
  isShmitaYear: boolean;
  yovelYear: number; // 1..50
  cosmicMillennium: {
    millenniumNumber: number; // 6th Millennium
    yearInMillennium: number; // e.g. 787
    cosmicDaySefirah: SefirahData; // Yesod (6th day / Friday)
    cosmicHourDescription: string;
  };
  activeMonthMazal: MazalInfo;
  activeSimpleLetter: SeferYetzirahLetter;
  parashah: string;
  holidays: string[];
  molad: MoladDetails;
  omer: OmerCountState | null;
  tekufah: {
    nameHeb: string;
    nameTranslit: string;
    season: string;
    archangel: string;
    element: string;
    motherLetter: SeferYetzirahLetter;
  };
  planetaryHours: {
    current: PlanetaryHourSlot;
    dayRuler: ClassicalPlanetInfo;
    nightRuler: ClassicalPlanetInfo;
    all24: PlanetaryHourSlot[];
  };
  diurnalShem72: (typeof SHEM_HAMEPHORASH_72)[number];
}

function isCalendarSupported(calendarId: string): boolean {
  try {
    return Intl.supportedValuesOf('calendar').includes(calendarId);
  } catch {
    return false;
  }
}

/**
 * Computes traditional Jerusalem Molad (Mean Conjunction of Hillel II)
 * using the classical interval of 29d 12h 793 chalakim from Molad Beharad.
 */
function calculateTraditionalMolad(hdate: HDate): MoladDetails {
  const hy = hdate.getFullYear();
  const hm = hdate.getMonth(); // Nisan=1..Adar=12/13, Tishrei=7

  // Count elapsed months since Molad Beharad (Tishrei Year 1: Monday 5h 204ch)
  const completedYears = hy - 1;
  const cycles = Math.floor(completedYears / 19);
  const remYears = completedYears % 19;

  const leapYearsInCycle = [3, 6, 8, 11, 14, 17, 19];
  let leapCount = 0;
  for (const ly of leapYearsInCycle) {
    if (remYears >= ly) leapCount++;
  }

  let monthsElapsed = cycles * 235 + remYears * 12 + leapCount;

  // Add months within the current Hebrew year starting from Tishrei (7)
  const isLeap = hdate.isLeapYear();
  const monthOrder = isLeap
    ? [7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4, 5, 6]
    : [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6];
  const idx = monthOrder.indexOf(hm);
  if (idx > 0) monthsElapsed += idx;

  // Molad Beharad: Day 2 (Monday), 5 hours, 204 chalakim (where 1 day = 24h, 1h = 1080 chalakim)
  const CHALAKIM_PER_HOUR = 1080;
  const CHALAKIM_PER_DAY = 24 * CHALAKIM_PER_HOUR; // 25920
  const CHALAKIM_PER_WEEK = 7 * CHALAKIM_PER_DAY; // 181440
  const BEHARAD_CHALAKIM = 2 * CHALAKIM_PER_DAY + 5 * CHALAKIM_PER_HOUR + 204;
  const MONTH_CHALAKIM = 29 * CHALAKIM_PER_DAY + 12 * CHALAKIM_PER_HOUR + 793;

  const total =
    (BEHARAD_CHALAKIM + monthsElapsed * MONTH_CHALAKIM) % CHALAKIM_PER_WEEK;
  const dayIndex = Math.floor(total / CHALAKIM_PER_DAY); // 0=Sat, 1=Sun, 2=Mon...
  const remDay = total % CHALAKIM_PER_DAY;
  const hoursFrom6PM = Math.floor(remDay / CHALAKIM_PER_HOUR);
  const totalChalakimInHour = remDay % CHALAKIM_PER_HOUR;
  const minutes = Math.floor(totalChalakimInHour / 18);
  const chalakim = totalChalakimInHour % 18;

  const daysEn = [
    'Shabbat (Sat)',
    'Yom Rishon (Sun)',
    'Yom Sheni (Mon)',
    'Yom Shlishi (Tue)',
    'Yom Revi’i (Wed)',
    'Yom Chamishi (Thu)',
    'Yom Shishi (Fri)',
  ];
  const daysHeb = ['שַׁבָּת', 'יוֹם א׳', 'יוֹם ב׳', 'יוֹם ג׳', 'יוֹם ד׳', 'יוֹם ה׳', 'יוֹם ו׳'];

  return {
    dayOfWeekHeb: daysHeb[dayIndex],
    dayOfWeekEn: daysEn[dayIndex],
    hours: hoursFrom6PM,
    minutes,
    chalakim,
    totalChalakimInHour,
    summaryString: `${daysEn[dayIndex]}, ${hoursFrom6PM}h ${minutes}m ${chalakim} chalakim`,
  };
}

/**
 * Computes Halachic Planetary Hours (Sha'ot Zmaniyot) using the Chaldean / Sefer Yetzirah sequence
 * (שצ״ם חנכ״ל: Saturn=0, Jupiter=1, Mars=2, Sun=3, Venus=4, Mercury=5, Moon=6)
 */
function calculatePlanetaryHours(date: Date, latitude = 31.778): {
  current: PlanetaryHourSlot;
  dayRuler: ClassicalPlanetInfo;
  nightRuler: ClassicalPlanetInfo;
  all24: PlanetaryHourSlot[];
} {
  // Approximate sunrise & sunset around local/Jerusalem solar time based on day-of-year declination
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000) + 1;
  const decl = 23.44 * Math.sin(((2 * Math.PI) / 365) * (dayOfYear - 81));
  const latRad = (latitude * Math.PI) / 180;
  const declRad = (decl * Math.PI) / 180;
  const cosH = Math.max(-0.85, Math.min(0.85, -Math.tan(latRad) * Math.tan(declRad)));
  const halfDayHours = (Math.acos(cosH) * 180) / Math.PI / 15;

  const sunriseHourFloat = 12 - halfDayHours;
  const sunsetHourFloat = 12 + halfDayHours;

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const sunrise = new Date(dayStart.getTime() + sunriseHourFloat * 3600000);
  const sunset = new Date(dayStart.getTime() + sunsetHourFloat * 3600000);
  const nextSunrise = new Date(sunrise.getTime() + 86400000);
  const prevSunset = new Date(sunset.getTime() - 86400000);

  // Determine whether `date` is after prevSunset (before sunrise), during day, or after sunset
  let activeEveningStart = sunset;
  let activeMorningStart = sunrise;
  let activeDayEnd = sunset;
  let activeNightEnd = nextSunrise;
  let weekday = date.getDay(); // 0=Sun .. 6=Sat

  if (date < sunrise) {
    activeEveningStart = prevSunset;
    activeNightEnd = sunrise;
    activeMorningStart = sunrise;
    activeDayEnd = sunset;
  } else {
    activeEveningStart = prevSunset;
    activeNightEnd = sunrise;
    if (date >= sunset) {
      // In Jewish time, after sunset begins the next day's night hours!
      weekday = (weekday + 1) % 7;
      activeEveningStart = sunset;
      activeNightEnd = nextSunrise;
      activeMorningStart = nextSunrise;
      activeDayEnd = new Date(sunset.getTime() + 86400000);
    }
  }

  // First hour of Day (Sunrise) ruler by weekday (0=Sun..6=Sat):
  // Sun=Sun(3), Mon=Moon(6), Tue=Mars(2), Wed=Mercury(5), Thu=Jupiter(1), Fri=Venus(4), Sat=Saturn(0)
  const dayFirstRulerIndexByWeekday = [3, 6, 2, 5, 1, 4, 0];
  const dayFirstIdx = dayFirstRulerIndexByWeekday[weekday];
  // Night precedes Day in the Hebrew calendar (12 hours before sunrise = (dayFirstIdx - 12) mod 7)
  const nightFirstIdx = ((dayFirstIdx - 12) % 7 + 7) % 7;

  const all24: PlanetaryHourSlot[] = [];
  const nightDurationMs = (activeNightEnd.getTime() - activeEveningStart.getTime()) / 12;
  const dayDurationMs = (activeDayEnd.getTime() - activeMorningStart.getTime()) / 12;

  for (let i = 0; i < 12; i++) {
    const start = new Date(activeEveningStart.getTime() + i * nightDurationMs);
    const end = new Date(start.getTime() + nightDurationMs);
    const pIdx = (nightFirstIdx + i) % 7;
    const isCurrent = date >= start && date < end;
    all24.push({
      hourNumber: i + 1,
      period: 'Night (Laylah)',
      planet: CLASSICAL_PLANETS[pIdx],
      startTime: start,
      endTime: end,
      isCurrent,
    });
  }

  for (let i = 0; i < 12; i++) {
    const start = new Date(activeMorningStart.getTime() + i * dayDurationMs);
    const end = new Date(start.getTime() + dayDurationMs);
    const pIdx = (dayFirstIdx + i) % 7;
    const isCurrent = date >= start && date < end;
    all24.push({
      hourNumber: i + 1,
      period: 'Day (Yom)',
      planet: CLASSICAL_PLANETS[pIdx],
      startTime: start,
      endTime: end,
      isCurrent,
    });
  }

  const current =
    all24.find((h) => h.isCurrent) ??
    all24[Math.min(23, Math.max(0, Math.floor((date.getHours() + 6) % 24)))];

  return {
    current,
    dayRuler: CLASSICAL_PLANETS[dayFirstIdx],
    nightRuler: CLASSICAL_PLANETS[nightFirstIdx],
    all24,
  };
}

export function computeHebrewMysticalTime(date: Date): HebrewMysticalTime {
  const hdate = new HDate(date);
  const hy = hdate.getFullYear();
  const hd = hdate.getDate();
  const hmName = hdate.getMonthName();
  const isLeap = hdate.isLeapYear();

  // Temporal global calendar integration (support-global-calendar-systems)
  const isoPlain = TemporalAPI.PlainDate.from({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });
  const nowDate = new Date();
  const todayIso = TemporalAPI.PlainDate.from({
    year: nowDate.getFullYear(),
    month: nowDate.getMonth() + 1,
    day: nowDate.getDate(),
  });

  const calendarId = 'hebrew';
  const hebPlain = isCalendarSupported(calendarId)
    ? isoPlain.withCalendar(calendarId)
    : isoPlain;
  const todayHebPlain = isCalendarSupported(calendarId)
    ? todayIso.withCalendar(calendarId)
    : todayIso;

  const cmp = TemporalAPI.PlainDate.compare(hebPlain, todayHebPlain);
  const timelineRelativeToToday = cmp < 0 ? 'Past' : cmp > 0 ? 'Future' : 'Today';

  const localizedHebrewDisplay = date.toLocaleString('en-u-ca-hebrew', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Map Hebrew month to Mazal (Nisan=1 -> index 0 .. Adar=12/13 -> index 11)
  const hm = hdate.getMonth(); // 1=Nisan .. 6=Elul, 7=Tishrei .. 12/13=Adar
  const mazalIndex = Math.min(11, Math.max(0, hm - 1));
  const activeMonthMazal = MAZALOT[mazalIndex];
  const activeSimpleLetter =
    SEFER_YETZIRAH_LETTERS.find((l) => l.zodiacIndex === mazalIndex) ??
    SEFER_YETZIRAH_LETTERS[4];

  // Metonic 19-year cycle & Shmita 7-year cycle
  const metonicCycleYear = ((hy - 1) % 19) + 1;
  const shmitaCycleYear = hy % 7 === 0 ? 7 : hy % 7;
  const isShmitaYear = shmitaCycleYear === 7;
  const yovelYear = ((hy - 1) % 50) + 1;

  // 6,000-Year Cosmic Week (Sanhedrin 97a / Zohar): each millennium = 1 Day of Creation (Sefirot Chesed..Yesod)
  const millenniumNumber = Math.floor((hy - 1) / 1000) + 1;
  const yearInMillennium = hy % 1000;
  // 6th Millennium = Friday (Yom Shishi / Yesod)
  const cosmicDaySefirah =
    SEFIROT[Math.min(9, Math.max(3, millenniumNumber + 2))] ?? SEFIROT[8];
  const cosmicHoursElapsed = (yearInMillennium / 1000) * 24;
  const cosmicHourWhole = Math.floor(cosmicHoursElapsed);
  const cosmicMinuteWhole = Math.floor((cosmicHoursElapsed - cosmicHourWhole) * 60);

  // Weekly Parashah & Holidays
  let parashah = 'Shabbat / Seasonal Reading';
  try {
    const sedra = new Sedra(hy, false);
    const p = sedra.lookup(hdate);
    if (p && p.chag) {
      parashah = `Festival Reading (${hmName})`;
    } else if (p && p.parsha && p.parsha.length > 0) {
      parashah = `Parashat ${p.parsha.join('-')}`;
    }
  } catch {
    parashah = `Month of ${hmName}`;
  }

  const events = HebrewCalendar.getHolidaysOnDate(hdate, false) ?? [];
  const holidays = events.map((ev) => ev.render('en'));

  // Sefirat HaOmer (16 Nisan to 5 Sivan = 49 days)
  let omer: OmerCountState | null = null;
  const nisan16 = new HDate(16, 1, hy);
  const diffOmer = hdate.abs() - nisan16.abs() + 1;
  if (diffOmer >= 1 && diffOmer <= 49) {
    const week = Math.floor((diffOmer - 1) / 7) + 1; // 1..7
    const dayInWeek = ((diffOmer - 1) % 7) + 1; // 1..7
    // Lower 7 Sefirot: Chesed (index 3) .. Malkhut (index 9)
    const innerSefirah = SEFIROT[3 + (dayInWeek - 1)];
    const outerSefirah = SEFIROT[3 + (week - 1)];
    omer = {
      active: true,
      day: diffOmer,
      week,
      dayInWeek,
      innerSefirah,
      outerSefirah,
      hebrewFormula: `${innerSefirah.hebrew} שֶׁבְּ${outerSefirah.hebrew}`,
      translitFormula: `${innerSefirah.translit} she'b'${outerSefirah.translit}`,
    };
  }

  // 4 Tekufot (Seasons) & 3 Mother Letters
  let tekufah = {
    nameHeb: 'תְּקוּפַת נִיסָן',
    nameTranslit: 'Tekufat Nisan (Vernal Equinox)',
    season: 'Spring — Birth of Breath (Ruach)',
    archangel: 'Raphael',
    element: 'Air (Avir)',
    motherLetter: SEFER_YETZIRAH_LETTERS[0], // Aleph
  };
  if (hm >= 4 && hm <= 6) {
    tekufah = {
      nameHeb: 'תְּקוּפַת תַּמּוּז',
      nameTranslit: 'Tekufat Tammuz (Summer Solstice)',
      season: 'Summer — Dominion of Celestial Fire (Esh)',
      archangel: 'Michael / Uriel',
      element: 'Fire (Esh)',
      motherLetter: SEFER_YETZIRAH_LETTERS.find((l) => l.letter === 'ש')!,
    };
  } else if (hm >= 7 && hm <= 9) {
    tekufah = {
      nameHeb: 'תְּקוּפַת תִּשְׁרֵי',
      nameTranslit: 'Tekufat Tishrei (Autumnal Equinox)',
      season: 'Autumn — Equilibrium & Judgment',
      archangel: 'Gabriel',
      element: 'Air / Water Transition',
      motherLetter: SEFER_YETZIRAH_LETTERS[0], // Aleph
    };
  } else if (hm >= 10) {
    tekufah = {
      nameHeb: 'תְּקוּפַת טֵבֵת',
      nameTranslit: 'Tekufat Tevet (Winter Solstice)',
      season: 'Winter — Primordial Waters (Mayim)',
      archangel: 'Gabriel',
      element: 'Water (Mayim)',
      motherLetter: SEFER_YETZIRAH_LETTERS.find((l) => l.letter === 'מ')!,
    };
  }

  // 72 Name for current 20-minute diurnal window (72 x 20 min = 1440 min = 24 hours)
  const minutesSinceMidnight = date.getHours() * 60 + date.getMinutes();
  const diurnalIdx = Math.floor(minutesSinceMidnight / 20) % 72;
  const diurnalShem72 = SHEM_HAMEPHORASH_72[diurnalIdx];

  return {
    gregorianDate: date,
    hebrewYear: hy,
    hebrewYearGematria: gematriya(hy),
    hebrewMonthName: hmName,
    hebrewMonthCode: hebPlain.monthCode,
    monthsInYear: hebPlain.monthsInYear,
    daysInMonth: hebPlain.daysInMonth,
    hebrewDay: hd,
    hebrewDayGematria: gematriya(hd),
    fullHebrewString: `${gematriya(hd)} ${hmName} ${gematriya(hy)}`,
    localizedHebrewDisplay,
    timelineRelativeToToday,
    isLeapYear: isLeap,
    metonicCycleYear,
    shmitaCycleYear,
    isShmitaYear,
    yovelYear,
    cosmicMillennium: {
      millenniumNumber,
      yearInMillennium,
      cosmicDaySefirah,
      cosmicHourDescription: `Hour ${cosmicHourWhole}:${String(cosmicMinuteWhole).padStart(2, '0')} of the 6th Cosmic Day (Erev Shabbat)`,
    },
    activeMonthMazal,
    activeSimpleLetter,
    parashah,
    holidays,
    molad: calculateTraditionalMolad(hdate),
    omer,
    tekufah,
    planetaryHours: calculatePlanetaryHours(date),
    diurnalShem72,
  };
}

