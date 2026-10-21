"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const ResumePlaceholder = ({ label }: { label: string }) => (
  <div className="flex min-h-[420px] w-full max-w-[600px] items-center justify-center rounded-lg border border-default-200/60 bg-slate-950/20 px-6 text-center text-sm text-default-500">
    {label}
  </div>
);

const Resume = dynamic(() => import("./resume"), {
  ssr: false,
  loading: () => <ResumePlaceholder label="Loading résumé…" />,
});

const ResumeViewer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px" },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      {shouldLoad ? <Resume /> : <ResumePlaceholder label="Loading résumé…" />}
      <p className="mt-4 text-center text-sm">
        <a
          className="text-default-500 underline-offset-4 transition-colors hover:text-foreground hover:underline motion-reduce:transition-none"
          href="/resume.pdf"
          rel="noopener noreferrer"
          target="_blank"
        >
          Open résumé in a new tab
        </a>
      </p>
    </div>
  );
};

export default ResumeViewer;
