import React, { useEffect, useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Sun,
  Moon,
  Compass,
  ArrowLeft,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  type MazalInfo,
  type SefirahData,
  type SeferYetzirahLetter,
} from '../../data/kabbalah';
import {
  PLANET_PRACTICAL_GUIDE,
  SEFIRAH_PRACTICAL_GUIDE,
  getLunarPracticalAdvice,
} from '../../data/plainExplainers';
import type { CosmicSnapshot, PlanetEphemeris } from '../../engines/astronomy';
import type { HebrewMysticalTime } from '../../engines/hebrewTime';

export type SelectedEntity =
  | { kind: 'sefirah'; data: SefirahData }
  | { kind: 'letter'; data: SeferYetzirahLetter }
  | { kind: 'planet'; data: PlanetEphemeris }
  | { kind: 'mazal'; data: MazalInfo }
  | null;

interface EsotericInspectorProps {
  cosmic: CosmicSnapshot;
  hebrewTime: HebrewMysticalTime;
  selected: SelectedEntity;
  pathSystem: 'gra' | 'ari';
  isTourOpen?: boolean;
  onSelectEntity: (entity: SelectedEntity) => void;
  onJumpToDate: (date: Date) => void;
}

export const EsotericInspector: React.FC<EsotericInspectorProps> = ({
  cosmic,
  hebrewTime,
  selected,
  pathSystem,
  isTourOpen = false,
  onSelectEntity,
  onJumpToDate,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const currentHour = hebrewTime.planetaryHours.current;
  const hourGuide = PLANET_PRACTICAL_GUIDE[currentHour.planet.key];
  const lunarAdvice = getLunarPracticalAdvice(cosmic.lunar.phaseAngle);

  // Automatically reveal the sheet if the user taps a 3D sphere, letter, or Zodiac sign
  useEffect(() => {
    if (selected) {
      setCollapsed(false);
    }
  }, [selected]);

  if (collapsed) {
    return (
      <aside
        className={`pointer-events-auto absolute inset-x-2.5 bottom-2.5 md:inset-x-auto md:bottom-auto md:left-3 md:top-3 z-20 ${
          isTourOpen ? 'max-md:hidden' : ''
        }`}
      >
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="olam-panel w-full md:w-auto flex items-center justify-between md:justify-start gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Sparkles aria-hidden="true" className="w-3.5 h-3.5 olam-accent" />
            <span>Daily Wisdom Guide</span>
          </span>
          <span className="flex items-center gap-1.5 olam-text-muted mono-telemetry">
            <span>☽ {Math.round(cosmic.lunar.illumination * 100)}%</span>
            <span>•</span>
            <span>{currentHour.planet.english}</span>
            <ChevronUp
              aria-hidden="true"
              className="w-4 h-4 md:hidden olam-text-primary"
            />
            <ChevronRight
              aria-hidden="true"
              className="w-4 h-4 hidden md:inline olam-text-primary"
            />
          </span>
        </button>
      </aside>
    );
  }

  return (
    <aside
      className={`mixed-script-container wisdom-container olam-panel pointer-events-auto absolute inset-x-2.5 bottom-2.5 md:inset-x-auto md:left-3 md:top-3 md:bottom-3 ${
        expanded
          ? 'max-h-[75dvh] md:max-h-none md:w-[38rem] lg:w-[48rem]'
          : 'max-h-[38dvh] md:max-h-none md:w-[21.5rem] lg:w-[24.5rem]'
      } ${
        isTourOpen
          ? 'max-md:hidden md:max-w-[calc(100dvw-25.5rem)]'
          : 'md:max-w-[calc(100dvw-1.5rem)]'
      } border rounded-2xl flex flex-col overflow-hidden z-20 transition-[width,max-width,max-height] duration-300 ease-out`}
    >
      {/* Mobile Grab Handle + Clean SaaS Header */}
      <div className="px-3.5 sm:px-4 py-2.5 border-b border-slate-900/10 flex items-center justify-between gap-2 shrink-0">
        {selected ? (
          <button
            type="button"
            onClick={() => onSelectEntity(null)}
            className="flex items-center gap-1.5 text-xs font-semibold olam-text-primary hover:underline cursor-pointer min-w-0"
          >
            <ArrowLeft
              aria-hidden="true"
              className="w-3.5 h-3.5 olam-accent shrink-0"
            />
            <span className="truncate">Back to Today’s Alignment</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles
              aria-hidden="true"
              className="w-4 h-4 olam-accent shrink-0"
            />
            <h2 className="display-title text-xs sm:text-sm font-semibold olam-text-primary truncate">
              Daily Wisdom &amp; Cycles
            </h2>
          </div>
        )}

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="olam-pill flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer transition-colors"
            title={
              expanded ? 'Restore Compact Size' : 'Expand Panel Over Map'
            }
          >
            {expanded ? (
              <>
                <Minimize2 aria-hidden="true" className="w-3 h-3 olam-accent" />
                <span>Compact</span>
              </>
            ) : (
              <>
                <Maximize2 aria-hidden="true" className="w-3 h-3 olam-accent" />
                <span>Expand</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Minimize Wisdom Guide to Map View"
            className="olam-pill px-2 py-1 rounded-lg border olam-text-secondary hover:olam-text-primary flex items-center gap-1 text-xs font-medium cursor-pointer"
            title="Minimize to Map"
          >
            <span className="md:hidden">Map</span>
            <ChevronDown aria-hidden="true" className="w-3.5 h-3.5 md:hidden" />
            <ChevronLeft
              aria-hidden="true"
              className="w-4 h-4 hidden md:inline"
            />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="olam-scroll-area flex-1 p-3.5 sm:p-4 space-y-3.5 text-sm olam-text-secondary">
        {!selected ? (
          <>
            <p className="text-xs olam-text-muted">
              How the Moon, Month, and Hour align right now—and how to use them
              in daily life. Tap any sphere or letter on the 3D map to inspect
              it.
            </p>

            <div className="wisdom-card-grid">
              {/* 1. THE MOON CYCLE */}
              <div className="olam-card wisdom-card-span-2 p-3.5 sm:p-4 rounded-xl border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold olam-accent">
                    <Moon className="w-3.5 h-3.5" /> Moon Cycle •{' '}
                    <span className="mono-telemetry">
                      {Math.round(cosmic.lunar.illumination * 100)}%
                    </span>
                  </span>
                  <span className="mono-telemetry text-xs olam-text-muted">
                    Day {hebrewTime.hebrewDay} of {hebrewTime.daysInMonth}
                  </span>
                </div>

                <h3 className="text-base font-semibold olam-text-primary">
                  {lunarAdvice.stageTitle}
                </h3>

                <p className="text-sm olam-text-secondary">
                  {lunarAdvice.plainExplanation}
                </p>

                <div className="olam-pill p-3 rounded-lg border-l-2 border-[var(--accent-gold)] space-y-1">
                  <div className="text-xs font-semibold olam-accent">
                    How to benefit today
                  </div>
                  <p className="text-sm olam-text-primary">
                    {lunarAdvice.howToBenefit}
                  </p>
                </div>
              </div>

              {/* 2. THIS MONTH'S GIFT */}
              <div className="olam-card p-4 rounded-xl border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-medium olam-text-secondary">
                    <Compass className="w-3.5 h-3.5 olam-accent" /> Month of{' '}
                    {hebrewTime.hebrewMonthName}
                  </span>
                  <span className="hebrew-glyph text-xs olam-accent">
                    {hebrewTime.activeMonthMazal.symbol}{' '}
                    {hebrewTime.activeMonthMazal.westernName} • Letter{' '}
                    {hebrewTime.activeSimpleLetter.letter}
                  </span>
                </div>

                <h3 className="text-sm font-semibold olam-text-primary">
                  Monthly Focus: {hebrewTime.activeMonthMazal.senseFaculty}
                </h3>

                <p className="text-sm olam-text-secondary">
                  <em>Sefer Yetzirah</em> links each lunar month to a core human
                  faculty. During <strong>{hebrewTime.hebrewMonthName}</strong>{' '}
                  ({hebrewTime.activeMonthMazal.westernName}), focus on refining
                  your{' '}
                  <strong className="olam-accent">
                    {hebrewTime.activeMonthMazal.senseFaculty}
                  </strong>{' '}
                  through the letter{' '}
                  <strong>
                    {hebrewTime.activeSimpleLetter.letter} (
                    {hebrewTime.activeSimpleLetter.name} — &ldquo;
                    {hebrewTime.activeSimpleLetter.meaning}&rdquo;)
                  </strong>
                  .
                </p>
              </div>

              {/* 3. THIS HOUR'S ENERGY */}
              <div className="olam-card p-4 rounded-xl border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-medium olam-text-secondary">
                    <Sun className="w-3.5 h-3.5 olam-accent" /> Current Hour’s
                    Rhythm
                  </span>
                  <span className="mono-telemetry text-xs olam-text-muted">
                    Hour #{currentHour.hourNumber} (
                    {currentHour.period.split(' ')[0]})
                  </span>
                </div>

                <h3 className="text-sm font-semibold olam-text-primary">
                  {hourGuide.plainTitle}
                </h3>

                <p className="text-sm olam-text-secondary">
                  <strong className="olam-accent">Best for right now:</strong>{' '}
                  {hourGuide.bestHourFor}
                </p>
                <p className="text-xs olam-text-muted">
                  <strong>Be mindful of:</strong> {hourGuide.avoidInHour}
                </p>
              </div>
            </div>

            {/* PROGRESSIVE DISCLOSURE: 24-HOUR SCHEDULE */}
            <details className="olam-card group rounded-xl border p-3.5">
              <summary className="cursor-pointer font-medium text-xs olam-text-primary flex items-center justify-between list-none">
                <span>View all 24 planetary hours today</span>
                <span className="text-xs olam-text-muted group-open:rotate-90 transition-transform">
                  ▶
                </span>
              </summary>
              <div
                className={`mt-3 grid gap-1.5 max-h-60 overflow-y-auto pr-1 ${
                  expanded ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
                }`}
              >
                {hebrewTime.planetaryHours.all24.map((slot, idx) => {
                  const pGuide = PLANET_PRACTICAL_GUIDE[slot.planet.key];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        onJumpToDate(
                          new Date(
                            (slot.startTime.getTime() +
                              slot.endTime.getTime()) /
                              2
                          )
                        )
                      }
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all cursor-pointer ${
                        slot.isCurrent
                          ? 'olam-pill border-[var(--accent-gold)]'
                          : 'olam-card hover:opacity-90'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-medium text-xs olam-text-primary">
                          {slot.period.startsWith('Night') ? '☾' : '☉'}{' '}
                          {slot.planet.english} ({slot.planet.translit})
                        </div>
                        <div className="text-xs olam-text-muted truncate">
                          {pGuide.coreQuality}
                        </div>
                      </div>
                      <span className="mono-telemetry text-xs olam-text-muted shrink-0">
                        {slot.startTime.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </button>
                  );
                })}
              </div>
            </details>

            {/* PROGRESSIVE DISCLOSURE: DEEP KABBALISTIC CYCLES */}
            <details className="olam-card group rounded-xl border p-3.5">
              <summary className="cursor-pointer font-medium text-xs olam-text-primary flex items-center justify-between list-none">
                <span>Deep cycles (Molad, 19-year leap &amp; 72 Names)</span>
                <span className="text-xs olam-text-muted group-open:rotate-90 transition-transform">
                  ▶
                </span>
              </summary>
              <div className="mt-3 space-y-2 text-xs olam-text-secondary">
                <div>
                  <strong className="olam-text-primary">
                    Traditional Molad (New Moon birth):
                  </strong>{' '}
                  {hebrewTime.molad.summaryString}
                </div>
                <div>
                  <strong className="olam-text-primary">
                    19-Year Lunisolar Cycle (Sod Ha’Ibbur):
                  </strong>{' '}
                  Year {hebrewTime.metonicCycleYear} of 19 (
                  {hebrewTime.isLeapYear
                    ? '13-Month Leap Year'
                    : '12-Month Standard Year'}
                  )
                </div>
                <div>
                  <strong className="olam-text-primary">
                    7-Year Sabbatical Cycle (Shmita):
                  </strong>{' '}
                  Year {hebrewTime.shmitaCycleYear} of 7
                </div>
                <div>
                  <strong className="olam-text-primary">
                    Active 72 Name Meditation:
                  </strong>{' '}
                  <span className="hebrew-glyph text-sm font-semibold olam-accent">
                    {cosmic.planets.Sun.shem72.hebrew}
                  </span>{' '}
                  ({cosmic.planets.Sun.shem72.translit}) —{' '}
                  {cosmic.planets.Sun.shem72.kavvanah}
                </div>
                <div>
                  <strong className="olam-text-primary">
                    6,000-Year Cosmic Week:
                  </strong>{' '}
                  {hebrewTime.cosmicMillennium.cosmicHourDescription}
                </div>
              </div>
            </details>
          </>
        ) : (
          /* SELECTED 3D ITEM VIEW */
          <div className="space-y-4">
            {selected.kind === 'sefirah' && (
              <>
                <div className="olam-card p-4 rounded-xl border space-y-2">
                  <div className="text-xs font-medium olam-text-muted">
                    Tree of Life Node #{selected.data.index} •{' '}
                    {selected.data.pillar}
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="hebrew-glyph text-2xl font-semibold olam-accent">
                      {selected.data.hebrew}
                    </span>
                    <h3 className="text-base font-semibold olam-text-primary">
                      {selected.data.translit} —{' '}
                      {SEFIRAH_PRACTICAL_GUIDE[selected.data.id].everydayName}
                    </h3>
                  </div>
                  <p className="text-sm olam-text-secondary">
                    {selected.data.description}
                  </p>
                </div>

                <div className="olam-card p-4 rounded-xl border-l-2 border-[var(--accent-gold)] space-y-2">
                  <div className="text-xs font-semibold olam-accent">
                    Question to reflect on
                  </div>
                  <p className="text-sm italic olam-text-primary">
                    &ldquo;
                    {SEFIRAH_PRACTICAL_GUIDE[selected.data.id].humanQuestion}
                    &rdquo;
                  </p>
                  <div className="text-xs font-semibold olam-accent pt-1">
                    How to practice this quality
                  </div>
                  <p className="text-sm olam-text-secondary">
                    {SEFIRAH_PRACTICAL_GUIDE[selected.data.id].howToPractice}
                  </p>
                </div>

                <details className="olam-card group rounded-xl border p-3.5">
                  <summary className="cursor-pointer font-medium text-xs olam-text-primary flex items-center justify-between list-none">
                    <span>Traditional Kabbalistic correspondences</span>
                    <span className="text-xs olam-text-muted group-open:rotate-90 transition-transform">
                      ▶
                    </span>
                  </summary>
                  <div className="mt-2.5 space-y-1.5 text-xs olam-text-secondary">
                    <div>
                      <strong>Divine Name:</strong> {selected.data.divineName} (
                      {selected.data.divineNameHeb})
                    </div>
                    <div>
                      <strong>Celestial Sphere:</strong>{' '}
                      {selected.data.sphereTranslit} (
                      {selected.data.hebrewSphere})
                    </div>
                    <div>
                      <strong>Archangel &amp; Choir:</strong>{' '}
                      {selected.data.archangel} • {selected.data.choir}
                    </div>
                  </div>
                </details>
              </>
            )}

            {selected.kind === 'planet' && (
              <>
                <div className="olam-card p-4 rounded-xl border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium olam-text-muted">
                      Planetary Sphere • Letter{' '}
                      {selected.data.info.doubleLetter}
                    </span>
                    <span className="mono-telemetry text-xs olam-accent">
                      {selected.data.mazal.symbol}{' '}
                      {Math.floor(selected.data.degreeInMazal)}°{' '}
                      {selected.data.mazal.westernName}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold olam-text-primary">
                    {PLANET_PRACTICAL_GUIDE[selected.data.info.key].plainTitle}
                  </h3>
                  <p className="text-sm olam-text-secondary">
                    {PLANET_PRACTICAL_GUIDE[selected.data.info.key].lifeLesson}
                  </p>
                </div>

                <div className="olam-card p-4 rounded-xl border-l-2 border-[var(--accent-gold)] space-y-2">
                  <div className="text-xs font-semibold olam-accent">
                    When this planet rules the hour
                  </div>
                  <p className="text-sm olam-text-primary">
                    <strong>Best for:</strong>{' '}
                    {PLANET_PRACTICAL_GUIDE[selected.data.info.key].bestHourFor}
                  </p>
                  <p className="text-xs olam-text-muted">
                    <strong>Be mindful of:</strong>{' '}
                    {PLANET_PRACTICAL_GUIDE[selected.data.info.key].avoidInHour}
                  </p>
                </div>
              </>
            )}

            {selected.kind === 'letter' && (
              <div className="olam-card p-4 rounded-xl border space-y-2.5">
                <div className="text-xs font-medium olam-text-muted">
                  Sefer Yetzirah Path #{selected.data.number} •{' '}
                  {selected.data.category}
                </div>
                <div className="flex items-center gap-3">
                  <div className="hebrew-glyph olam-pill w-11 h-11 rounded-xl border flex items-center justify-center text-2xl font-semibold olam-accent">
                    {selected.data.letter}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold olam-text-primary">
                      Hebrew Letter {selected.data.name}
                    </h3>
                    <p className="text-xs olam-accent">
                      {selected.data.meaning}
                    </p>
                  </div>
                </div>
                <div className="pt-2 space-y-1.5 text-sm olam-text-secondary border-t border-[var(--border-subtle)]">
                  <div>
                    <strong className="olam-text-primary">
                      In the Sky (Olam):
                    </strong>{' '}
                    {selected.data.olam}
                  </div>
                  <div>
                    <strong className="olam-text-primary">
                      In Time (Shanah):
                    </strong>{' '}
                    {selected.data.shanah}
                  </div>
                  <div>
                    <strong className="olam-text-primary">
                      In the Human Person (Nefesh):
                    </strong>{' '}
                    {selected.data.nefesh}
                  </div>
                  <div>
                    <strong className="olam-text-primary">
                      Tree of Life Connection ({pathSystem.toUpperCase()}):
                    </strong>{' '}
                    {(pathSystem === 'gra'
                      ? selected.data.graPath
                      : selected.data.ariPath
                    )
                      .map((s) => s.toUpperCase())
                      .join(' ↔ ')}
                  </div>
                </div>
              </div>
            )}

            {selected.kind === 'mazal' && (
              <div className="olam-card p-4 rounded-xl border space-y-2.5">
                <div className="text-xs font-medium olam-text-muted">
                  Zodiac Constellation &amp; Lunar Month
                </div>
                <h3 className="text-base font-semibold olam-text-primary">
                  {selected.data.symbol} {selected.data.westernName} (
                  {selected.data.translit} / {selected.data.hebrew})
                </h3>
                <div className="space-y-1.5 text-sm olam-text-secondary">
                  <div>
                    <strong className="olam-text-primary">
                      Hebrew Lunar Month:
                    </strong>{' '}
                    {selected.data.hebrewMonth} ({selected.data.hebrewMonthHeb})
                  </div>
                  <div>
                    <strong className="olam-text-primary">
                      Human Strength to Cultivate:
                    </strong>{' '}
                    <span className="olam-accent font-medium">
                      {selected.data.senseFaculty}
                    </span>
                  </div>
                  <div>
                    <strong className="olam-text-primary">
                      Creating Letter:
                    </strong>{' '}
                    {selected.data.simpleLetter} (
                    {selected.data.simpleLetterName})
                  </div>
                  <div>
                    <strong className="olam-text-primary">
                      Tribe of Israel:
                    </strong>{' '}
                    {selected.data.tribe}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
