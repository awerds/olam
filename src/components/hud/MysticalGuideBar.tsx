import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, X, GraduationCap } from 'lucide-react';
import type { CameraMode } from '../canvas/CosmicScene';

interface MysticalGuideBarProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeCameraMode: (mode: CameraMode) => void;
  onToggleCube: (show: boolean) => void;
}

interface TourStep {
  step: number;
  title: string;
  subtitle: string;
  cameraMode: CameraMode;
  showCube: boolean;
  plainExplanation: string;
  whatToLookAt: string;
  everydayBenefit: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    step: 1,
    title: '1. The Sun & Moon Relationship',
    subtitle: 'Why the Lunar Month Has a Heartbeat',
    cameraMode: 'sanctuary',
    showCube: false,
    plainExplanation:
      'In Kabbalah, the Sun represents the giver of light (Tiferet) and the Moon represents the vessel that receives and reflects light into our world (Malkhut). Every 29.5 days they complete a dance: at the New Moon, the vessel empties itself to start fresh; on the 15th night (Full Moon), Sun and Moon stand face-to-face in peak illumination.',
    whatToLookAt:
      'Look at the vertical golden beam at the bottom of the Tree of Life. As you drag the bottom timeline slider from New Moon to Full Moon, watch that beam brighten and thicken.',
    everydayBenefit:
      'Use the first 15 days of a lunar month (Waxing) to launch projects and build outward momentum; use the second 15 days (Waning) to reflect, finish open loops, and rest.',
  },
  {
    step: 2,
    title: '2. The 22 Building Blocks (Sefer Yetzirah)',
    subtitle: 'How Letters Connect Space, Time & Human Strengths',
    cameraMode: 'sanctuary',
    showCube: true,
    plainExplanation:
      'The ancient Book of Formation (Sefer Yetzirah) teaches that reality is built from 22 pathways: 3 Mother letters (the 3 seasons/elements), 7 Double letters (the 7 planets and 7 days of the week), and 12 Simple letters (the 12 Zodiac signs, 12 lunar months, and 12 human strengths like speech, vision, and action).',
    whatToLookAt:
      'Look at the glowing Cube around the Tree of Life. Its 12 outer edges represent the 12 months of the year—the brightest golden edge is the current Hebrew month.',
    everydayBenefit:
      'Each month highlights one human faculty (like Speech in Nisan or Action in Elul) so you can focus on improving one core life skill per month.',
  },
  {
    step: 3,
    title: '3. The 7 Planetary Rings & Daily Hours',
    subtitle: 'Matching Your Daily Tasks to the Right Rhythm',
    cameraMode: 'astrolabe',
    showCube: true,
    plainExplanation:
      'Surrounding the center are the 7 classical planetary spheres (Moon, Mercury, Venus, Sun, Mars, Jupiter, Saturn). Daylight and night are each divided into 12 proportional hours, and each hour is ruled by one of these 7 qualities.',
    whatToLookAt:
      'Find the planet with the bright golden ring around it—that planet rules the current hour and illuminates its matching node on the Tree of Life.',
    everydayBenefit:
      'Check the current hour in the left panel: do deep writing/coding in a Mercury hour, set boundaries or exercise in a Mars hour, and have big-picture or generous conversations in a Jupiter hour.',
  },
  {
    step: 4,
    title: '4. Harmonizing Moon & Sun (The 19-Year Cycle)',
    subtitle: 'Why Jewish Holidays Stay in Their Seasons',
    cameraMode: 'topdown',
    showCube: false,
    plainExplanation:
      'Twelve lunar months are only 354 days—11 days shorter than the 365-day solar year. Left alone, the lunar months would drift across the seasons. The Hebrew calendar solves this with "The Secret of Intercalation" (Sod Ha’Ibbur): 7 times every 19 years, a 13th leap month is added so Spring and Autumn always stay aligned.',
    whatToLookAt:
      'From this top-down view, see the 12 Zodiac constellations on the outer brass ring and the dashed Eclipse Node line (the Teli) cutting across the center.',
    everydayBenefit:
      'Balancing the Moon and Sun mirrors balancing our changing emotional rhythms (Moon) with steady long-term structure (Sun).',
  },
  {
    step: 5,
    title: '5. Time Is an Ascending Spiral, Not a Circle',
    subtitle: 'Walking Through the 4D Time-Helix',
    cameraMode: 'helix',
    showCube: false,
    plainExplanation:
      'When you look at planets from above, they seem to go in flat circles—repeating the same loop forever. But because we are moving forward through time, every circle is actually a 3D spiral (Helix). Each year you revisit the same seasons and holidays, but at a higher level of growth.',
    whatToLookAt:
      'Here the circular orbits unfold into a 3D tunnel: the gold line is the Sun, the silver spiral is the Moon, and the glowing rings are New Moon and Full Moon gateways you can click.',
    everydayBenefit:
      'When an old life theme returns, you aren’t "back at square one"—you are passing that same point on the spiral one level higher.',
  },
];

export const MysticalGuideBar: React.FC<MysticalGuideBarProps> = ({
  isOpen,
  onClose,
  onChangeCameraMode,
  onToggleCube,
}) => {
  const [tourIndex, setTourIndex] = useState(0);

  if (!isOpen) return null;

  const applyTourStep = (idx: number) => {
    const clamped = (idx + TOUR_STEPS.length) % TOUR_STEPS.length;
    setTourIndex(clamped);
    const step = TOUR_STEPS[clamped];
    onChangeCameraMode(step.cameraMode);
    onToggleCube(step.showCube);
  };

  const activeTour = TOUR_STEPS[tourIndex];

  return (
    <section className="mixed-script-container olam-panel pointer-events-auto absolute right-3 top-3 max-h-[calc(100%-1.5rem)] z-30 w-[23rem] max-w-[92vw] rounded-2xl backdrop-blur-2xl border shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 olam-accent" />
          <h2 className="display-title text-sm font-semibold olam-text-primary">
            5-Step Interactive Guide
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Interactive Guide"
          className="p-1.5 rounded-lg olam-text-muted hover:olam-text-primary cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-3.5 text-sm overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium olam-text-muted">
            Step {activeTour.step} of {TOUR_STEPS.length}
          </span>
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.step}
                type="button"
                onClick={() => applyTourStep(idx)}
                className={`w-5 h-1.5 rounded-full cursor-pointer transition-all ${
                  idx === tourIndex
                    ? 'bg-[var(--accent-gold)]'
                    : 'bg-slate-500/25'
                }`}
                aria-label={`Go to step ${s.step}`}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold olam-text-primary">
            {activeTour.title}
          </h3>
          <div className="text-xs olam-accent mt-0.5 font-medium">
            {activeTour.subtitle}
          </div>
        </div>

        <p className="text-sm olam-text-secondary">
          {activeTour.plainExplanation}
        </p>

        <div className="olam-card p-3 rounded-xl border space-y-1">
          <div className="text-xs font-semibold olam-accent">
            What to look at in 3D right now
          </div>
          <p className="text-xs olam-text-secondary">
            {activeTour.whatToLookAt}
          </p>
        </div>

        <div className="olam-card p-3 rounded-xl border-l-2 border-[var(--accent-gold)] space-y-1">
          <div className="text-xs font-semibold olam-text-primary">
            How you benefit from this
          </div>
          <p className="text-xs olam-text-secondary">
            {activeTour.everydayBenefit}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => applyTourStep(tourIndex - 1)}
            className="olam-pill px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </button>
          <button
            type="button"
            onClick={() => applyTourStep(tourIndex + 1)}
            className="olam-btn-primary px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1 cursor-pointer"
          >
            Next Lesson <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
