import React, { useMemo } from 'react';
import { Html, Line } from '@react-three/drei';
import type { CosmicSnapshot, PlanetEphemeris } from '../../engines/astronomy';
import type { PlanetKey } from '../../data/kabbalah';
import {
  GlowHalo,
  SolarLitPlanetSphere,
  SolarPlasmaSphere,
} from './CelestialMaterials';

interface PlanetarySpheresProps {
  cosmic: CosmicSnapshot;
  rulingHourPlanet: PlanetKey;
  selectedId: string | null;
  showAspects: boolean;
  showTeli: boolean;
  onSelectPlanet: (planet: PlanetEphemeris) => void;
}

function buildCirclePoints(
  radius: number,
  segments = 128
): [number, number, number][] {
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    pts.push([radius * Math.cos(theta), 0, -radius * Math.sin(theta)]);
  }
  return pts;
}

function buildOrbitTrailArc(
  lonDeg: number,
  radius: number,
  isRetrograde: boolean,
  spanDeg = 24
): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const steps = 24;
  const dir = isRetrograde ? 1 : -1;
  for (let i = 0; i <= steps; i++) {
    const deg = lonDeg + dir * (i / steps) * spanDeg;
    const rad = (deg * Math.PI) / 180;
    pts.push([radius * Math.cos(rad), 0, -radius * Math.sin(rad)]);
  }
  return pts;
}

