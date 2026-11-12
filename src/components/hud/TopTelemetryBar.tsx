import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import * as Switch from '@radix-ui/react-switch';
import {
  Bookmark,
  Compass,
  Sparkles,
  Orbit,
  Eye,
  SlidersHorizontal,
  GraduationCap,
  Sun,
  Moon,
} from 'lucide-react';
import type { CosmicSnapshot } from '../../engines/astronomy';
import type { HebrewMysticalTime } from '../../engines/hebrewTime';
import type { CameraMode } from '../canvas/CosmicScene';
import { PLANET_PRACTICAL_GUIDE } from '../../data/plainExplainers';

interface TopTelemetryBarProps {
  cosmic: CosmicSnapshot;
  hebrewTime: HebrewMysticalTime;
  cameraMode: CameraMode;
  onCameraModeChange: (mode: CameraMode) => void;
  pathSystem: 'gra' | 'ari';
  onPathSystemChange: (sys: 'gra' | 'ari') => void;
  showCubeOfSpace: boolean;
  onToggleCube: (val: boolean) => void;
  showAspects: boolean;
  onToggleAspects: (val: boolean) => void;
  showTeli: boolean;
  onToggleTeli: (val: boolean) => void;
  isTourOpen: boolean;
  onToggleTour: () => void;
  bookmarksCount: number;
  onOpenBookmarks: () => void;
  resolvedTheme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const TopTelemetryBar: React.FC<TopTelemetryBarProps> = ({
  cosmic,
  hebrewTime,
  cameraMode,
  onCameraModeChange,
  pathSystem,
  onPathSystemChange,
  showCubeOfSpace,
  onToggleCube,
  showAspects,
  onToggleAspects,
  showTeli,
  onToggleTeli,
  isTourOpen,
  onToggleTour,
  bookmarksCount,
  onOpenBookmarks,
  resolvedTheme,
  onToggleTheme,
}) => {
  const currentHour = hebrewTime.planetaryHours.current;
  const hourGuide = PLANET_PRACTICAL_GUIDE[currentHour.planet.key];

  return (
    <header className="mixed-script-container olam-panel pointer-events-auto w-full min-h-[4.25rem] py-3 px-6 backdrop-blur-2xl border-b flex flex-wrap items-center justify-between gap-4 z-20 transition-colors">
      {/* Left: Prominent Olam Brand + Date & Status Chips */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-2.5 border-r border-[var(--border-subtle)] pr-4">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-gold)] shadow-sm" />
          <div className="flex items-baseline gap-2">
            <span className="display-title text-lg font-bold tracking-tight olam-text-primary">
              Olam
            </span>
            <span className="hebrew-glyph text-sm olam-accent">עוֹלָם</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 truncate">
          <span className="text-base font-semibold olam-text-primary">
            {hebrewTime.hebrewDay} {hebrewTime.hebrewMonthName}{' '}
            {hebrewTime.hebrewYear}
          </span>
          <span className="hebrew-glyph text-sm olam-text-muted hidden sm:inline">
            {hebrewTime.fullHebrewString}
          </span>
          <span className="olam-text-muted">•</span>
          <span className="mono-telemetry text-sm olam-text-muted">
            {cosmic.date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Clean SaaS Status Chips */}
        <div className="hidden xl:flex items-center gap-2.5 border-l border-[var(--border-subtle)] pl-4 text-xs">
          <span className="olam-pill px-3 py-1 rounded-lg border font-medium">
            ☽ {cosmic.lunar.phaseNameEn.split(' (')[0]} •{' '}
            <span className="mono-telemetry olam-text-muted">
              {Math.round(cosmic.lunar.illumination * 100)}%
            </span>
          </span>
          <span
            className="olam-pill px-3 py-1 rounded-lg border font-medium olam-accent"
            title={hourGuide.bestHourFor}
          >
            ⧖ {currentHour.planet.english} Hour
          </span>
        </div>
      </div>

      {/* Center: Segmented SaaS View Switcher */}
      <div className="olam-pill flex items-center p-1 rounded-xl border">
        {(
          [
            { id: 'astrolabe', label: 'Full Cosmos', icon: Orbit },
            { id: 'sanctuary', label: 'Tree of Life', icon: Sparkles },
            { id: 'helix', label: 'Time Spiral', icon: Compass },
            { id: 'topdown', label: 'Zodiac Wheel', icon: Eye },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onCameraModeChange(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              cameraMode === id
                ? 'olam-btn-primary shadow-sm'
                : 'olam-text-muted hover:olam-text-primary'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Right: Actions, Theme Toggle & Popover Settings */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onToggleTour}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
            isTourOpen ? 'olam-btn-primary border-transparent' : 'olam-pill'
          }`}
        >
          <GraduationCap className="w-4 h-4 olam-accent" />
          <span>Learn the Cycles</span>
        </button>

        <button
          type="button"
          onClick={onOpenBookmarks}
          className="olam-pill flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer"
        >
          <Bookmark className="w-3.5 h-3.5 olam-accent" />
          <span className="hidden sm:inline">Saved ({bookmarksCount})</span>
        </button>

        {/* Two-State Light/Dark Mode Toggle (with System revert per dark-mode-toggle guide) */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={
            resolvedTheme === 'dark'
              ? 'Switch to light theme'
              : 'Switch to dark theme'
          }
          title={
            resolvedTheme === 'dark'
              ? 'Switch to light theme'
              : 'Switch to dark theme'
          }
          className="olam-pill flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all"
        >
          {resolvedTheme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 olam-accent" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 olam-accent" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              type="button"
              aria-label="3D Layers and Mystical Settings"
              className="olam-pill flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 olam-accent" />
              <span className="hidden sm:inline">Layers</span>
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={8}
              className="mixed-script-container olam-panel z-50 w-64 rounded-2xl backdrop-blur-2xl border p-4 shadow-2xl space-y-3 text-xs"
            >
              <div className="text-xs font-semibold olam-text-muted">
                3D Geometry Overlays
              </div>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Cube of Space (22 Letters)</span>
                <Switch.Root
                  checked={showCubeOfSpace}
                  onCheckedChange={onToggleCube}
                  className="w-8 h-4 bg-slate-500/30 rounded-full relative data-[state=checked]:bg-[var(--accent-gold)] cursor-pointer"
                >
                  <Switch.Thumb className="block w-3 h-3 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-4" />
                </Switch.Root>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Planetary Aspect Lines</span>
                <Switch.Root
                  checked={showAspects}
                  onCheckedChange={onToggleAspects}
                  className="w-8 h-4 bg-slate-500/30 rounded-full relative data-[state=checked]:bg-[var(--accent-gold)] cursor-pointer"
                >
                  <Switch.Thumb className="block w-3 h-3 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-4" />
                </Switch.Root>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Eclipse Nodes (Teli Axis)</span>
                <Switch.Root
                  checked={showTeli}
                  onCheckedChange={onToggleTeli}
                  className="w-8 h-4 bg-slate-500/30 rounded-full relative data-[state=checked]:bg-[var(--accent-gold)] cursor-pointer"
                >
                  <Switch.Thumb className="block w-3 h-3 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-4" />
                </Switch.Root>
              </label>

              <div className="pt-2.5 border-t border-[var(--border-subtle)] space-y-2">
                <div className="text-xs font-semibold olam-text-muted">
                  Tree of Life Path Tradition
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onPathSystemChange('gra')}
                    className={`py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                      pathSystem === 'gra'
                        ? 'olam-btn-primary border-transparent'
                        : 'olam-pill'
                    }`}
                  >
                    Classical (Gra)
                  </button>
                  <button
                    type="button"
                    onClick={() => onPathSystemChange('ari')}
                    className={`py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                      pathSystem === 'ari'
                        ? 'olam-btn-primary border-transparent'
                        : 'olam-pill'
                    }`}
                  >
                    Lurianic (Ari)
                  </button>
                </div>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </header>
  );
};
