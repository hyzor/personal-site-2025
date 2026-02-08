"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SphereProps {
  shouldAnimate: boolean;
}

function Sphere({ shouldAnimate }: SphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // Create sphere geometry with points on surface
  const { positions, colors } = useMemo(() => {
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x00ffff); // Cyan
    const color2 = new THREE.Color(0x0080ff); // Blue
    const color3 = new THREE.Color(0x4d00ff); // Purple

    for (let i = 0; i < particleCount; i++) {
      // Fibonacci sphere algorithm for even distribution
      const phi = Math.acos(1 - (2 * (i + 0.5)) / particleCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

      const radius = 3;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Gradient colors based on position
      const mixRatio = (y + radius) / (radius * 2);
      const mixedColor = new THREE.Color();

      if (mixRatio < 0.5) {
        mixedColor.lerpColors(color1, color2, mixRatio * 2);
      } else {
        mixedColor.lerpColors(color2, color3, (mixRatio - 0.5) * 2);
      }

      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    return { positions, colors };
  }, []);

  useFrame((state, delta) => {
    if (!shouldAnimate) return;

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
      meshRef.current.rotation.x += delta * 0.05;
    }

    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.1;
      pointsRef.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <>
      {/* Wireframe sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial
          color={0x0080ff}
          transparent
          opacity={0.05}
          wireframe
        />
      </mesh>

      {/* Inner glow sphere */}
      <mesh>
        <sphereGeometry args={[2.9, 32, 32]} />
        <meshBasicMaterial color={0x004080} transparent opacity={0.02} />
      </mesh>

      {/* Particle points on sphere surface */}
      <points ref={pointsRef}>
        <bufferGeometry
          attributes={{
            position: new THREE.BufferAttribute(positions, 3),
            color: new THREE.BufferAttribute(colors, 3),
          }}
        />
        <pointsMaterial
          size={0.03}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {/* Ambient light */}
      <ambientLight intensity={0.5} />

      {/* Point lights for glow effect */}
      <pointLight position={[10, 10, 10]} intensity={0.5} color={0x00ffff} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color={0x4d00ff} />
    </>
  );
}

interface SphereBackgroundProps {
  shouldAnimate: boolean;
}

export default function SphereBackground({
  shouldAnimate,
}: SphereBackgroundProps) {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <Sphere shouldAnimate={shouldAnimate} />
      </Canvas>
    </div>
  );
}
