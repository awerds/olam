import React from 'react';
import * as Slider from '@radix-ui/react-slider';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Eclipse,
  PlusCircle,
} from 'lucide-react';
import type { CosmicSnapshot } from '../../engines/astronomy';
import type { HebrewMysticalTime } from '../../engines/hebrewTime';

interface ChronoScrubberProps {
  cosmic: CosmicSnapshot;
  hebrewTime: HebrewMysticalTime;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playSpeedHoursPerSec: number;
  onChangeSpeed: (speed: number) => void;
  onChangeDate: (newDate: Date) => void;
  onQuickSaveCurrentDate: () => void;
}

export const ChronoScrubber: React.FC<ChronoScrubberProps> = ({
  cosmic,
  isPlaying,
  onTogglePlay,
  playSpeedHoursPerSec,
  onChangeSpeed,
  onChangeDate,
  onQuickSaveCurrentDate,
}) => {
  const startOfYear = new Date(cosmic.date.getFullYear(), 0, 1).getTime();
  const dayOfYearFloat = (cosmic.date.getTime() - startOfYear) / 86400000;

  const handleSliderChange = (vals: number[]) => {
    const newTime = startOfYear + vals[0] * 86400000;
    onChangeDate(new Date(newTime));
  };

  const shiftDays = (days: number) => {
    onChangeDate(new Date(cosmic.date.getTime() + days * 86400000));
  };

  const pad = (n: number) => String(n).padStart(2, '0');
  const dtLocalValue = `${cosmic.date.getFullYear()}-${pad(
    cosmic.date.getMonth() + 1
  )}-${pad(cosmic.date.getDate())}T${pad(cosmic.date.getHours())}:${pad(
    cosmic.date.getMinutes()
  )}`;

  return (
    <footer className="mixed-script-container olam-panel safe-bottom pointer-events-auto w-full py-2 sm:py-2.5 sm:px-5 border-t z-30 shrink-0 flex flex-wrap items-center justify-between gap-2 sm:gap-3 transition-colors">
      {/* Left: Transport Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onTogglePlay}
          className="olam-btn-primary flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-sm"
        >
          {isPlaying ? (
            <>
              <Pause aria-hidden="true" className="w-3.5 h-3.5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play aria-hidden="true" className="w-3.5 h-3.5" />
              <span>Walk</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() =>
            onChangeSpeed(
              playSpeedHoursPerSec === 0.25
                ? 1
                : playSpeedHoursPerSec === 1
                ? 6
                : playSpeedHoursPerSec === 6
                ? 24
                : 0.25
            )
          }
          className="olam-pill px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs mono-telemetry cursor-pointer"
          title="Click to cycle playback speed (15m/s, 1h/s, 6h/s, 1d/s)"
        >
          {playSpeedHoursPerSec === 0.25
            ? '15m/s'
            : playSpeedHoursPerSec === 1
            ? '1h/s'
            : playSpeedHoursPerSec === 6
            ? '6h/s'
            : '1d/s'}
        </button>

        <button
          type="button"
          onClick={() => shiftDays(-1)}
          aria-label="Back 1 Day"
          className="olam-pill px-2 py-1.5 rounded-lg border text-xs font-medium flex items-center justify-center cursor-pointer"
          title="Back 1 Day"
        >
          <ChevronLeft aria-hidden="true" className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">1d</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeDate(new Date())}
          className="olam-pill px-2.5 py-1.5 rounded-lg border text-xs font-semibold olam-accent flex items-center justify-center gap-1 cursor-pointer"
          title="Jump back to Right Now"
        >
          <RotateCcw aria-hidden="true" className="w-3 h-3" />
          <span>Today</span>
        </button>

        <button
          type="button"
          onClick={() => shiftDays(1)}
          aria-label="Forward 1 Day"
          className="olam-pill px-2 py-1.5 rounded-lg border text-xs font-medium flex items-center justify-center cursor-pointer"
          title="Forward 1 Day"
        >
          <span className="hidden xs:inline">1d</span>
          <ChevronRight aria-hidden="true" className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right / Mobile Top-Right: One-Click Cosmic Jumps */}
      <div className="flex items-center gap-1 sm:gap-1.5 lg:order-3">
        <button
          type="button"
          onClick={() => onChangeDate(cosmic.lunar.nextNewMoon)}
          className="olam-pill flex items-center justify-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors"
          title="Jump to Next New Moon (Rosh Chodesh / Molad)"
        >
          <Moon aria-hidden="true" className="w-3.5 h-3.5 text-sky-700" />
          <span className="hidden sm:inline">New Moon</span>
          <span className="sm:hidden">New</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeDate(cosmic.lunar.nextFullMoon)}
          className="olam-pill flex items-center justify-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors"
          title="Jump to Next Full Moon (15th of the Hebrew Month)"
        >
          <Sun aria-hidden="true" className="w-3.5 h-3.5 olam-accent" />
          <span className="hidden sm:inline">Full Moon</span>
          <span className="sm:hidden">Full</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeDate(cosmic.lunar.nextLunarEclipse.date)}
          className="olam-pill hidden md:flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors"
          title="Jump to Next Lunar Eclipse"
        >
          <Eclipse aria-hidden="true" className="w-3.5 h-3.5 text-rose-700" />
          <span>Eclipse</span>
        </button>

        <button
          type="button"
          onClick={onQuickSaveCurrentDate}
          aria-label="Save Current Cosmic Moment"
          className="olam-pill flex items-center justify-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-semibold olam-accent cursor-pointer transition-colors"
        >
          <PlusCircle aria-hidden="true" className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>

      {/* Center / Full-Width Mobile Row: Smooth Timeline Slider + Date Picker */}
      <div className="flex items-center gap-2.5 w-full lg:w-auto lg:flex-1 lg:max-w-xl lg:order-2">
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-6 cursor-pointer"
          value={[Math.max(0, Math.min(365, dayOfYearFloat))]}
          max={365}
          step={0.05}
          onValueChange={handleSliderChange}
          aria-label="Scrub through the year"
        >
          <Slider.Track className="bg-slate-900/15 relative grow rounded-full h-1.5 overflow-hidden">
            <Slider.Range className="absolute bg-gradient-to-r from-slate-600 to-[var(--accent-gold)] rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb className="block w-4 h-4 bg-[var(--btn-primary-bg)] border border-white/60 rounded-full shadow-md focus:outline-none" />
        </Slider.Root>

        <input
          type="datetime-local"
          aria-label="Pick exact date and time"
          value={dtLocalValue}
          onChange={(e) => {
            if (e.target.value) {
              const parsed = new Date(e.target.value);
              if (!Number.isNaN(parsed.getTime())) {
                onChangeDate(parsed);
              }
            }
          }}
          className="hidden md:block mono-telemetry text-xs olam-pill border rounded-lg px-2.5 py-1.5 focus:outline-none shrink-0"
        />
      </div>
    </footer>
  );
};
