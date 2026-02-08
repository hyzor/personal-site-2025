"use client";

import { useEffect, useRef, useState } from "react";
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

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const animationRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setShouldAnimate(!mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setShouldAnimate(!e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

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

    // Configuration for web-like network
    const connectionDistance = 180;
    const numNodes = 80;
    const maxConnectionsPerNode = 5;

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

    // Static render function for reduced motion
    const renderStatic = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Build connections based on proximity
      const connections: Connection[] = [];

      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];
        const nearbyNodes: { index: number; distance: number }[] = [];

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

      // Draw connections
      connections.forEach((conn) => {
        const nodeA = nodes[conn.from];
        const nodeB = nodes[conn.to];

        const gradient = ctx.createLinearGradient(
          nodeA.x,
          nodeA.y,
          nodeB.x,
          nodeB.y,
        );
        gradient.addColorStop(0, `rgba(0, 255, 255, ${conn.opacity * 0.5})`);
        gradient.addColorStop(0.5, `rgba(100, 200, 255, ${conn.opacity})`);
        gradient.addColorStop(1, `rgba(0, 255, 255, ${conn.opacity * 0.5})`);

        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(nodeB.x, nodeB.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach((node) => {
        const glowGradient = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          node.radius * 4,
        );
        glowGradient.addColorStop(0, "rgba(0, 255, 255, 0.3)");
        glowGradient.addColorStop(1, "rgba(0, 255, 255, 0)");

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 255, 255, 0.9)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(
          node.x - node.radius * 0.3,
          node.y - node.radius * 0.3,
          node.radius * 0.4,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.fill();
      });
    };

    // If reduced motion is preferred, render static version only
    if (!shouldAnimate) {
      renderStatic();
      return;
    }

    // Mouse interaction disabled

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

      // Draw connections with gradient
      connections.forEach((conn) => {
        const nodeA = nodes[conn.from];
        const nodeB = nodes[conn.to];

        const gradient = ctx.createLinearGradient(
          nodeA.x,
          nodeA.y,
          nodeB.x,
          nodeB.y,
        );
        gradient.addColorStop(0, `rgba(0, 255, 255, ${conn.opacity * 0.5})`);
        gradient.addColorStop(0.5, `rgba(100, 200, 255, ${conn.opacity})`);
        gradient.addColorStop(1, `rgba(0, 255, 255, ${conn.opacity * 0.5})`);

        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(nodeB.x, nodeB.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw nodes with glow
      nodes.forEach((node) => {
        // Outer glow
        const glowGradient = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          node.radius * 4,
        );
        glowGradient.addColorStop(0, "rgba(0, 255, 255, 0.3)");
        glowGradient.addColorStop(1, "rgba(0, 255, 255, 0)");

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 255, 255, 0.9)";
        ctx.fill();

        // Highlight
        ctx.beginPath();
        ctx.arc(
          node.x - node.radius * 0.3,
          node.y - node.radius * 0.3,
          node.radius * 0.4,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.fill();
      });

      // Draw occasional traveling particles on connections
      if (Math.random() < 0.05 && connections.length > 0) {
        const randomConn =
          connections[Math.floor(Math.random() * connections.length)];
        const nodeA = nodes[randomConn.from];
        const nodeB = nodes[randomConn.to];

        const progress = Math.random();
        const x = nodeA.x + (nodeB.x - nodeA.x) * progress;
        const y = nodeA.y + (nodeB.y - nodeA.y) * progress;

        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
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
  }, [shouldAnimate]);

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
        }}
      />
      {/* 3D Sphere Background - rendered on top of particles */}
      <div className="absolute inset-0 pointer-events-none">
        <SphereBackground shouldAnimate={shouldAnimate} />
      </div>
    </div>
  );
}
