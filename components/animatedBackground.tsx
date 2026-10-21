"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

const FRAME_INTERVAL = 1000 / 30;
const FULL_FRAME_MS = 1000 / 60;
const TAU = Math.PI * 2;

const STAR_DENSITY = 1 / 6000;
const MIN_STARS = 150;
const MAX_STARS = 360;
const STAR_LAYERS = 4;

const CONNECTION_DISTANCE = 170;
const CONNECTION_DISTANCE_SQ = CONNECTION_DISTANCE * CONNECTION_DISTANCE;
const MAX_CONNECTIONS_PER_STAR = 2;
const CONNECTION_REBUILD_FRAMES = 6;
const OPACITY_BUCKETS = 6;
const MAX_CONNECTION_ALPHA = 0.13;

const METEOR_MIN_DELAY = 7000;
const METEOR_MAX_DELAY = 15000;

const STAR_PALETTE = [
  { core: "255, 255, 255", glow: "226, 232, 255" },
  { core: "225, 231, 255", glow: "165, 180, 252" },
  { core: "205, 230, 255", glow: "125, 211, 252" },
  { core: "218, 222, 255", glow: "129, 140, 248" },
];

const CONNECTION_COLORS = Array.from(
  { length: OPACITY_BUCKETS },
  (_, index) =>
    `rgba(165, 180, 252, ${(
      ((index + 1) / OPACITY_BUCKETS) *
      MAX_CONNECTION_ALPHA
    ).toFixed(3)})`,
);

const BASE_GRADIENT =
  "radial-gradient(ellipse 120% 90% at 50% -10%, #130b2a 0%, #0c091f 38%, #060513 70%, #02020a 100%)";

const VIGNETTE_STYLE: CSSProperties = {
  background:
    "radial-gradient(ellipse 85% 75% at 50% 42%, transparent 0%, transparent 55%, rgba(3, 2, 12, 0.45) 85%, rgba(3, 2, 12, 0.8) 100%)",
};

const GRAIN_STYLE: CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
  opacity: 0.05,
  mixBlendMode: "overlay",
};

const GALACTIC_BAND_STYLE: CSSProperties = {
  top: "50%",
  left: "50%",
  width: "150vmax",
  height: "36vmax",
  transform: "translate(-50%, -50%) rotate(-24deg)",
  background:
    "linear-gradient(90deg, transparent 4%, rgba(124, 97, 244, 0.07) 24%, rgba(139, 92, 246, 0.09) 46%, rgba(96, 165, 250, 0.06) 64%, transparent 86%)",
  filter: "blur(48px)",
  opacity: 0.8,
};

const NEBULA_LAYERS: { style: CSSProperties }[] = [
  {
    style: {
      top: "-38%",
      left: "-28%",
      width: "78vmax",
      height: "68vmax",
      background:
        "radial-gradient(ellipse 60% 55% at 42% 44%, rgba(124, 97, 244, 0.26) 0%, rgba(91, 33, 182, 0.14) 34%, rgba(49, 16, 82, 0.06) 58%, transparent 72%), radial-gradient(ellipse 20% 18% at 50% 44%, rgba(167, 139, 250, 0.14) 0%, rgba(96, 165, 250, 0.07) 45%, transparent 72%), radial-gradient(ellipse 45% 42% at 68% 60%, rgba(79, 70, 229, 0.14) 0%, transparent 68%)",
      animationDuration: "46s",
    },
  },
  {
    style: {
      top: "2%",
      right: "-32%",
      width: "68vmax",
      height: "58vmax",
      background:
        "radial-gradient(ellipse 55% 50% at 52% 48%, rgba(139, 92, 246, 0.22) 0%, rgba(99, 102, 241, 0.13) 32%, rgba(49, 46, 129, 0.05) 56%, transparent 72%), radial-gradient(ellipse 18% 16% at 48% 46%, rgba(96, 165, 250, 0.1) 0%, transparent 70%), radial-gradient(ellipse 40% 38% at 38% 62%, rgba(192, 132, 252, 0.06) 0%, transparent 70%)",
      animationDuration: "58s",
      animationDelay: "-14s",
    },
  },
  {
    style: {
      bottom: "-42%",
      left: "-18%",
      width: "82vmax",
      height: "66vmax",
      background:
        "radial-gradient(ellipse 58% 52% at 48% 50%, rgba(79, 70, 229, 0.22) 0%, rgba(59, 130, 246, 0.12) 34%, rgba(30, 27, 75, 0.05) 58%, transparent 72%), radial-gradient(ellipse 22% 18% at 52% 48%, rgba(129, 140, 248, 0.12) 0%, transparent 70%), radial-gradient(ellipse 42% 40% at 30% 40%, rgba(56, 189, 248, 0.08) 0%, transparent 70%)",
      animationDuration: "64s",
      animationDelay: "-26s",
    },
  },
  {
    style: {
      top: "10%",
      right: "2%",
      width: "32vmax",
      height: "28vmax",
      background:
        "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(139, 92, 246, 0.18) 0%, rgba(96, 165, 250, 0.08) 38%, transparent 70%)",
      animationDuration: "52s",
      animationDelay: "-8s",
    },
  },
  {
    style: {
      top: "38%",
      left: "34%",
      width: "42vmax",
      height: "32vmax",
      background:
        "radial-gradient(ellipse at 50% 50%, rgba(124, 97, 244, 0.08) 0%, rgba(49, 46, 129, 0.04) 45%, transparent 72%)",
      animationDuration: "70s",
      animationDelay: "-34s",
    },
  },
  {
    style: {
      bottom: "-18%",
      right: "-16%",
      width: "48vmax",
      height: "40vmax",
      background:
        "radial-gradient(ellipse at 50% 50%, rgba(56, 189, 248, 0.11) 0%, rgba(96, 165, 250, 0.08) 32%, transparent 70%)",
      animationDuration: "62s",
      animationDelay: "-20s",
    },
  },
  {
    style: {
      bottom: "8%",
      left: "4%",
      width: "34vmax",
      height: "26vmax",
      background:
        "radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.07) 0%, transparent 70%)",
      animationDuration: "56s",
      animationDelay: "-40s",
    },
  },
];

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  colorIndex: number;
  glow: boolean;
}

