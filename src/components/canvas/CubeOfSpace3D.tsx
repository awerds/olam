import React from 'react';
import { Html, Line } from '@react-three/drei';
import {
  SEFER_YETZIRAH_LETTERS,
  type SeferYetzirahLetter,
} from '../../data/kabbalah';

interface CubeOfSpace3DProps {
  visible: boolean;
  activeMonthMazalIndex: number;
  onSelectLetter: (letter: SeferYetzirahLetter) => void;
}

const S = 2.6; // Half-size of the Cube of Space

const CUBE_VERTICES: Record<string, [number, number, number]> = {
  NEA: [S, S, -S], // North-East-Above
  NEB: [S, -S, -S], // North-East-Below
  SEA: [S, S, S], // South-East-Above
  SEB: [S, -S, S], // South-East-Below
  NWA: [-S, S, -S], // North-West-Above
  NWB: [-S, -S, -S], // North-West-Below
  SWA: [-S, S, S], // South-West-Above
  SWB: [-S, -S, S], // South-West-Below
};

const SIMPLE_EDGES: {
  zodiacIndex: number;
  from: [number, number, number];
  to: [number, number, number];
}[] = [
  { zodiacIndex: 0, from: CUBE_VERTICES.NEA, to: CUBE_VERTICES.NEB }, // He - Aries - NE
  { zodiacIndex: 1, from: CUBE_VERTICES.SEA, to: CUBE_VERTICES.SEB }, // Vav - Taurus - SE
  { zodiacIndex: 2, from: CUBE_VERTICES.NEA, to: CUBE_VERTICES.SEA }, // Zayin - Gemini - East-Above
  { zodiacIndex: 3, from: CUBE_VERTICES.NEB, to: CUBE_VERTICES.SEB }, // Chet - Cancer - East-Below
  { zodiacIndex: 4, from: CUBE_VERTICES.NEA, to: CUBE_VERTICES.NWA }, // Tet - Leo - North-Above
  { zodiacIndex: 5, from: CUBE_VERTICES.NEB, to: CUBE_VERTICES.NWB }, // Yod - Virgo - North-Below
  { zodiacIndex: 6, from: CUBE_VERTICES.NWA, to: CUBE_VERTICES.NWB }, // Lamed - Libra - NW
  { zodiacIndex: 7, from: CUBE_VERTICES.SWA, to: CUBE_VERTICES.SWB }, // Nun - Scorpio - SW
  { zodiacIndex: 8, from: CUBE_VERTICES.NWA, to: CUBE_VERTICES.SWA }, // Samekh - Sagittarius - West-Above
  { zodiacIndex: 9, from: CUBE_VERTICES.NWB, to: CUBE_VERTICES.SWB }, // Ayin - Capricorn - West-Below
  { zodiacIndex: 10, from: CUBE_VERTICES.SEA, to: CUBE_VERTICES.SWA }, // Tzadi - Aquarius - South-Above
  { zodiacIndex: 11, from: CUBE_VERTICES.SEB, to: CUBE_VERTICES.SWB }, // Qof - Pisces - South-Below
];

export const CubeOfSpace3D: React.FC<CubeOfSpace3DProps> = ({
  visible,
  activeMonthMazalIndex,
  onSelectLetter,
}) => {
  if (!visible) return null;

  const aleph = SEFER_YETZIRAH_LETTERS.find((l) => l.letter === 'א')!;
  const mem = SEFER_YETZIRAH_LETTERS.find((l) => l.letter === 'מ')!;
  const shin = SEFER_YETZIRAH_LETTERS.find((l) => l.letter === 'ש')!;

  return (
    <group position={[0, 0.2, 0]}>
      {/* 3 Mother Letter Internal Axes (Aleph: Up-Down, Mem: East-West, Shin: North-South) */}
      <Line
        points={[
          [0, -S, 0],
          [0, S, 0],
        ]}
        color="#93b4d1"
        lineWidth={1.1}
        dashed
        dashSize={0.2}
        gapSize={0.14}
        transparent
        opacity={0.45}
      />
      <Line
        points={[
          [-S, 0, 0],
          [S, 0, 0],
        ]}
        color="#88a8c4"
        lineWidth={1.1}
        dashed
        dashSize={0.2}
        gapSize={0.14}
        transparent
        opacity={0.45}
      />
      <Line
        points={[
          [0, 0, -S],
          [0, 0, S],
        ]}
        color="#c98276"
        lineWidth={1.1}
        dashed
        dashSize={0.2}
        gapSize={0.14}
        transparent
        opacity={0.45}
      />

      {/* Mother Letter Badges */}
      {[
        { letter: aleph, pos: [0, S * 0.65, 0] as [number, number, number], color: '#93b4d1' },
        { letter: mem, pos: [S * 0.65, 0, 0] as [number, number, number], color: '#88a8c4' },
        { letter: shin, pos: [0, 0, S * 0.65] as [number, number, number], color: '#c98276' },
      ].map(({ letter, pos, color }) => (
        <Html
          key={letter.letter}
          position={pos}
          center
          distanceFactor={14}
          zIndexRange={[5, 0]}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectLetter(letter);
            }}
            style={{ borderColor: color }}
            className="hebrew-glyph px-1.5 py-0.5 rounded bg-[#0c101b]/90 border text-xs font-bold text-white shadow cursor-pointer"
            title={`Mother Letter ${letter.name}: ${letter.cubeDirection}`}
          >
            {letter.letter}
          </button>
        </Html>
      ))}

      {/* 12 Simple Letters along the 12 Edges of the Cube of Space */}
      {SIMPLE_EDGES.map((edge) => {
        const letter = SEFER_YETZIRAH_LETTERS.find(
          (l) => l.zodiacIndex === edge.zodiacIndex
        );
        const isActive = edge.zodiacIndex === activeMonthMazalIndex;
        const mid: [number, number, number] = [
          (edge.from[0] + edge.to[0]) / 2,
          (edge.from[1] + edge.to[1]) / 2,
          (edge.from[2] + edge.to[2]) / 2,
        ];

        return (
          <group key={edge.zodiacIndex}>
            <Line
              points={[edge.from, edge.to]}
              color={isActive ? '#e5c378' : '#8a7248'}
              lineWidth={isActive ? 2.8 : 1.1}
              transparent
              opacity={isActive ? 0.95 : 0.42}
            />
            {letter && (
              <Html
                position={mid}
                center
                distanceFactor={16}
                zIndexRange={[5, 0]}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLetter(letter);
                  }}
                  className={`hebrew-glyph text-[10px] px-1 rounded border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#c8a45c] text-[#06070b] border-[#f2ece1] font-bold'
                      : 'bg-[#080a11]/80 text-[#c8a45c] border-[#c8a45c]/30 hover:border-[#c8a45c]'
                  }`}
                >
                  {letter.letter}
                </button>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};

