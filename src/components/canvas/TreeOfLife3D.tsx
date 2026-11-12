import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import {
  SEFIROT,
  SEFER_YETZIRAH_LETTERS,
  type SefirahData,
  type SefirahId,
  type SeferYetzirahLetter,
} from '../../data/kabbalah';
import type { CosmicSnapshot } from '../../engines/astronomy';
import type { HebrewMysticalTime } from '../../engines/hebrewTime';
import { GlowHalo, OphanimGimbal } from './CelestialMaterials';

interface TreeOfLife3DProps {
  cosmic: CosmicSnapshot;
  hebrewTime: HebrewMysticalTime;
  pathSystem: 'gra' | 'ari';
  selectedId: string | null;
  onSelectSefirah: (sefirah: SefirahData) => void;
  onSelectLetter: (letter: SeferYetzirahLetter) => void;
}

/**
 * Animated pulse of Divine Influx (Shefa) traveling along a path between two Sefirot
 */
const ShefaPulse: React.FC<{
  from: [number, number, number];
  to: [number, number, number];
  color: string;
  speed?: number;
  offset?: number;
}> = ({ from, to, color, speed = 0.14, offset = 0 }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.getElapsedTime() * speed + offset) % 1;
    ref.current.position.set(
      from[0] + (to[0] - from[0]) * t,
      from[1] + (to[1] - from[1]) * t,
      from[2] + (to[2] - from[2]) * t
    );
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.065, 16, 16]} />
      <meshBasicMaterial color={color} />
      <GlowHalo color={color} size={0.45} opacity={0.65} />
    </mesh>
  );
};

