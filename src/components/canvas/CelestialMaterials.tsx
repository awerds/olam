import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Additive radial glow billboard for stars, Sefirot, and planets
 */
export const GlowHalo: React.FC<{
  color: string;
  size: number;
  opacity?: number;
}> = ({ color, size, opacity = 0.5 }) => {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: opacity },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          float dist = length(vUv - vec2(0.5)) * 2.0;
          float alpha = pow(max(0.0, 1.0 - dist), 2.6) * uOpacity;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }, [color, opacity]);

  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ camera }) => {
    if (meshRef.current) {
      meshRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <mesh ref={meshRef} material={material}>
      <planeGeometry args={[size, size]} />
    </mesh>
  );
};

/**
 * Slow, meditative Ophanim (Wheels within Wheels) Sacred Gimbal Rings
 */
export const OphanimGimbal: React.FC<{
  radius: number;
  color: string;
  speed?: number;
  highlight?: boolean;
}> = ({ radius, color, speed = 0.12, highlight = false }) => {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (outerRef.current) {
      outerRef.current.rotation.x += delta * speed * 0.45;
      outerRef.current.rotation.y += delta * speed * 0.35;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * speed * 0.55;
      innerRef.current.rotation.z += delta * speed * 0.4;
    }
  });

  return (
    <group>
      <mesh ref={outerRef}>
        <torusGeometry args={[radius * 1.36, radius * 0.028, 16, 64]} />
        <meshStandardMaterial
          color={highlight ? '#e5c687' : color}
          emissive={highlight ? '#e5c687' : color}
          emissiveIntensity={highlight ? 0.65 : 0.22}
          metalness={0.85}
          roughness={0.22}
        />
      </mesh>
      <mesh ref={innerRef}>
        <torusGeometry args={[radius * 1.18, radius * 0.02, 16, 64]} />
        <meshStandardMaterial
          color="#cbb282"
          emissive={color}
          emissiveIntensity={highlight ? 0.5 : 0.16}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
};

/**
 * Slow, meditative Solar Plasma Sphere for Chamah (Sun) + Real Dynamic PointLights
 */
export const SolarPlasmaSphere: React.FC<{
  radius: number;
  onClick?: (e: any) => void;
}> = ({ radius, onClick }) => {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const shader = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vPosition;

        float plasma(vec3 p) {
          float v = sin(p.x * 5.0 + uTime * 0.45) * cos(p.y * 5.0 - uTime * 0.35) * sin(p.z * 5.0 + uTime * 0.3);
          v += 0.5 * sin(p.x * 11.0 - uTime * 0.7) * cos(p.z * 11.0 + uTime * 0.55);
          return v * 0.5 + 0.5;
        }

        void main() {
          float n = plasma(normalize(vPosition) * 2.0);
          vec3 deepGold = vec3(0.84, 0.54, 0.18);
          vec3 brightGold = vec3(0.96, 0.84, 0.52);
          vec3 whiteCore = vec3(1.0, 0.98, 0.90);

          vec3 col = mix(deepGold, brightGold, n);
          float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 1.8);
          col = mix(col, whiteCore, (1.0 - fresnel) * 0.42);
          col += vec3(0.95, 0.75, 0.35) * fresnel * 0.55;

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    }),
    []
  );

  useFrame((_, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <group>
      {/* True 3D Solar Point Light illuminating the Moon, Planets & Tree of Life */}
      <pointLight
        color="#fde68a"
        intensity={4.5}
        distance={38}
        decay={1.2}
      />
      <pointLight
        color="#f59e0b"
        intensity={2.0}
        distance={22}
        decay={1.5}
      />
      <mesh onClick={onClick}>
        <sphereGeometry args={[radius, 48, 48]} />
        <shaderMaterial ref={matRef} args={[shader]} />
      </mesh>
      <GlowHalo color="#e5c687" size={radius * 6.5} opacity={0.72} />
      <GlowHalo color="#d97706" size={radius * 10.5} opacity={0.28} />
    </group>
  );
};

/**
 * Planet / Moon Sphere with real-time directional Day/Night hemisphere illumination
 * computed directly from the 3D Sun vector.
 */
export const SolarLitPlanetSphere: React.FC<{
  radius: number;
  baseColor: string;
  planetWorldPos: [number, number, number];
  sunWorldPos: [number, number, number];
  isHighlight?: boolean;
  onClick?: (e: any) => void;
}> = ({
  radius,
  baseColor,
  planetWorldPos,
  sunWorldPos,
  isHighlight = false,
  onClick,
}) => {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const sunDir = useMemo(() => {
    const v = new THREE.Vector3(
      sunWorldPos[0] - planetWorldPos[0],
      sunWorldPos[1] - planetWorldPos[1],
      sunWorldPos[2] - planetWorldPos[2]
    );
    if (v.lengthSq() < 0.0001) return new THREE.Vector3(1, 0, 0);
    return v.normalize();
  }, [planetWorldPos, sunWorldPos]);

  const shader = useMemo(
    () => ({
      uniforms: {
        uBaseColor: { value: new THREE.Color(baseColor) },
        uSunDir: { value: sunDir },
        uHighlight: { value: isHighlight ? 1.0 : 0.0 },
      },
      vertexShader: `
        varying vec3 vWorldNormal;
        varying vec3 vViewNormal;
        void main() {
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          vViewNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uBaseColor;
        uniform vec3 uSunDir;
        uniform float uHighlight;
        varying vec3 vWorldNormal;
        varying vec3 vViewNormal;

        void main() {
          // Cosine of angle toward the 3D Sun
          float ndotl = dot(normalize(vWorldNormal), normalize(uSunDir));
          // Smooth day/night terminator
          float dayFactor = smoothstep(-0.22, 0.45, ndotl);

          vec3 nightColor = uBaseColor * 0.18 + vec3(0.03, 0.04, 0.08);
          vec3 dayColor = uBaseColor * 1.15 + vec3(0.22, 0.18, 0.09) * max(0.0, ndotl);

          vec3 col = mix(nightColor, dayColor, dayFactor);

          // Subtle atmospheric rim glow
          float rim = pow(1.0 - abs(dot(vViewNormal, vec3(0.0, 0.0, 1.0))), 2.2);
          col += (uBaseColor + vec3(0.25, 0.2, 0.1)) * rim * (0.35 + uHighlight * 0.35);

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseColor]
  );

  // Keep uniforms reactive on every frame
  useFrame(() => {
    if (matRef.current) {
      matRef.current.uniforms.uBaseColor.value.set(baseColor);
      matRef.current.uniforms.uSunDir.value.copy(sunDir);
      matRef.current.uniforms.uHighlight.value = isHighlight ? 1.0 : 0.0;
    }
  });

  return (
    <mesh onClick={onClick}>
      <sphereGeometry args={[radius, 40, 40]} />
      <shaderMaterial ref={matRef} args={[shader]} />
    </mesh>
  );
};
