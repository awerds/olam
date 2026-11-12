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
    <footer className="mixed-script-container olam-panel pointer-events-auto w-full min-h-[3.5rem] py-2 px-6 backdrop-blur-2xl border-t z-20 flex flex-wrap items-center justify-between gap-3 transition-colors">
      {/* Left: Transport Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onTogglePlay}
          className="olam-btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-sm"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5" /> Pause
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" /> Walk Time
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
          className="olam-pill px-2.5 py-1.5 rounded-lg border text-xs mono-telemetry cursor-pointer"
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
          className="olam-pill px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center cursor-pointer"
          title="Back 1 Day"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> 1d
        </button>

        <button
          type="button"
          onClick={() => onChangeDate(new Date())}
          className="olam-pill px-2.5 py-1.5 rounded-lg border text-xs font-semibold olam-accent flex items-center gap-1 cursor-pointer"
          title="Jump back to Right Now"
        >
          <RotateCcw className="w-3 h-3" /> Today
        </button>

        <button
          type="button"
          onClick={() => shiftDays(1)}
          className="olam-pill px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center cursor-pointer"
          title="Forward 1 Day"
        >
          1d <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center: Smooth Timeline Slider + Date Picker */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5 cursor-pointer"
          value={[Math.max(0, Math.min(365, dayOfYearFloat))]}
          max={365}
          step={0.05}
          onValueChange={handleSliderChange}
          aria-label="Scrub through the year"
        >
          <Slider.Track className="bg-slate-500/20 relative grow rounded-full h-1.5 overflow-hidden">
            <Slider.Range className="absolute bg-gradient-to-r from-slate-400 to-[var(--accent-gold)] rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb className="block w-3.5 h-3.5 bg-[var(--btn-primary-bg)] border border-[var(--border-subtle)] rounded-full shadow-md focus:outline-none" />
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
          className="hidden sm:block mono-telemetry text-xs olam-pill border rounded-lg px-2.5 py-1.5 focus:outline-none"
        />
      </div>

      {/* Right: One-Click Cosmic Jumps */}
      <div className="hidden lg:flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onChangeDate(cosmic.lunar.nextNewMoon)}
          className="olam-pill flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors"
          title="Jump to Next New Moon (Rosh Chodesh / Molad)"
        >
          <Moon className="w-3.5 h-3.5 text-[#93b4d1]" />
          <span>New Moon</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeDate(cosmic.lunar.nextFullMoon)}
          className="olam-pill flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors"
          title="Jump to Next Full Moon (15th of the Hebrew Month)"
        >
          <Sun className="w-3.5 h-3.5 olam-accent" />
          <span>Full Moon</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeDate(cosmic.lunar.nextLunarEclipse.date)}
          className="olam-pill flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors"
          title="Jump to Next Lunar Eclipse"
        >
          <Eclipse className="w-3.5 h-3.5 text-[#c98276]" />
          <span>Eclipse</span>
        </button>

        <button
          type="button"
          onClick={onQuickSaveCurrentDate}
          className="olam-pill flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold olam-accent cursor-pointer transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Save</span>
        </button>
      </div>
    </footer>
  );
};
