"use client";

import { useEffect, useRef, useState } from "react";

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
    if (!shouldAnimate) return;

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

    const maxConnectionDistance = 350;
    const numNodes = 40;
    const maxConnections = 20;

    const nodes: { x: number; y: number; vx: number; vy: number }[] = [];
    const connections: {
      path: number[];
      progress: number;
      speed: number;
      color: string;
    }[] = [];

    // Create nodes
    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }

    // Create multi-node connections
    for (let i = 0; i < maxConnections; i++) {
      const pathLength = Math.floor(Math.random() * 3) + 2;
      const path: number[] = [];
      let currentNode = Math.floor(Math.random() * nodes.length);

      for (let j = 0; j < pathLength; j++) {
        path.push(currentNode);
        let nearestNode = -1;
        let minDistance = Infinity;

        for (let k = 0; k < nodes.length; k++) {
          if (!path.includes(k)) {
            const dx = nodes[k].x - nodes[currentNode].x;
            const dy = nodes[k].y - nodes[currentNode].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance && distance < maxConnectionDistance) {
              minDistance = distance;
              nearestNode = k;
            }
          }
        }

        if (nearestNode === -1) break;
        currentNode = nearestNode;
      }

      if (path.length > 1) {
        connections.push({
          path,
          progress: 0,
          speed: 0.001 + Math.random() * 0.002,
          color: "rgba(100, 200, 255, ",
        });
      }
    }

    // Function to create new connections dynamically
    const createNewConnection = () => {
      const pathLength = Math.floor(Math.random() * 3) + 2;
      const path: number[] = [];
      let currentNode = Math.floor(Math.random() * nodes.length);

      for (let j = 0; j < pathLength; j++) {
        path.push(currentNode);
        let nearestNode = -1;
        let minDistance = Infinity;

        for (let k = 0; k < nodes.length; k++) {
          if (!path.includes(k)) {
            const dx = nodes[k].x - nodes[currentNode].x;
            const dy = nodes[k].y - nodes[currentNode].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance && distance < maxConnectionDistance) {
              minDistance = distance;
              nearestNode = k;
            }
          }
        }

        if (nearestNode === -1) break;
        currentNode = nearestNode;
      }

      if (path.length > 1) {
        connections.push({
          path,
          progress: 0,
          speed: 0.001 + Math.random() * 0.002,
          color: "rgba(100, 200, 255, ",
        });
      }
    };

    const animate = () => {
      if (isPausedRef.current) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      });

      // Remove connections that have nodes too far apart
      for (let i = connections.length - 1; i >= 0; i--) {
        const conn = connections[i];
        let shouldRemove = false;

        for (let j = 0; j < conn.path.length - 1; j++) {
          const nodeA = nodes[conn.path[j]];
          const nodeB = nodes[conn.path[j + 1]];
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > maxConnectionDistance) {
            shouldRemove = true;
            break;
          }
        }

        if (shouldRemove) {
          connections.splice(i, 1);
        }
      }

      // Dynamically create new connections to maintain count
      if (connections.length < maxConnections && Math.random() < 0.02) {
        createNewConnection();
      }

      // Draw multi-node connections
      connections.forEach((conn) => {
        conn.progress += conn.speed;
        if (conn.progress > 1) conn.progress = 0;

        const totalSegments = conn.path.length - 1;
        const currentSegment = Math.floor(conn.progress * totalSegments);
        const segmentProgress = (conn.progress * totalSegments) % 1;

        if (currentSegment < totalSegments) {
          const fromNode = nodes[conn.path[currentSegment]];
          const toNode = nodes[conn.path[currentSegment + 1]];
          const dx = toNode.x - fromNode.x;
          const dy = toNode.y - fromNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = maxConnectionDistance;

          if (distance < maxDistance) {
            const x = fromNode.x + (toNode.x - fromNode.x) * segmentProgress;
            const y = fromNode.y + (toNode.y - fromNode.y) * segmentProgress;

            // Draw traveling particle
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = conn.color + (1 - conn.progress) + ")";
            ctx.fill();
            ctx.shadowColor = conn.color + "1)";
            ctx.shadowBlur = 10;

            // Draw trail behind particle
            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(x, y);
            ctx.strokeStyle = conn.color + 0.3 * (1 - conn.progress) + ")";
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          // Draw faint connection lines between all nodes in path
          for (let i = 0; i < conn.path.length - 1; i++) {
            const nodeA = nodes[conn.path[i]];
            const nodeB = nodes[conn.path[i + 1]];
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDistance) {
              ctx.beginPath();
              ctx.moveTo(nodeA.x, nodeA.y);
              ctx.lineTo(nodeB.x, nodeB.y);
              ctx.strokeStyle = conn.color + "0.1)";
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
      });

      // Draw nodes
      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 255, 255, 0.8)";
        ctx.fill();
        ctx.shadowColor = "cyan";
        ctx.shadowBlur = 10;
      });

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
      {shouldAnimate && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            width: "100vw",
            height: "100vh",
          }}
        />
      )}
    </div>
  );
}
