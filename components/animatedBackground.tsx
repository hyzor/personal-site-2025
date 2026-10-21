"use client";

import { useEffect, useRef } from "react";

const FRAME_INTERVAL = 1000 / 30;
const FULL_FRAME_MS = 1000 / 60;
const NODE_COUNT = 60;
const CONNECTION_DISTANCE = 280;
const CONNECTION_DISTANCE_SQ = CONNECTION_DISTANCE * CONNECTION_DISTANCE;
const MAX_CONNECTIONS_PER_NODE = 5;
const CONNECTION_REBUILD_FRAMES = 8;
const OPACITY_BUCKETS = 8;
const MAX_CONNECTION_ALPHA = 0.3;
const TAU = Math.PI * 2;

const CONNECTION_COLORS = Array.from(
  { length: OPACITY_BUCKETS },
  (_, index) =>
    `rgba(0, 200, 255, ${(
      ((index + 1) / OPACITY_BUCKETS) *
      MAX_CONNECTION_ALPHA
    ).toFixed(3)})`,
);

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
}

interface NearbyNode {
  index: number;
  distanceSq: number;
}

const byDistance = (a: NearbyNode, b: NearbyNode) =>
  a.distanceSq - b.distanceSq;

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // The canvas is sized by CSS, so use its rendered size for the backing
    // store instead of mixing window and document measurements.
    const initialWidth = canvas.clientWidth || window.innerWidth;
    const initialHeight = canvas.clientHeight || window.innerHeight;

    canvas.width = initialWidth;
    canvas.height = initialHeight;

    const nodes: Node[] = [];

    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        radius: Math.random() * 2 + 1.5,
      });
    }

    // Group connections by opacity so each frame uses a handful of strokes
    // instead of changing strokeStyle for every line.
    const connections: Connection[][] = Array.from(
      { length: OPACITY_BUCKETS },
      () => [],
    );
    const nearbyNodes: NearbyNode[] = [];
    let frameCount = 0;
    let lastFrameTime = 0;
    let resizeRaf: number | null = null;

    const resizeCanvas = () => {
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;

      if (!width || !height) return;
      if (width === canvas.width && height === canvas.height) return;

      // Preserve the relative particle layout when the viewport changes.
      const scaleX = width / canvas.width;
      const scaleY = height / canvas.height;

      for (let i = 0; i < nodes.length; i++) {
        nodes[i].x *= scaleX;
        nodes[i].y *= scaleY;
      }

      canvas.width = width;
      canvas.height = height;

      for (let i = 0; i < connections.length; i++) {
        connections[i].length = 0;
      }

      // Force connection recalculation on the next rendered frame.
      frameCount = CONNECTION_REBUILD_FRAMES;
    };

    const scheduleResize = () => {
      if (resizeRaf !== null) return;

      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = null;
        resizeCanvas();
      });
    };

    const animate = (time: number) => {
      if (isPausedRef.current) return;

      animationRef.current = requestAnimationFrame(animate);

      const elapsed =
        lastFrameTime === 0 ? FRAME_INTERVAL : time - lastFrameTime;

      if (elapsed < FRAME_INTERVAL - 1) return;

      lastFrameTime = time;

      const frameScale = Math.min(elapsed / FULL_FRAME_MS, 2.5);
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        node.x += node.vx * frameScale;
        node.y += node.vy * frameScale;

        if (node.x <= 0) {
          node.x = 0;
          node.vx = Math.abs(node.vx);
        } else if (node.x >= width) {
          node.x = width;
          node.vx = -Math.abs(node.vx);
        }

        if (node.y <= 0) {
          node.y = 0;
          node.vy = Math.abs(node.vy);
        } else if (node.y >= height) {
          node.y = height;
          node.vy = -Math.abs(node.vy);
        }
      }

      if (++frameCount >= CONNECTION_REBUILD_FRAMES) {
        frameCount = 0;

        for (let i = 0; i < connections.length; i++) {
          connections[i].length = 0;
        }

        for (let i = 0; i < nodes.length; i++) {
          const nodeA = nodes[i];
          nearbyNodes.length = 0;

          for (let j = i + 1; j < nodes.length; j++) {
            const nodeB = nodes[j];
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const distanceSq = dx * dx + dy * dy;

            if (distanceSq < CONNECTION_DISTANCE_SQ) {
              nearbyNodes.push({ index: j, distanceSq });
            }
          }

          nearbyNodes.sort(byDistance);

          const connectionsToMake = Math.min(
            MAX_CONNECTIONS_PER_NODE,
            nearbyNodes.length,
          );

          for (let k = 0; k < connectionsToMake; k++) {
            const nearby = nearbyNodes[k];
            const relativeDistance =
              1 - Math.sqrt(nearby.distanceSq) / CONNECTION_DISTANCE;
            const bucket = Math.min(
              OPACITY_BUCKETS - 1,
              Math.floor(relativeDistance * OPACITY_BUCKETS),
            );

            connections[bucket].push({ from: i, to: nearby.index });
          }
        }
      }

      ctx.lineWidth = 1;

      for (
        let bucketIndex = 0;
        bucketIndex < connections.length;
        bucketIndex++
      ) {
        const bucket = connections[bucketIndex];

        if (bucket.length === 0) continue;

        ctx.strokeStyle = CONNECTION_COLORS[bucketIndex];
        ctx.beginPath();

        for (let k = 0; k < bucket.length; k++) {
          const connection = bucket[k];
          const nodeA = nodes[connection.from];
          const nodeB = nodes[connection.to];

          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);
        }

        ctx.stroke();
      }

      // Draw every node as a single path and fill it once.
      ctx.beginPath();

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        ctx.moveTo(node.x + node.radius, node.y);
        ctx.arc(node.x, node.y, node.radius, 0, TAU);
      }

      ctx.fillStyle = "rgba(0, 255, 255, 0.8)";
      ctx.fill();
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
        lastFrameTime = 0;
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    syncAnimation();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(scheduleResize)
        : null;

    resizeObserver?.observe(canvas);
    window.addEventListener("resize", scheduleResize);
    document.addEventListener("visibilitychange", syncAnimation);
    motionQuery.addEventListener("change", syncAnimation);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", scheduleResize);

      document.removeEventListener("visibilitychange", syncAnimation);
      motionQuery.removeEventListener("change", syncAnimation);

      if (resizeRaf !== null) {
        cancelAnimationFrame(resizeRaf);
        resizeRaf = null;
      }

      if (animationRef.current !== null) {
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
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full pointer-events-none"
        style={{ zIndex: 0 }}
      />
    </div>
  );
}