export const TreeOfLife3D: React.FC<TreeOfLife3DProps> = ({
  cosmic,
  hebrewTime,
  pathSystem,
  selectedId,
  onSelectSefirah,
  onSelectLetter,
}) => {
  const sefirotMap = useMemo(() => {
    const map = {} as Record<SefirahId, SefirahData>;
    for (const s of SEFIROT) map[s.id] = s;
    return map;
  }, []);

  const activeHourPlanet = hebrewTime.planetaryHours.current.planet.key;
  const activeSimpleNumber = hebrewTime.activeSimpleLetter.number;
  const activeMotherNumber = hebrewTime.tekufah.motherLetter.number;

  return (
    <group>
      {/* Subtle 3 Vertical Pillar Axes (Mercy, Equilibrium, Severity) */}
      <Line
        points={[
          [2.3, 4.8, 0],
          [2.3, -2.5, 0],
        ]}
        color="#3b82f6"
        lineWidth={0.7}
        transparent
        opacity={0.18}
        dashed
        dashSize={0.2}
        gapSize={0.15}
      />
      <Line
        points={[
          [-2.3, 4.8, 0],
          [-2.3, -2.5, 0],
        ]}
        color="#ef4444"
        lineWidth={0.7}
        transparent
        opacity={0.18}
        dashed
        dashSize={0.2}
        gapSize={0.15}
      />
      <Line
        points={[
          [0, 5.8, 0],
          [0, -5.6, 0],
        ]}
        color="#fbbf24"
        lineWidth={0.9}
        transparent
        opacity={0.22}
        dashed
        dashSize={0.25}
        gapSize={0.15}
      />

      {/* 22 Paths of Sefer Yetzirah */}
      {SEFER_YETZIRAH_LETTERS.map((letter, idx) => {
        const [fromId, toId] =
          pathSystem === 'gra' ? letter.graPath : letter.ariPath;
        const fromSef = sefirotMap[fromId];
        const toSef = sefirotMap[toId];
        if (!fromSef || !toSef) return null;

        const isActiveHourDouble =
          letter.planetKey && letter.planetKey === activeHourPlanet;
        const isActiveMonthSimple = letter.number === activeSimpleNumber;
        const isActiveSeasonMother = letter.number === activeMotherNumber;
        const isSelected = selectedId === `letter-${letter.number}`;
        const isLit =
          isActiveHourDouble ||
          isActiveMonthSimple ||
          isActiveSeasonMother ||
          isSelected;

        const midPoint: [number, number, number] = [
          (fromSef.position[0] + toSef.position[0]) / 2,
          (fromSef.position[1] + toSef.position[1]) / 2,
          (fromSef.position[2] + toSef.position[2]) / 2,
        ];

        const pathColor = isSelected
          ? '#e5c687'
          : isActiveMonthSimple
          ? '#e5c687'
          : isActiveHourDouble
          ? '#93b4d1'
          : isActiveSeasonMother
          ? '#c98276'
          : '#475569';

        return (
          <group key={letter.number}>
            <Line
              points={[fromSef.position, toSef.position]}
              color={pathColor}
              lineWidth={isLit ? 2.2 : 1.0}
              transparent
              opacity={isLit ? 0.82 : 0.28}
            />
            {isLit && (
              <ShefaPulse
                from={fromSef.position}
                to={toSef.position}
                color={pathColor}
                speed={0.14}
                offset={(idx * 0.17) % 1}
              />
            )}
            <Html position={midPoint} center distanceFactor={15}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLetter(letter);
                }}
                title={`Path ${letter.number}: ${letter.name} (${letter.olam})`}
                className={`hebrew-glyph flex items-center justify-center w-5 h-5 rounded-full text-xs transition-all cursor-pointer border ${
                  isLit
                    ? 'bg-[#14120c]/90 text-[#e5c687] border-[#e5c687]/80 scale-110 shadow-[0_0_10px_rgba(229,198,135,0.45)]'
                    : 'bg-[#090b11]/75 text-[#94a3b8] border-white/10 hover:border-[#cbb282] hover:text-white'
                }`}
              >
                {letter.letter}
              </button>
            </Html>
          </group>
        );
      })}

      {/* Zoharic Solar-Lunar Conduit (Tiferet -> Yesod -> Malkhut) */}
      <Line
        points={[
          sefirotMap.tiferet.position,
          sefirotMap.yesod.position,
          sefirotMap.malkhut.position,
        ]}
        color="#e5c687"
        lineWidth={1.6 + cosmic.lunar.illumination * 2.8}
        transparent
        opacity={0.35 + cosmic.lunar.illumination * 0.45}
      />
      <ShefaPulse
        from={sefirotMap.tiferet.position}
        to={sefirotMap.yesod.position}
        color="#e5c687"
        speed={0.16}
        offset={0}
      />
      <ShefaPulse
        from={sefirotMap.yesod.position}
        to={sefirotMap.malkhut.position}
        color="#e2e8f0"
        speed={0.16}
        offset={0.5}
      />

      {/* 10 Sefirot Crystalline Vessels & Ophanim Gimbals */}
      {SEFIROT.map((sefirah, idx) => {
        const isRulingHour = sefirah.planetKey === activeHourPlanet;
        const isOmerActive =
          hebrewTime.omer &&
          (hebrewTime.omer.innerSefirah.id === sefirah.id ||
            hebrewTime.omer.outerSefirah.id === sefirah.id);
        const isSelected = selectedId === `sefirah-${sefirah.id}`;
        const highlight = Boolean(isRulingHour || isOmerActive || isSelected);

        const radius =
          sefirah.id === 'tiferet' || sefirah.id === 'keter' ? 0.42 : 0.35;

        return (
          <group key={sefirah.id} position={sefirah.position}>
            {/* Inner Radiant Seed Point */}
            <mesh>
              <sphereGeometry args={[radius * 0.52, 24, 24]} />
              <meshBasicMaterial color={sefirah.color} />
            </mesh>

            {/* Outer Crystalline Glass Vessel (Keli) */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelectSefirah(sefirah);
              }}
            >
              <sphereGeometry args={[radius, 36, 36]} />
              <meshPhysicalMaterial
                color={sefirah.color}
                emissive={sefirah.color}
                emissiveIntensity={highlight ? 0.95 : 0.38}
                roughness={0.12}
                metalness={0.25}
                transmission={0.55}
                thickness={0.8}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>

            {/* Volumetric Bloom Halo */}
            <GlowHalo
              color={sefirah.color}
              size={radius * (highlight ? 5.6 : 3.8)}
              opacity={highlight ? 0.78 : 0.42}
            />

            {/* Counter-Rotating Ophanim Brass Gimbals */}
            <OphanimGimbal
              radius={radius}
              color={sefirah.color}
              speed={0.1 + (idx % 3) * 0.04}
              highlight={highlight}
            />

            {/* Sefirah Hebrew & English Label */}
            <Html
              position={[0, radius + 0.42, 0]}
              center
              distanceFactor={14}
              zIndexRange={[5, 0]}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSefirah(sefirah);
                }}
                className={`px-2.5 py-1 rounded-lg border backdrop-blur-md transition-all cursor-pointer whitespace-nowrap text-center ${
                  highlight
                    ? 'bg-[#12131a]/90 border-[#e5c687]/80 text-zinc-100 shadow-[0_0_14px_rgba(229,198,135,0.35)] scale-105'
                    : 'bg-[#090b12]/72 border-white/[0.08] text-zinc-300 hover:border-white/25'
                }`}
              >
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="hebrew-glyph text-xs font-semibold leading-none text-[#e5c687]">
                    {sefirah.hebrew}
                  </span>
                  <span className="text-xs font-semibold leading-none text-zinc-100">
                    {sefirah.translit}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 leading-tight mt-0.5">
                  {sefirah.title.split(' / ')[0]}
                </div>
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
