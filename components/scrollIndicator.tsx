"use client";
import { useEffect, useState } from "react";

export function ScrollIndicator() {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const fadeDistance = window.innerHeight * 0.3;
      const newOpacity = Math.max(0, 1 - scrollY / fadeDistance);
      setOpacity(newOpacity);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-300"
      style={{ opacity }}
    >
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm tracking-wide font-medium text-default-500 dark:text-default-400 animate-fade-in-out">
          Scroll
        </span>
        <svg
          className="w-6 h-6 text-gray-500 dark:text-gray-400 animate-bounce"
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
