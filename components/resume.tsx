"use client";

import { useState, useEffect } from "react";
import { Page, Document, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

export default function Resume() {
  const [scale, setScale] = useState(1.5);

  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth;

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

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  return (
    <div className={isMobile ? "overflow-x-auto px-5" : ""}>
      <div className={isMobile ? "min-w-fit" : "flex justify-center"}>
        <Document file="/resume.pdf">
          <Page
            pageNumber={1}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="shadow-lg"
          />
        </Document>
      </div>
    </div>
  );
}
