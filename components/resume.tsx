"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const RESUME_URL = "/resume.pdf";
// US Letter, in PDF points — used until the real page size is known.
const FALLBACK_PAGE_WIDTH = 612;
const MIN_SCALE = 0.4;
const MAX_SCALE = 1.75;
// Render the canvas at a higher resolution than CSS pixels so the text stays
// crisp on low-DPI screens; pdf.js defaults to the device ratio, which leaves
// 1x displays with visibly aliased glyph edges.
const MIN_PIXEL_RATIO = 2;
const MAX_PIXEL_RATIO = 3;

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const readPixelRatio = () =>
  typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;

const ResumeLoading = () => (
  <div
    className="flex min-h-[420px] w-full max-w-[900px] items-center justify-center rounded-lg border border-default-200/60 bg-slate-950/20 px-6 text-center text-sm text-default-500"
    role="status"
  >
    Loading résumé…
  </div>
);

const ResumeError = () => (
  <div className="flex min-h-[420px] w-full max-w-[900px] flex-col items-center justify-center gap-3 rounded-lg border border-default-200/60 bg-slate-950/20 px-6 text-center text-sm text-default-500">
    <p>Unable to display the résumé.</p>
    <a
      className="text-primary underline-offset-4 hover:underline"
      href={RESUME_URL}
      rel="noopener noreferrer"
      target="_blank"
    >
      Open the PDF in a new tab
    </a>
  </div>
);

const Resume = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageWidth, setPageWidth] = useState(FALLBACK_PAGE_WIDTH);
  const [availableWidth, setAvailableWidth] = useState(0);
  const [devicePixelRatio, setDevicePixelRatio] = useState(readPixelRatio);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      const nextWidth = Math.floor(container.clientWidth);

      if (nextWidth > 0) {
        setAvailableWidth((current) =>
          current === nextWidth ? current : nextWidth,
        );
      }
    };

    updateWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);

      return () => window.removeEventListener("resize", updateWidth);
    }

    const observer = new ResizeObserver(updateWidth);

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Catches browser zoom and moving the window between monitors.
    const query = window.matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
    const update = () => setDevicePixelRatio(readPixelRatio());

    query.addEventListener("change", update);
    window.addEventListener("resize", update);

    return () => {
      query.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, [devicePixelRatio]);

  const handleDocumentLoad = useCallback((pdf: PDFDocumentProxy) => {
    pdf
      .getPage(1)
      .then((page) => {
        const { width } = page.getViewport({ scale: 1 });

        if (width > 0) {
          setPageWidth(width);
        }
      })
      .catch(() => {
        // Keep the Letter fallback when the page metadata is unavailable.
      });
  }, []);

  const scale =
    availableWidth > 0
      ? clamp(availableWidth / pageWidth, MIN_SCALE, MAX_SCALE)
      : 0;
  const renderPixelRatio = clamp(
    devicePixelRatio,
    MIN_PIXEL_RATIO,
    MAX_PIXEL_RATIO,
  );

  return (
    <div ref={containerRef} className="flex w-full justify-center">
      <Document
        error={<ResumeError />}
        file={RESUME_URL}
        loading={<ResumeLoading />}
        onLoadSuccess={handleDocumentLoad}
      >
        {scale > 0 && (
          <Page
            className="shadow-lg"
            devicePixelRatio={renderPixelRatio}
            pageNumber={1}
            scale={scale}
          />
        )}
      </Document>
    </div>
  );
};

export default Resume;
