"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SphereProps {
  shouldAnimate: boolean;
}

function Sphere({ shouldAnimate }: SphereProps) {
  const wireframeRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!shouldAnimate) return;

    if (wireframeRef.current) {
      wireframeRef.current.rotation.y += delta * 0.1;
      wireframeRef.current.rotation.x += delta * 0.05;
    }
  });

  // Set initial rotation for static display when reduced motion is preferred
  useEffect(() => {
    if (!shouldAnimate && wireframeRef.current) {
      wireframeRef.current.rotation.y = Math.PI / 4;
      wireframeRef.current.rotation.x = Math.PI / 8;
    }
  }, [shouldAnimate]);

  return (
    <>
      {/* Wireframe sphere only - removed solid mesh and particles for performance */}
      <mesh ref={wireframeRef} renderOrder={1} position={[0, 0.25, 0]}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial
          color={0x0080ff}
          transparent
          opacity={0.3}
          wireframe
          depthWrite={false}
          depthTest={true}
        />
      </mesh>

      {/* Ambient light */}
      <ambientLight intensity={0.5} />

      {/* Single point light for glow effect */}
      <pointLight position={[10, 10, 10]} intensity={0.5} color={0x00ffff} />
    </>
  );
}

interface SphereBackgroundProps {
  shouldAnimate: boolean;
}

export default function SphereBackground({
  shouldAnimate,
}: SphereBackgroundProps) {
  const [dpr, setDpr] = useState(1);

  useEffect(() => {
    const updateDpr = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const pixelCount = width * height;
      const maxPixelCount = 2560 * 1440; // 1440p threshold

      if (pixelCount > maxPixelCount) {
        setDpr(1);
      } else if (pixelCount > 1920 * 1080) {
        setDpr(Math.min(window.devicePixelRatio, 1.5));
      } else {
        setDpr(Math.min(window.devicePixelRatio, 2));
      }
    };

    updateDpr();
    window.addEventListener("resize", updateDpr);
    return () => window.removeEventListener("resize", updateDpr);
  }, []);

  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={dpr}
        frameloop={shouldAnimate ? "always" : "never"}
        gl={{
          antialias: dpr <= 1.5,
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
