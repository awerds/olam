import React, { useEffect, useMemo, useState } from 'react';
import { CosmicScene, type CameraMode } from './components/canvas/CosmicScene';
import { TopTelemetryBar } from './components/hud/TopTelemetryBar';
import { ChronoScrubber } from './components/hud/ChronoScrubber';
import {
  EsotericInspector,
  type SelectedEntity,
} from './components/hud/EsotericInspector';
import {
  TimeBookmarkModal,
  type SavedTimeBookmark,
} from './components/hud/TimeBookmarkModal';
import { MysticalGuideBar } from './components/hud/MysticalGuideBar';
import { computeCosmicSnapshot } from './engines/astronomy';
import { computeHebrewMysticalTime } from './engines/hebrewTime';

const STORAGE_KEY = 'merkavah_astrolabe_bookmarks_v1';

const DEFAULT_BOOKMARKS: SavedTimeBookmark[] = [
  {
    id: 'preset-pesach',
    title: '15 Nisan — Pesach Full Moon (Peak Illumination)',
    note: 'Night of maximum solar-lunar union (Tiferet & Malkhut face-to-face) in Aries (Nisan / Letter He).',
    isoTimestamp: '2027-04-22T20:00:00.000Z',
    hebrewDateStr: 'ט״ו נִיסָן תשפ״ז',
    moonPhaseStr: 'Full Moon (100%)',
    rulingPlanetStr: 'Tzedek (Jupiter)',
  },
  {
    id: 'preset-rosh-hashanah',
    title: '1 Tishrei — Rosh Hashanah New Moon Seed',
    note: 'Head of the Year in Libra (Tishrei / Letter Lamed), renewal of the Lunar Vessel (Molad).',
    isoTimestamp: '2027-10-02T16:30:00.000Z',
    hebrewDateStr: 'א׳ תִּשְׁרֵי תשפ״ח',
    moonPhaseStr: 'New Moon (0%)',
    rulingPlanetStr: 'Nogah (Venus)',
  },
];