interface Connection {
  from: Star;
  to: Star;
}

interface NearbyStar {
  star: Star;
  distanceSq: number;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

const byDistance = (a: NearbyStar, b: NearbyStar) =>
  a.distanceSq - b.distanceSq;

const pickStarColor = () => {
  const roll = Math.random();

  if (roll < 0.42) return 0;
  if (roll < 0.72) return 1;
  if (roll < 0.88) return 2;

  return 3;
};

const createGlowSprite = (rgb: string) => {
  const size = 64;
  const sprite = document.createElement("canvas");

  sprite.width = size;
  sprite.height = size;

  const spriteContext = sprite.getContext("2d");

  if (!spriteContext) return null;

  const gradient = spriteContext.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );

  gradient.addColorStop(0, `rgba(${rgb}, 0.9)`);
  gradient.addColorStop(0.22, `rgba(${rgb}, 0.34)`);
  gradient.addColorStop(0.55, `rgba(${rgb}, 0.08)`);
  gradient.addColorStop(1, `rgba(${rgb}, 0)`);

  spriteContext.fillStyle = gradient;
  spriteContext.fillRect(0, 0, size, size);

  return sprite;
};

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const glowSprites = STAR_PALETTE.map((color) =>
      createGlowSprite(color.glow),
    );

    const stars: Star[] = [];
    const starsByColor: Star[][] = STAR_PALETTE.map(() => []);
    const anchors: Star[] = [];
    const connections: Connection[][] = Array.from(
      { length: OPACITY_BUCKETS },
      () => [],
    );
    const nearbyStars: NearbyStar[] = [];

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let frameCount = 0;
    let connectionsDirty = true;
    let lastFrameTime = 0;
    let resizeRaf: number | null = null;
    let meteorClock = 0;
    let nextMeteorAt = 5000 + Math.random() * 9000;
    let meteor: Meteor | null = null;

    const placeStar = () => {
      const roll = Math.random();
      const wrap = (value: number, max: number) => ((value % max) + max) % max;

      if (roll < 0.34) {
        // Extra dust along the diagonal galactic band.
        const bandX = Math.random() * width;
        const bandY =
          height * 0.5 -
          (bandX - width * 0.5) * 0.44 +
          (Math.random() - 0.5) * height * 0.18;

        return { x: bandX, y: wrap(bandY, height) };
      }

      if (roll < 0.52) {
        // A looser cluster around the brightest nebula cloud.
        const angle = Math.random() * TAU;
        const distance =
          Math.pow(Math.random(), 1.8) * Math.min(width, height) * 0.3;

        return {
          x: wrap(width * 0.18 + Math.cos(angle) * distance, width),
          y: wrap(height * 0.2 + Math.sin(angle) * distance * 0.8, height),
        };
      }

      return { x: Math.random() * width, y: Math.random() * height };
    };

    const populateStars = () => {
      const densityCount = Math.round(width * height * STAR_DENSITY);
      const count = Math.max(MIN_STARS, Math.min(MAX_STARS, densityCount));

      for (let i = 0; i < count; i++) {
        const layer = Math.floor(Math.random() * STAR_LAYERS);
        const radius = 0.45 + layer * 0.3 + Math.random() * 0.5;
        const angle = Math.random() * TAU;
        const speed = 0.015 + layer * 0.012 + Math.random() * 0.015;
        const colorIndex = pickStarColor();
        const position = placeStar();
        const star: Star = {
          x: position.x,
          y: position.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed * 0.6,
          radius,
          alpha: 0.36 + layer * 0.09 + Math.random() * 0.24,
          twinkleSpeed: 0.35 + Math.random() * 1.1,
          twinklePhase: Math.random() * TAU,
          colorIndex,
          // Only the closest, brightest stars get a soft halo.
          glow: radius > 1.1 || Math.random() < 0.1,
        };

        stars.push(star);
        starsByColor[colorIndex].push(star);

        if (layer >= 2) {
          anchors.push(star);
        }
      }
    };

    const rebuildConnections = () => {
      for (let i = 0; i < connections.length; i++) {
        connections[i].length = 0;
      }

      for (let i = 0; i < anchors.length; i++) {
        const starA = anchors[i];

        nearbyStars.length = 0;

        for (let j = i + 1; j < anchors.length; j++) {
          const starB = anchors[j];
          const dx = starB.x - starA.x;
          const dy = starB.y - starA.y;
          const distanceSq = dx * dx + dy * dy;

          if (distanceSq < CONNECTION_DISTANCE_SQ) {
            nearbyStars.push({ star: starB, distanceSq });
          }
        }

        nearbyStars.sort(byDistance);

        const connectionsToMake = Math.min(
          MAX_CONNECTIONS_PER_STAR,
          nearbyStars.length,
        );

        for (let k = 0; k < connectionsToMake; k++) {
          const nearby = nearbyStars[k];
          const relativeDistance =
            1 - Math.sqrt(nearby.distanceSq) / CONNECTION_DISTANCE;
          const bucket = Math.min(
            OPACITY_BUCKETS - 1,
            Math.floor(relativeDistance * OPACITY_BUCKETS),
          );

          connections[bucket].push({ from: starA, to: nearby.star });
        }
      }
    };

    const spawnMeteor = () => {
      const angle = Math.PI * (0.16 + Math.random() * 0.1);
      const speed = 0.55 + Math.random() * 0.4;

      meteor = {
        x: width * (0.1 + Math.random() * 0.55),
        y: height * (0.05 + Math.random() * 0.35),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 700 + Math.random() * 400,
      };
    };

    const updateMeteor = (delta: number) => {
      meteorClock += delta;

      if (!meteor) {
        if (meteorClock >= nextMeteorAt) {
          spawnMeteor();
        }

        return;
      }

      meteor.life += delta;
      meteor.x += meteor.vx * delta;
      meteor.y += meteor.vy * delta;

      if (meteor.life >= meteor.maxLife) {
        meteor = null;
        nextMeteorAt =
          meteorClock + METEOR_MIN_DELAY + Math.random() * METEOR_MAX_DELAY;
      }
    };

    const drawConnections = () => {
      ctx.lineWidth = 0.7;

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

          ctx.moveTo(connection.from.x, connection.from.y);
          ctx.lineTo(connection.to.x, connection.to.y);
        }

        ctx.stroke();
      }
    };

    const drawMeteor = () => {
      if (!meteor) return;

      const progress = meteor.life / meteor.maxLife;
      const fade = Math.sin(progress * Math.PI);
      const tailX = meteor.x - meteor.vx * 150;
      const tailY = meteor.y - meteor.vy * 150;
      const gradient = ctx.createLinearGradient(
        meteor.x,
        meteor.y,
        tailX,
        tailY,
      );

      gradient.addColorStop(0, `rgba(255, 255, 255, ${0.9 * fade})`);
      gradient.addColorStop(0.2, `rgba(165, 180, 252, ${0.5 * fade})`);
      gradient.addColorStop(1, "rgba(129, 140, 248, 0)");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(meteor.x, meteor.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      const headSprite = glowSprites[0];

      if (headSprite) {
        const size = 22;

        ctx.globalAlpha = 0.7 * fade;
        ctx.drawImage(
          headSprite,
          meteor.x - size / 2,
          meteor.y - size / 2,
          size,
          size,
        );
        ctx.globalAlpha = 1;
      }
    };

    const drawStars = (seconds: number) => {
      // Soft halos first so the crisp cores sit on top of them.
      for (let colorIndex = 0; colorIndex < starsByColor.length; colorIndex++) {
        const sprite = glowSprites[colorIndex];

        if (!sprite) continue;

        const group = starsByColor[colorIndex];

        for (let i = 0; i < group.length; i++) {
          const star = group[i];

          if (!star.glow) continue;

          const twinkle =
            0.72 +
            0.28 * Math.sin(seconds * star.twinkleSpeed + star.twinklePhase);
          const size = star.radius * 10;

          ctx.globalAlpha = star.alpha * twinkle * 0.35;
          ctx.drawImage(
            sprite,
            star.x - size / 2,
            star.y - size / 2,
            size,
            size,
          );
        }
      }

      for (let colorIndex = 0; colorIndex < starsByColor.length; colorIndex++) {
        const group = starsByColor[colorIndex];

        if (group.length === 0) continue;

        ctx.fillStyle = `rgb(${STAR_PALETTE[colorIndex].core})`;

        for (let i = 0; i < group.length; i++) {
          const star = group[i];
          const twinkle =
            0.72 +
            0.28 * Math.sin(seconds * star.twinkleSpeed + star.twinklePhase);

          ctx.globalAlpha = Math.min(1, star.alpha * twinkle);
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, TAU);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
    };

    const drawFrame = (time: number, delta: number) => {
      if (!width || !height) return;

      const motionScale = Math.min(delta / FULL_FRAME_MS, 2.4);
      const seconds = time / 1000;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      if (motionScale > 0) {
        for (let i = 0; i < stars.length; i++) {
          const star = stars[i];

          star.x += star.vx * motionScale;
          star.y += star.vy * motionScale;

          if (star.x < -4) {
            star.x += width + 8;
          } else if (star.x > width + 4) {
            star.x -= width + 8;
          }

          if (star.y < -4) {
            star.y += height + 8;
          } else if (star.y > height + 4) {
            star.y -= height + 8;
          }
        }

        if (++frameCount >= CONNECTION_REBUILD_FRAMES) {
          frameCount = 0;
          connectionsDirty = true;
        }

        updateMeteor(delta);
      }

      if (connectionsDirty) {
        rebuildConnections();
        connectionsDirty = false;
      }

      drawConnections();
      drawMeteor();
      drawStars(seconds);

      ctx.globalCompositeOperation = "source-over";
    };

    const resizeCanvas = () => {
      const nextWidth = canvas.clientWidth || window.innerWidth;
      const nextHeight = canvas.clientHeight || window.innerHeight;

      if (!nextWidth || !nextHeight) return;

      const nextPixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      if (
        nextWidth === width &&
        nextHeight === height &&
        nextPixelRatio === pixelRatio
      ) {
        return;
      }

      const scaleX = width ? nextWidth / width : 1;
      const scaleY = height ? nextHeight / height : 1;

      width = nextWidth;
      height = nextHeight;
      pixelRatio = nextPixelRatio;

      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      if (stars.length === 0) {
        populateStars();
      } else {
        // Preserve the relative star layout when the viewport changes.
        for (let i = 0; i < stars.length; i++) {
          stars[i].x *= scaleX;
          stars[i].y *= scaleY;
        }
      }

      connectionsDirty = true;

      if (isPausedRef.current) {
        drawFrame(performance.now(), 0);
      }
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

      drawFrame(time, elapsed);
    };

    const syncAnimation = () => {
      const shouldPause = document.hidden;

      isPausedRef.current = shouldPause;

      if (shouldPause) {
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }

        // Keep the last frame painted while the tab is in the background.
        drawFrame(performance.now(), 0);

        return;
      }

      if (animationRef.current === null) {
        lastFrameTime = 0;
        // Paint the sky immediately instead of waiting for the first frame.
        drawFrame(performance.now(), 0);
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    resizeCanvas();
    syncAnimation();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(scheduleResize)
        : null;

    resizeObserver?.observe(canvas);
    window.addEventListener("resize", scheduleResize);
    document.addEventListener("visibilitychange", syncAnimation);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", scheduleResize);

      document.removeEventListener("visibilitychange", syncAnimation);

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
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <div className="absolute inset-0" style={{ background: BASE_GRADIENT }} />
      <div className="absolute" style={GALACTIC_BAND_STYLE} />
      <div className="absolute inset-0">
        {NEBULA_LAYERS.map((layer, index) => (
          <div key={index} className="nebula-blob" style={layer.style} />
        ))}
      </div>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0" style={VIGNETTE_STYLE} />
      <div className="absolute inset-0" style={GRAIN_STYLE} />
    </div>
  );
}
