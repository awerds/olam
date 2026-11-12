import React, { useMemo } from 'react';
import { Html, Line } from '@react-three/drei';
import { HDate } from '@hebcal/core';
import { generateTimeHelix } from '../../engines/astronomy';

interface TimeHelix3DProps {
  centerDate: Date;
  visible: boolean;
  onSelectDate: (date: Date) => void;
}

export const TimeHelix3D: React.FC<TimeHelix3DProps> = ({
  centerDate,
  visible,
  onSelectDate,
}) => {
  const points = useMemo(() => {
    if (!visible) return [];
    return generateTimeHelix(centerDate, 65);
  }, [centerDate, visible]);

  if (!visible || points.length === 0) return null;

  const sunCurve = points.map((p) => p.sunPos);
  const moonCurve = points.map((p) => p.moonPos);

  return (
    <group>
      {/* Central Time Axis Spine (Past -> Present -> Future) */}
      <Line
        points={[
          [0, 0, -20],
          [0, 0, 20],
        ]}
        color="#c8a45c"
        lineWidth={1.5}
        dashed
        dashSize={0.4}
        gapSize={0.2}
      />

      {/* Braided Solar Helix (Chamah / Tiferet) */}
      <Line
        points={sunCurve}
        color="#fbbf24"
        lineWidth={2.2}
        transparent
        opacity={0.85}
      />

      {/* Braided Lunar Helix (Levanah / Yesod-Malkhut) */}
      <Line
        points={moonCurve}
        color="#e2e8f0"
        lineWidth={1.8}
        transparent
        opacity={0.8}
      />

      {/* Rosh Chodesh (New Moon) & 15th Full Moon Spatial Gateways */}
      {points.map((pt, i) => {
        if (!pt.isRoshChodesh && !pt.isFullMoon && pt.offsetDays !== 0) {
          return null;
        }
        // Deduplicate adjacent days of the same phase window
        if (
          i > 0 &&
          pt.offsetDays !== 0 &&
          ((pt.isRoshChodesh && points[i - 1].isRoshChodesh) ||
            (pt.isFullMoon && points[i - 1].isFullMoon))
        ) {
          return null;
        }

        const hd = new HDate(pt.date);
        const label =
          pt.offsetDays === 0
            ? 'NOW // ACTIVE PORTAL'
            : pt.isRoshChodesh
            ? `Rosh Chodesh ${hd.getMonthName()}`
            : `15 ${hd.getMonthName()} (Full Moon Union)`;

        const ringColor =
          pt.offsetDays === 0
            ? '#c8a45c'
            : pt.isRoshChodesh
            ? '#818cf8'
            : '#fbbf24';

        return (
          <group key={pt.date.toISOString()} position={[0, 0, pt.moonPos[2]]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelectDate(pt.date);
              }}
            >
              <ringGeometry args={[5.1, 5.3, 48]} />
              <meshBasicMaterial
                color={ringColor}
                transparent
                opacity={pt.offsetDays === 0 ? 0.9 : 0.45}
                side={2}
              />
            </mesh>

            {/* Solar-Lunar Chord at this Time Slice */}
            <Line
              points={[
                [pt.sunPos[0], pt.sunPos[1], 0],
                [pt.moonPos[0], pt.moonPos[1], 0],
              ]}
              color={ringColor}
              lineWidth={1.4}
              transparent
              opacity={0.7}
            />

            <Html
              position={[pt.moonPos[0], pt.moonPos[1] + 0.55, 0]}
              center
              distanceFactor={16}
              zIndexRange={[5, 0]}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDate(pt.date);
                }}
                className="px-2 py-0.5 rounded bg-[#0c0f1a]/95 border border-[#c8a45c]/70 text-[10px] text-[#f2ece1] hover:border-[#fbbf24] whitespace-nowrap cursor-pointer shadow"
              >
                <span className="font-semibold text-[#fbbf24]">{label}</span>
                <span className="ml-1.5 opacity-75 mono-telemetry">
                  ({pt.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                </span>
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