export const PlanetarySpheres: React.FC<PlanetarySpheresProps> = ({
  cosmic,
  rulingHourPlanet,
  selectedId,
  showAspects,
  showTeli,
  onSelectPlanet,
}) => {
  const sunPos = cosmic.planets.Sun.position3D;
  const moonPos = cosmic.planets.Moon.position3D;

  const orbitCircles = useMemo(() => {
    return cosmic.planetList.map((p) => ({
      key: p.info.key,
      radius: p.info.orbitRadius3D,
      color: p.info.color,
      pts: buildCirclePoints(p.info.orbitRadius3D),
    }));
  }, [cosmic.planetList]);

  const teliLine = useMemo(() => {
    const r = 12.2;
    const roshRad = (cosmic.teli.roshLongitude * Math.PI) / 180;
    const zanavRad = (cosmic.teli.zanavLongitude * Math.PI) / 180;
    const roshPos: [number, number, number] = [
      r * Math.cos(roshRad),
      0,
      -r * Math.sin(roshRad),
    ];
    const zanavPos: [number, number, number] = [
      r * Math.cos(zanavRad),
      0,
      -r * Math.sin(zanavRad),
    ];
    return { roshPos, zanavPos };
  }, [cosmic.teli]);

  return (
    <group>
      {/* Direct Solar-to-Lunar Illumination Ray (Tiferet illuminating Levanah) */}
      <Line
        points={[sunPos, moonPos]}
        color="#e5c687"
        lineWidth={0.9 + cosmic.lunar.illumination * 1.4}
        transparent
        opacity={0.18 + cosmic.lunar.illumination * 0.32}
        dashed
        dashSize={0.25}
        gapSize={0.15}
      />

      {/* 7 Concentric Restrained Champagne & Slate Orbital Rings */}
      {orbitCircles.map((orb) => {
        const isRuling = orb.key === rulingHourPlanet;
        return (
          <group key={orb.key}>
            <Line
              points={orb.pts}
              color={isRuling ? '#e5c687' : '#64748b'}
              lineWidth={isRuling ? 1.6 : 0.7}
              transparent
              opacity={isRuling ? 0.65 : 0.22}
            />
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry
                args={[orb.radius, isRuling ? 0.022 : 0.011, 12, 120]}
              />
              <meshStandardMaterial
                color={isRuling ? '#e5c687' : '#94a3b8'}
                emissive={isRuling ? '#cbb282' : '#475569'}
                emissiveIntensity={isRuling ? 0.35 : 0.08}
                metalness={0.85}
                roughness={0.25}
                transparent
                opacity={isRuling ? 0.75 : 0.25}
              />
            </mesh>
          </group>
        );
      })}

      {/* Teli Axis (Rosh HaTeli & Zanav HaTeli) */}
      {showTeli && (
        <group>
          <Line
            points={[teliLine.roshPos, teliLine.zanavPos]}
            color="#94a3b8"
            lineWidth={1.1}
            dashed
            dashSize={0.35}
            gapSize={0.2}
            transparent
            opacity={0.45}
          />
          <Html position={teliLine.roshPos} center distanceFactor={16}>
            <div
              className="px-2 py-0.5 rounded-full bg-[#0b0e17]/80 border border-white/15 text-[9px] text-[#cbd5e1] whitespace-nowrap"
              title="Rosh HaTeli (North Eclipse Node — Sefer Yetzirah 6:1)"
            >
              ☊ North Node ({Math.round(cosmic.teli.roshLongitude)}°)
            </div>
          </Html>
          <Html position={teliLine.zanavPos} center distanceFactor={16}>
            <div
              className="px-2 py-0.5 rounded-full bg-[#0b0e17]/75 border border-white/10 text-[9px] text-[#94a3b8] whitespace-nowrap"
              title="Zanav HaTeli (South Eclipse Node)"
            >
              ☋ South Node ({Math.round(cosmic.teli.zanavLongitude)}°)
            </div>
          </Html>
        </group>
      )}

      {/* Subtle Planetary Aspect Chords */}
      {showAspects &&
        cosmic.aspects.map((asp, idx) => {
          const pA = cosmic.planets[asp.planetA];
          const pB = cosmic.planets[asp.planetB];
          if (!pA || !pB) return null;
          const color =
            asp.harmony === 'union'
              ? '#e5c687'
              : asp.harmony === 'harmonic'
              ? '#88b3a4'
              : '#c98276';
          return (
            <Line
              key={`${asp.planetA}-${asp.planetB}-${idx}`}
              points={[pA.position3D, pB.position3D]}
              color={color}
              lineWidth={0.9}
              transparent
              opacity={0.26}
            />
          );
        })}

      {/* 7 Classical Planetary Bodies + Wake Trails */}
      {cosmic.planetList.map((eph) => {
        const isRuling = eph.info.key === rulingHourPlanet;
        const isSelected = selectedId === `planet-${eph.info.key}`;
        const sphereSize =
          eph.info.key === 'Sun'
            ? 0.52
            : eph.info.key === 'Moon'
            ? 0.38
            : eph.info.key === 'Jupiter' || eph.info.key === 'Saturn'
            ? 0.35
            : 0.28;

        const trailPts = buildOrbitTrailArc(
          eph.longitude,
          eph.info.orbitRadius3D,
          eph.isRetrograde,
          24
        );

        return (
          <group key={eph.info.key}>
            <Line
              points={trailPts}
              color={eph.isRetrograde ? '#c98276' : eph.info.color}
              lineWidth={1.8}
              transparent
              opacity={0.48}
            />

            <group position={eph.position3D}>
              {/* Subtle Radial Spoke to Center */}
              <Line
                points={[
                  [0, 0, 0],
                  [-eph.position3D[0], -eph.position3D[1], -eph.position3D[2]],
                ]}
                color={eph.info.color}
                lineWidth={0.6}
                transparent
                opacity={0.14}
              />

              {/* Secondary Moonlight PointLight on Moon */}
              {eph.info.key === 'Moon' && (
                <pointLight
                  color="#e2e8f0"
                  intensity={0.6 + cosmic.lunar.illumination * 1.4}
                  distance={14}
                  decay={1.6}
                />
              )}

              {/* Sun vs Solar-Lit Planets & Moon */}
              {eph.info.key === 'Sun' ? (
                <SolarPlasmaSphere
                  radius={sphereSize}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPlanet(eph);
                  }}
                />
              ) : (
                <>
                  <SolarLitPlanetSphere
                    radius={sphereSize}
                    baseColor={eph.info.color}
                    planetWorldPos={eph.position3D}
                    sunWorldPos={sunPos}
                    isHighlight={isRuling || isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPlanet(eph);
                    }}
                  />
                  <GlowHalo
                    color={eph.info.color}
                    size={sphereSize * (isRuling || isSelected ? 5.2 : 3.6)}
                    opacity={isRuling || isSelected ? 0.65 : 0.35}
                  />
                </>
              )}

              {/* Saturn's Ring System */}
              {eph.info.key === 'Saturn' && (
                <group rotation={[Math.PI / 2.4, 0.25, 0]}>
                  <mesh>
                    <ringGeometry
                      args={[sphereSize * 1.35, sphereSize * 1.9, 64]}
                    />
                    <meshStandardMaterial
                      color="#cbb282"
                      emissive="#8b95ad"
                      emissiveIntensity={0.25}
                      transparent
                      opacity={0.72}
                      side={2}
                    />
                  </mesh>
                  <mesh>
                    <ringGeometry
                      args={[sphereSize * 2.0, sphereSize * 2.35, 64]}
                    />
                    <meshStandardMaterial
                      color="#8b95ad"
                      transparent
                      opacity={0.38}
                      side={2}
                    />
                  </mesh>
                </group>
              )}

              {/* Ruling Planetary Hour Champagne Ring */}
              {(isRuling || isSelected) && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[sphereSize * 1.62, 0.024, 16, 48]} />
                  <meshBasicMaterial color="#e5c687" />
                </mesh>
              )}

              {/* Calm, Low-Noise Planet Badge */}
              <Html
                position={[0, sphereSize + 0.4, 0]}
                center
                distanceFactor={16}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPlanet(eph);
                  }}
                  className={`px-2.5 py-1 rounded-lg border backdrop-blur-md transition-all cursor-pointer whitespace-nowrap ${
                    isRuling || isSelected
                      ? 'bg-[#12131a]/90 border-[#e5c687]/80 text-zinc-100 shadow-[0_0_14px_rgba(229,198,135,0.35)] scale-105'
                      : 'bg-[#090b12]/72 border-white/[0.08] text-zinc-300 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-zinc-100">
                      {eph.info.english}
                    </span>
                    <span className="hebrew-glyph text-xs text-[#e5c687]">
                      {eph.info.hebrew}
                    </span>
                    {eph.isRetrograde && (
                      <span
                        className="text-xs px-1 rounded bg-rose-500/20 text-rose-200 mono-telemetry"
                        title="Retrograde Motion (Hilukh Achori)"
                      >
                        ℞
                      </span>
                    )}
                  </div>
                  <div className="mono-telemetry text-xs text-zinc-400 leading-tight">
                    {eph.mazal.symbol} {Math.floor(eph.degreeInMazal)}°{' '}
                    {eph.mazal.westernName}
                  </div>
                </button>
              </Html>
            </group>
          </group>
        );
      })}
    </group>
  );
};
