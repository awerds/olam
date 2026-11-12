import React, { useMemo } from 'react';
import { Html, Line } from '@react-three/drei';
import {
  MAZALOT,
  SHEM_HAMEPHORASH_72,
  type MazalInfo,
} from '../../data/kabbalah';

interface MazalotRingProps {
  activeMonthMazalIndex: number;
  sunShemNumber: number;
  moonShemNumber: number;
  diurnalShemNumber: number;
  selectedId: string | null;
  onSelectMazal: (mazal: MazalInfo) => void;
}

const INNER_R = 13.0;
const OUTER_R = 14.3;
const SHEM_R = 15.2;

function createRingPoints(radius: number, segments = 128): [number, number, number][] {
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    pts.push([radius * Math.cos(theta), 0, -radius * Math.sin(theta)]);
  }
  return pts;
}

export const MazalotRing: React.FC<MazalotRingProps> = ({
  activeMonthMazalIndex,
  sunShemNumber,
  moonShemNumber,
  diurnalShemNumber,
  selectedId,
  onSelectMazal,
}) => {
  const innerCircle = useMemo(() => createRingPoints(INNER_R), []);
  const outerCircle = useMemo(() => createRingPoints(OUTER_R), []);
  const shemCircle = useMemo(() => createRingPoints(SHEM_R), []);

  return (
    <group>
      {/* 3D Burnished-Brass Astrolabe Torus Rims */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[INNER_R, 0.045, 16, 128]} />
        <meshStandardMaterial
          color="#c8a45c"
          emissive="#c8a45c"
          emissiveIntensity={0.28}
          metalness={0.9}
          roughness={0.18}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[OUTER_R, 0.06, 16, 128]} />
        <meshStandardMaterial
          color="#e5c378"
          emissive="#c8a45c"
          emissiveIntensity={0.35}
          metalness={0.92}
          roughness={0.15}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[SHEM_R, 0.03, 16, 128]} />
        <meshStandardMaterial
          color="#8a7248"
          emissive="#8a7248"
          emissiveIntensity={0.2}
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>

      {/* Tilted Celestial Equatorial & Meridian Armillary Hoops */}
      <mesh rotation={[Math.PI / 2 + 0.41, 0, 0]}>
        <torusGeometry args={[SHEM_R * 1.02, 0.022, 12, 128]} />
        <meshStandardMaterial
          color="#c8a45c"
          metalness={0.85}
          roughness={0.25}
          transparent
          opacity={0.28}
        />
      </mesh>
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[SHEM_R * 1.03, 0.018, 12, 128]} />
        <meshStandardMaterial
          color="#818cf8"
          metalness={0.8}
          roughness={0.3}
          transparent
          opacity={0.16}
        />
      </mesh>

      {/* Crisp Accent Lines */}
      <Line
        points={innerCircle}
        color="#e5c378"
        lineWidth={1.2}
        transparent
        opacity={0.45}
      />
      <Line
        points={outerCircle}
        color="#fbbf24"
        lineWidth={1.5}
        transparent
        opacity={0.55}
      />
      <Line
        points={shemCircle}
        color="#c8a45c"
        lineWidth={0.9}
        transparent
        opacity={0.35}
      />

      {/* 12 Mazalot & Hebrew Months Gates */}
      {MAZALOT.map((mazal) => {
        const startRad = (mazal.startDegree * Math.PI) / 180;
        const midRad = ((mazal.startDegree + 15) * Math.PI) / 180;
        const midR = (INNER_R + OUTER_R) / 2;

        const spokeFrom: [number, number, number] = [
          INNER_R * Math.cos(startRad),
          0,
          -INNER_R * Math.sin(startRad),
        ];
        const spokeTo: [number, number, number] = [
          SHEM_R * Math.cos(startRad),
          0,
          -SHEM_R * Math.sin(startRad),
        ];

        const labelPos: [number, number, number] = [
          midR * Math.cos(midRad),
          0.18,
          -midR * Math.sin(midRad),
        ];

        const isActiveMonth = mazal.index === activeMonthMazalIndex;
        const isSelected = selectedId === `mazal-${mazal.index}`;

        return (
          <group key={mazal.index}>
            <Line
              points={[spokeFrom, spokeTo]}
              color={isActiveMonth ? '#fbbf24' : '#c8a45c'}
              lineWidth={isActiveMonth ? 2.2 : 1.2}
              transparent
              opacity={isActiveMonth ? 0.85 : 0.5}
            />
            <Html position={labelPos} center distanceFactor={18}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectMazal(mazal);
                }}
                className={`px-2.5 py-1 rounded-lg border backdrop-blur-md transition-all cursor-pointer whitespace-nowrap text-center ${
                  isActiveMonth || isSelected
                    ? 'bg-[#12131a]/90 border-[#e5c687]/80 text-zinc-100 shadow-[0_0_16px_rgba(229,198,135,0.35)] scale-105'
                    : 'bg-[#090b12]/72 border-white/[0.08] text-zinc-300 hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-xs text-[#e5c687]">{mazal.symbol}</span>
                  <span className="text-xs font-semibold text-zinc-100">
                    {mazal.westernName}
                  </span>
                  <span className="hebrew-glyph text-xs text-zinc-400">
                    {mazal.hebrew}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 leading-tight">
                  {mazal.hebrewMonth} • {mazal.senseFaculty.split(' (')[0]}
                </div>
              </button>
            </Html>
          </group>
        );
      })}

      {/* Highlighted 72 Names of God (Shem HaMephorash) on the Outer Crown */}
      {SHEM_HAMEPHORASH_72.map((shem, idx) => {
        const isSun = shem.number === sunShemNumber;
        const isMoon = shem.number === moonShemNumber;
        const isDiurnal = shem.number === diurnalShemNumber;

        const deg = idx * 5 + 2.5;
        const rad = (deg * Math.PI) / 180;
        const pos: [number, number, number] = [
          SHEM_R * Math.cos(rad),
          0.28,
          -SHEM_R * Math.sin(rad),
        ];

        const tickIn: [number, number, number] = [
          OUTER_R * Math.cos((idx * 5 * Math.PI) / 180),
          0,
          -OUTER_R * Math.sin((idx * 5 * Math.PI) / 180),
        ];
        const tickOut: [number, number, number] = [
          SHEM_R * Math.cos((idx * 5 * Math.PI) / 180),
          0,
          -SHEM_R * Math.sin((idx * 5 * Math.PI) / 180),
        ];

        const isHighlighted = isSun || isMoon || isDiurnal;

        return (
          <group key={shem.number}>
            <Line
              points={[tickIn, tickOut]}
              color={isHighlighted ? '#fbbf24' : '#8a7248'}
              lineWidth={isHighlighted ? 2.0 : 0.6}
              transparent
              opacity={isHighlighted ? 0.95 : 0.3}
            />
            {isHighlighted && (
              <Html position={pos} center distanceFactor={18}>
                <div
                  className="px-1.5 py-0.5 rounded bg-[#14110b]/95 border border-[#fbbf24] text-center whitespace-nowrap shadow-[0_0_14px_rgba(251,191,36,0.5)]"
                  title={`72 Name #${shem.number} (${shem.translit}): ${shem.kavvanah}`}
                >
                  <div className="hebrew-glyph text-xs font-bold text-[#fbbf24]">
                    {shem.hebrew}
                  </div>
                  <div className="text-[8px] uppercase tracking-wider text-[#f2ece1]/90">
                    #{shem.number}{' '}
                    {isSun ? '☉ Sun' : isMoon ? '☽ Moon' : '⧖ Hour'}
                  </div>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};
