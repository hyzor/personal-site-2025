"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SphereProps {
  shouldAnimate: boolean;
}

function Sphere({ shouldAnimate }: SphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // Create sphere geometry with points at wireframe vertices (triangle intersections)
  const { positions, colors } = useMemo(() => {
    // Sphere parameters matching the wireframe sphere
    const radius = 3;
    const widthSegments = 32;
    const heightSegments = 32;

    // Calculate all unique vertex positions from the sphere geometry
    const vertexSet = new Set<string>();
    const vertices: THREE.Vector3[] = [];

    for (let y = 0; y <= heightSegments; y++) {
      for (let x = 0; x <= widthSegments; x++) {
        const u = x / widthSegments;
        const v = y / heightSegments;

        const theta = u * Math.PI * 2;
        const phi = v * Math.PI;

        const px = -radius * Math.cos(theta) * Math.sin(phi);
        const py = radius * Math.cos(phi);
        const pz = radius * Math.sin(theta) * Math.sin(phi);

        const key = `${px.toFixed(4)},${py.toFixed(4)},${pz.toFixed(4)}`;

        if (!vertexSet.has(key)) {
          vertexSet.add(key);
          vertices.push(new THREE.Vector3(px, py, pz));
        }
      }
    }

    const particleCount = vertices.length;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x00ffff); // Cyan
    const color2 = new THREE.Color(0x0080ff); // Blue
    const color3 = new THREE.Color(0x4d00ff); // Purple

    vertices.forEach((vertex, i) => {
      positions[i * 3] = vertex.x;
      positions[i * 3 + 1] = vertex.y;
      positions[i * 3 + 2] = vertex.z;

      // Gradient colors based on position
      const mixRatio = (vertex.y + radius) / (radius * 2);
      const mixedColor = new THREE.Color();

      if (mixRatio < 0.5) {
        mixedColor.lerpColors(color1, color2, mixRatio * 2);
      } else {
        mixedColor.lerpColors(color2, color3, (mixRatio - 0.5) * 2);
      }

      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    });

    return { positions, colors };
  }, []);

  useFrame((state, delta) => {
    if (!shouldAnimate) return;

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
      meshRef.current.rotation.x += delta * 0.05;
    }

    if (wireframeRef.current) {
      wireframeRef.current.rotation.y += delta * 0.1;
      wireframeRef.current.rotation.x += delta * 0.05;
    }

    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.1;
      pointsRef.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <>
      {/* Solid sphere with depth testing - dark navy blue */}
      <mesh ref={meshRef} renderOrder={1}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial
          color={0x0a1628}
          transparent={false}
          opacity={1}
          depthWrite={true}
          depthTest={true}
        />
      </mesh>

      {/* Wireframe sphere overlay */}
      <mesh ref={wireframeRef} renderOrder={2}>
        <sphereGeometry args={[3.01, 32, 32]} />
        <meshBasicMaterial
          color={0x0080ff}
          transparent
          opacity={0.3}
          wireframe
          depthWrite={false}
          depthTest={true}
        />
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
          size={0.05}
          vertexColors
          transparent
          opacity={1}
          sizeAttenuation
          depthWrite={false}
          depthTest={true}
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
          depth: true,
        }}
      >
        <Sphere shouldAnimate={shouldAnimate} />
      </Canvas>
    </div>
  );
}
