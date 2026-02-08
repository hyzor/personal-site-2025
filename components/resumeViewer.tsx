"use client";

import dynamic from "next/dynamic";

const Resume = dynamic(() => import("./resume"), {
  ssr: false,
});

export default function ResumeViewer() {
  return <Resume />;
}
