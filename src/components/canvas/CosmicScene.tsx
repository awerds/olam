import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { TreeOfLife3D } from './TreeOfLife3D';
import { CubeOfSpace3D } from './CubeOfSpace3D';
import { PlanetarySpheres } from './PlanetarySpheres';
import { MazalotRing } from './MazalotRing';
import { TimeHelix3D } from './TimeHelix3D';
import type { CosmicSnapshot, PlanetEphemeris } from '../../engines/astronomy';
import type { HebrewMysticalTime } from '../../engines/hebrewTime';
import type {
  MazalInfo,
  SefirahData,
  SeferYetzirahLetter,
} from '../../data/kabbalah';

export type CameraMode = 'astrolabe' | 'sanctuary' | 'helix' | 'topdown';

interface CosmicSceneProps {
  cosmic: CosmicSnapshot;
  hebrewTime: HebrewMysticalTime;
  cameraMode: CameraMode;
  pathSystem: 'gra' | 'ari';
  showCubeOfSpace: boolean;
  showAspects: boolean;
  showTeli: boolean;
  resolvedTheme: 'light' | 'dark';
  selectedId: string | null;
  onSelectSefirah: (sefirah: SefirahData) => void;
  onSelectLetter: (letter: SeferYetzirahLetter) => void;
  onSelectPlanet: (planet: PlanetEphemeris) => void;
  onSelectMazal: (mazal: MazalInfo) => void;
  onSelectDate: (date: Date) => void;
}

const CameraRig: React.FC<{ mode: CameraMode }> = ({ mode }) => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const targetPos = useRef(new THREE.Vector3(0, 11, 21));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));
  const isTransitioning = useRef(false);

  useEffect(() => {
    isTransitioning.current = true;
    if (mode === 'astrolabe') {
      targetPos.current.set(0, 11.5, 21.5);
      targetLook.current.set(0, 0, 0);
    } else if (mode === 'sanctuary') {
      targetPos.current.set(0, 1.2, 11.2);
      targetLook.current.set(0, 0.3, 0);
    } else if (mode === 'helix') {
      targetPos.current.set(13.5, 6.5, 16.5);
      targetLook.current.set(0, 0, 0);
    } else if (mode === 'topdown') {
      targetPos.current.set(0, 26, 0.01);
      targetLook.current.set(0, 0, 0);
    }
    const timer = setTimeout(() => {
      isTransitioning.current = false;
    }, 1100);
    return () => clearTimeout(timer);
  }, [mode]);

  useFrame((_, delta) => {
    if (isTransitioning.current) {
      camera.position.lerp(targetPos.current, Math.min(1, delta * 2.4));
      if (controlsRef.current) {
        controlsRef.current.target.lerp(
          targetLook.current,
          Math.min(1, delta * 2.4)
        );
        controlsRef.current.update();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.04}
      minDistance={3.5}
      maxDistance={42}
      makeDefault
    />
  );
};

export const CosmicScene: React.FC<CosmicSceneProps> = ({
  cosmic,
  hebrewTime,
  cameraMode,
  pathSystem,
  showCubeOfSpace,
  showAspects,
  showTeli,
  resolvedTheme,
  selectedId,
  onSelectSefirah,
  onSelectLetter,
  onSelectPlanet,
  onSelectMazal,
  onSelectDate,
}) => {
  const rulingHourPlanet = hebrewTime.planetaryHours.current.planet.key;
  const isLight = resolvedTheme === 'light';

  return (
    <div
      className="w-full h-full relative transition-colors duration-500"
      style={{
        background: isLight
          ? 'radial-gradient(circle at 50% 50%, #f7f5f0 0%, #eae5dc 58%, #ddd6c9 100%)'
          : 'radial-gradient(circle at 45% 50%, #101426 0%, #070912 52%, #040509 100%)',
      }}
    >
      <Canvas
        camera={{ position: [0, 11.5, 21.5], fov: 46, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: true }}
      >
        <fog
          attach="fog"
          args={[isLight ? '#e6e1d6' : '#05060b', 32, 78]}
        />

        <ambientLight intensity={isLight ? 0.85 : 0.32} />
        <hemisphereLight
          color={isLight ? '#ffffff' : '#e2e8f0'}
          groundColor={isLight ? '#d6cfc2' : '#090c15'}
          intensity={isLight ? 0.65 : 0.38}
        />

        {/* Deep Starfield + Slow Meditative Sanctuary Dust */}
        {!isLight && (
          <Stars
            radius={62}
            depth={45}
            count={2800}
            factor={3.1}
            saturation={0.15}
            fade
            speed={0.12}
          />
        )}
        <Sparkles
          count={90}
          scale={28}
          size={1.4}
          speed={0.07}
          opacity={isLight ? 0.25 : 0.32}
          color={isLight ? '#9a6b16' : '#e5c687'}
        />
        <Sparkles
          count={60}
          scale={22}
          size={1.1}
          speed={0.05}
          opacity={0.22}
          color="#94a3b8"
        />

        <CameraRig mode={cameraMode} />

        {/* Layer I: Etz Chaim (10 Sefirot & 22 Paths) + Sefer Yetzirah Cube of Space */}
        {cameraMode !== 'helix' && (
          <TreeOfLife3D
            cosmic={cosmic}
            hebrewTime={hebrewTime}
            pathSystem={pathSystem}
            selectedId={selectedId}
            onSelectSefirah={onSelectSefirah}
            onSelectLetter={onSelectLetter}
          />
        )}

        <CubeOfSpace3D
          visible={showCubeOfSpace && cameraMode !== 'helix'}
          activeMonthMazalIndex={hebrewTime.activeMonthMazal.index}
          onSelectLetter={onSelectLetter}
        />

        {/* Layer II: 7 Classical Planetary Spheres (Heikhalot), Teli Nodes & Aspects */}
        {cameraMode !== 'helix' && (
          <PlanetarySpheres
            cosmic={cosmic}
            rulingHourPlanet={rulingHourPlanet}
            selectedId={selectedId}
            showAspects={showAspects}
            showTeli={showTeli}
            onSelectPlanet={onSelectPlanet}
          />
        )}

        {/* Layer III: 12 Mazalot, 12 Hebrew Months & 72 Names of God */}
        <MazalotRing
          activeMonthMazalIndex={hebrewTime.activeMonthMazal.index}
          sunShemNumber={cosmic.planets.Sun.shem72.number}
          moonShemNumber={cosmic.planets.Moon.shem72.number}
          diurnalShemNumber={hebrewTime.diurnalShem72.number}
          selectedId={selectedId}
          onSelectMazal={onSelectMazal}
        />

        {/* 4D Helical Time-Walk Corridor */}
        <TimeHelix3D
          centerDate={cosmic.date}
          visible={cameraMode === 'helix'}
          onSelectDate={onSelectDate}
        />
      </Canvas>
    </div>
  );
};
