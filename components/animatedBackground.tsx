"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

import { useReducedMotion } from "./useReducedMotion";

const SphereBackground = dynamic(() => import("./sphereBackground"), {
  ssr: false,
});

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Connection {
  from: number;
  to: number;
  opacity: number;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();
  const [showSphere, setShowSphere] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      setShowSphere(false);
      return;
    }

    if (window.matchMedia("(max-width: 767px)").matches) {
      setShowSphere(false);
      return;
    }

    // Delay the Three.js scene until after hydration to keep the main thread
    // free during the initial render.
    const timeout = window.setTimeout(() => setShowSphere(true), 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateCanvasSize = () => {
      const width = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth,
      );
      const height = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight,
      );

      canvas.width = width;
      canvas.height = height;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
    };

    updateCanvasSize();

    // Configuration for web-like network - reduced for 4K performance
    const connectionDistance = 280;
    const numNodes = 60;
    const maxConnectionsPerNode = 5;

    const nodes: Node[] = [];

    // Create nodes with varied sizes
    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        radius: Math.random() * 2 + 1.5,
      });
    }

    // Track traveling particles on connections
    const connections: Connection[] = [];
    const nearbyNodes: { index: number; distance: number }[] = [];
    let frameCount = 0;

    const animate = () => {
      if (isPausedRef.current) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update nodes
      nodes.forEach((node) => {
        // Apply constant velocity (linear movement)
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Keep within bounds
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));
      });

      // Recalculate connections every 15 frames (nodes move slowly)
      if (++frameCount === 15) {
        frameCount = 0;
        connections.length = 0;

        for (let i = 0; i < nodes.length; i++) {
          const nodeA = nodes[i];
          nearbyNodes.length = 0;

          for (let j = i + 1; j < nodes.length; j++) {
            const nodeB = nodes[j];
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
              nearbyNodes.push({ index: j, distance });
            }
          }

          nearbyNodes.sort((a, b) => a.distance - b.distance);
          const connectionsToMake = Math.min(
            maxConnectionsPerNode,
            nearbyNodes.length,
          );

          for (let k = 0; k < connectionsToMake; k++) {
            const dist = nearbyNodes[k].distance;
            const opacity = 1 - dist / connectionDistance;
            connections.push({
              from: i,
              to: nearbyNodes[k].index,
              opacity: opacity * 0.6,
            });
          }
        }
      }

      // Draw connections - simplified, no gradients
      connections.forEach((conn) => {
        const nodeA = nodes[conn.from];
        const nodeB = nodes[conn.to];

        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(nodeB.x, nodeB.y);
        ctx.strokeStyle = `rgba(0, 200, 255, ${conn.opacity * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw nodes - simplified for performance
      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 255, 255, 0.8)";
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    const syncAnimation = () => {
      const shouldPause = document.hidden || motionQuery.matches;

      isPausedRef.current = shouldPause;

      if (shouldPause) {
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        return;
      }

      if (animationRef.current === null) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    // Start only when the tab is visible and motion is allowed
    syncAnimation();

    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      updateCanvasSize();
      resizeTimeout = setTimeout(() => {
        nodes.forEach((node) => {
          node.x = Math.random() * canvas.width;
          node.y = Math.random() * canvas.height;
        });
      }, 100);
    };

    const handleOrientationChange = () => {
      setTimeout(updateCanvasSize, 100);
    };

    const handleVisualViewportResize = () => {
      updateCanvasSize();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);
    document.addEventListener("visibilitychange", syncAnimation);
    motionQuery.addEventListener("change", syncAnimation);

    if (window.visualViewport) {
      window.visualViewport.addEventListener(
        "resize",
        handleVisualViewportResize,
      );
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);

      document.removeEventListener("visibilitychange", syncAnimation);
      motionQuery.removeEventListener("change", syncAnimation);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          handleVisualViewportResize,
        );
      }
      clearTimeout(resizeTimeout);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-0" style={{ zIndex: 0 }}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #000000 0%, #0a0a1e 50%, #0a0a2e 100%)",
        }}
      />
      {/* 3D Sphere Background - rendered on top */}
      {showSphere && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <SphereBackground />
        </div>
      )}
      {/* Particle network - rendered behind sphere */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          width: "100vw",
          height: "100vh",
          zIndex: 0,
        }}
      />
    </div>
  );
}