export const App: React.FC = () => {
  const [activeDate, setActiveDate] = useState<Date>(() => new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeedHoursPerSec, setPlaySpeedHoursPerSec] = useState(1);
  const [cameraMode, setCameraMode] = useState<CameraMode>('astrolabe');
  const [pathSystem, setPathSystem] = useState<'gra' | 'ari'>('gra');
  const [showCubeOfSpace, setShowCubeOfSpace] = useState(true);
  const [showAspects, setShowAspects] = useState(true);
  const [showTeli, setShowTeli] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity>(null);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);

  const [bookmarks, setBookmarks] = useState<SavedTimeBookmark[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_BOOKMARKS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    } catch {}
  }, [bookmarks]);

  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const dtSec = (now - lastTime) / 1000;
      lastTime = now;
      const deltaMs = dtSec * playSpeedHoursPerSec * 3600000;
      setActiveDate((prev) => new Date(prev.getTime() + deltaMs));
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, playSpeedHoursPerSec]);

  const cosmic = useMemo(() => computeCosmicSnapshot(activeDate), [activeDate]);
  const hebrewTime = useMemo(
    () => computeHebrewMysticalTime(activeDate),
    [activeDate]
  );

  const selectedId = useMemo(() => {
    if (!selectedEntity) return null;
    if (selectedEntity.kind === 'sefirah')
      return `sefirah-${selectedEntity.data.id}`;
    if (selectedEntity.kind === 'letter')
      return `letter-${selectedEntity.data.number}`;
    if (selectedEntity.kind === 'planet')
      return `planet-${selectedEntity.data.info.key}`;
    if (selectedEntity.kind === 'mazal')
      return `mazal-${selectedEntity.data.index}`;
    return null;
  }, [selectedEntity]);

  const handleAddBookmark = (title: string, note: string) => {
    const newBm: SavedTimeBookmark = {
      id: `bm-${Date.now()}`,
      title,
      note,
      isoTimestamp: activeDate.toISOString(),
      hebrewDateStr: hebrewTime.fullHebrewString,
      moonPhaseStr: `${cosmic.lunar.phaseNameEn} (${Math.round(
        cosmic.lunar.illumination * 100
      )}%)`,
      rulingPlanetStr: hebrewTime.planetaryHours.current.planet.translit,
    };
    setBookmarks((prev) => [newBm, ...prev]);
  };

  const handleQuickSave = () => {
    handleAddBookmark(
      `${hebrewTime.hebrewDay} ${hebrewTime.hebrewMonthName} ${hebrewTime.hebrewYear} (${cosmic.lunar.phaseNameEn})`,
      `Hour of ${hebrewTime.planetaryHours.current.planet.english} • 72 Name #${cosmic.planets.Sun.shem72.number} (${cosmic.planets.Sun.shem72.hebrew})`
    );
    setIsBookmarkModalOpen(true);
  };

  return (
    <div className="relative w-full h-dvh overflow-clip flex flex-col justify-between select-none">
      {/* Enlarged Olam Title Bar (Frosted White Semi-Transparent) */}
      <TopTelemetryBar
        cosmic={cosmic}
        hebrewTime={hebrewTime}
        cameraMode={cameraMode}
        onCameraModeChange={setCameraMode}
        pathSystem={pathSystem}
        onPathSystemChange={setPathSystem}
        showCubeOfSpace={showCubeOfSpace}
        onToggleCube={setShowCubeOfSpace}
        showAspects={showAspects}
        onToggleAspects={setShowAspects}
        showTeli={showTeli}
        onToggleTeli={setShowTeli}
        isTourOpen={isTourOpen}
        onToggleTour={() => setIsTourOpen((o) => !o)}
        bookmarksCount={bookmarks.length}
        onOpenBookmarks={() => setIsBookmarkModalOpen(true)}
      />

      {/* Full-Bleed 3D WebGL Cosmic Viewport (Isolated z-0 so 3D HTML labels stay under UI) */}
      <main className="absolute inset-0 z-0 isolate">
        <CosmicScene
          cosmic={cosmic}
          hebrewTime={hebrewTime}
          cameraMode={cameraMode}
          pathSystem={pathSystem}
          showCubeOfSpace={showCubeOfSpace}
          showAspects={showAspects}
          showTeli={showTeli}
          selectedId={selectedId}
          onSelectSefirah={(data) =>
            setSelectedEntity({ kind: 'sefirah', data })
          }
          onSelectLetter={(data) => setSelectedEntity({ kind: 'letter', data })}
          onSelectPlanet={(data) => setSelectedEntity({ kind: 'planet', data })}
          onSelectMazal={(data) => setSelectedEntity({ kind: 'mazal', data })}
          onSelectDate={(dt) => setActiveDate(dt)}
        />
      </main>

      {/* Middle Dock Workspace (bounded strictly between Top Header and Bottom Scrubber so flyouts never overlap menus) */}
      <div className="relative flex-1 min-h-0 w-full pointer-events-none z-20">
        {/* Left-Docked Expandable Alpha Wisdom Guide */}
        <EsotericInspector
          cosmic={cosmic}
          hebrewTime={hebrewTime}
          selected={selectedEntity}
          pathSystem={pathSystem}
          isTourOpen={isTourOpen}
          onSelectEntity={setSelectedEntity}
          onJumpToDate={setActiveDate}
        />

        {/* On-Demand 5-Step Guided Tour */}
        <MysticalGuideBar
          isOpen={isTourOpen}
          onClose={() => setIsTourOpen(false)}
          onChangeCameraMode={setCameraMode}
          onToggleCube={setShowCubeOfSpace}
        />
      </div>

      {/* Bottom Scrubber */}
      <ChronoScrubber
        cosmic={cosmic}
        hebrewTime={hebrewTime}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((p) => !p)}
        playSpeedHoursPerSec={playSpeedHoursPerSec}
        onChangeSpeed={setPlaySpeedHoursPerSec}
        onChangeDate={setActiveDate}
        onQuickSaveCurrentDate={handleQuickSave}
      />

      {/* Light-Dismiss Personal Time-Bookmark Modal */}
      <TimeBookmarkModal
        isOpen={isBookmarkModalOpen}
        onClose={() => setIsBookmarkModalOpen(false)}
        cosmic={cosmic}
        hebrewTime={hebrewTime}
        bookmarks={bookmarks}
        onAddBookmark={handleAddBookmark}
        onDeleteBookmark={(id) =>
          setBookmarks((prev) => prev.filter((b) => b.id !== id))
        }
        onJumpToBookmark={(iso) => setActiveDate(new Date(iso))}
      />
    </div>
  );
};
