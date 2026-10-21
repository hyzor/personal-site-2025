"use client";
import { useEffect, useRef } from "react";

export function ScrollIndicator() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const fadeDistance = window.innerHeight * 0.3;
      el.style.opacity = String(Math.max(0, 1 - scrollY / fadeDistance));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={ref}
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 motion-reduce:transition-none"
    >
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm tracking-wide font-medium text-default-500 dark:text-default-400 animate-fade-in-out motion-reduce:animate-none">
          Scroll
        </span>
        <svg
          className="w-6 h-6 text-gray-500 dark:text-gray-400 animate-bounce motion-reduce:animate-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </div>
  );
}
