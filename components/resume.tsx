"use client";

import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const RESUME_URL = "/resume.pdf";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

const ResumeLoading = () => (
  <div className="flex min-h-[420px] w-full max-w-[600px] items-center justify-center rounded-lg border border-default-200/60 bg-slate-950/20 px-6 text-center text-sm text-default-500">
    Loading résumé…
  </div>
);

const ResumeError = () => (
  <div className="flex min-h-[420px] w-full max-w-[600px] flex-col items-center justify-center gap-3 rounded-lg border border-default-200/60 bg-slate-950/20 px-6 text-center text-sm text-default-500">
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
  const [scale, setScale] = useState(1.5);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 640,
  );

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const updateScale = () => {
      const width = window.innerWidth;

      setIsMobile(width < 640);

      if (width < 640) {
        setScale((width - 40) / 600);
      } else if (width < 768) {
        setScale(1.0);
      } else if (width < 1024) {
        setScale(1.2);
      } else {
        setScale(1.4);
      }
    };

    const debouncedResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(updateScale, 150);
    };

    updateScale();
    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className={isMobile ? "overflow-x-auto px-5" : ""}>
      <div className={isMobile ? "min-w-fit" : "flex justify-center"}>
        <Document
          error={<ResumeError />}
          file={RESUME_URL}
          loading={<ResumeLoading />}
        >
          <Page
            className="shadow-lg"
            pageNumber={1}
            renderAnnotationLayer={true}
            renderTextLayer={true}
            scale={scale}
          />
        </Document>
      </div>
    </div>
  );
};

export default Resume;
