"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

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

interface TravelingParticle {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
    const connectionDistance = 120;
    const numNodes = 30;
    const maxConnectionsPerNode = 3;

    const nodes: Node[] = [];

    // Create nodes with varied sizes
    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1.5,
      });
    }

    // Track traveling particles on connections
    const travelingParticles: TravelingParticle[] = [];

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

      // Build dynamic connections based on proximity
      const connections: Connection[] = [];

      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];
        const nearbyNodes: { index: number; distance: number }[] = [];

        // Find all nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            nearbyNodes.push({ index: j, distance });
          }
        }

        // Sort by distance and take closest ones
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

      // Spawn new traveling particles occasionally - reduced spawn rate
      if (Math.random() < 0.005 && connections.length > 0) {
        const randomConn =
          connections[Math.floor(Math.random() * connections.length)];
        travelingParticles.push({
          fromNode: randomConn.from,
          toNode: randomConn.to,
          progress: 0,
          speed: 0.015 + Math.random() * 0.015, // Slow speed: 1.5% to 3% per frame
        });
      }

      // Update and draw traveling particles
      for (let i = travelingParticles.length - 1; i >= 0; i--) {
        const particle = travelingParticles[i];
        particle.progress += particle.speed;

        // Remove particle if it reached the end
        if (particle.progress >= 1) {
          travelingParticles.splice(i, 1);
          continue;
        }

        // Draw particle at current position
        const nodeA = nodes[particle.fromNode];
        const nodeB = nodes[particle.toNode];
        const x = nodeA.x + (nodeB.x - nodeA.x) * particle.progress;
        const y = nodeA.y + (nodeB.y - nodeA.y) * particle.progress;

        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPausedRef.current = true;
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      } else {
        isPausedRef.current = false;
        if (!animationRef.current) {
          animationRef.current = requestAnimationFrame(animate);
        }
      }
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

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

    const handleScroll = () => {
      updateCanvasSize();
    };

    const handleOrientationChange = () => {
      setTimeout(updateCanvasSize, 100);
    };

    const handleVisualViewportResize = () => {
      updateCanvasSize();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("orientationchange", handleOrientationChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (window.visualViewport) {
      window.visualViewport.addEventListener(
        "resize",
        handleVisualViewportResize,
      );
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("orientationchange", handleOrientationChange);

      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
    <div className="fixed inset-0 z-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #000000 0%, #0a0a1e 50%, #0a0a2e 100%)",
        }}
      />
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
      {/* 3D Sphere Background - rendered on top of particles */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 10 }}
      >
        <SphereBackground />
      </div>
    </div>
  );
}
