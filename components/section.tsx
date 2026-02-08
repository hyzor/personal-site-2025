"use client";
import { title } from "@/components/primitives";
import { ScrollIndicator } from "@/components/scrollIndicator";

interface SectionProps {
  id: string;
  title: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  children?: React.ReactNode;
  className?: string;
  showScrollIndicator?: boolean;
}

export function Section({
  id,
  title: sectionTitle,
  headingLevel = 2,
  children,
  className,
  showScrollIndicator = false,
}: SectionProps) {
  const HeadingTag = `h${headingLevel}` as const;

  return (
    <section
      className={`flex flex-col items-center justify-center gap-4 py-20 md:py-20 min-h-screen relative ${className || ""}`}
      id={id}
    >
      <div className="inline-block max-w-7xl text-center px-6 py-8 rounded-2xl bg-slate-950/20 backdrop-blur-sm">
        <HeadingTag className={title()}>{sectionTitle}</HeadingTag>
        {children}
      </div>
      {showScrollIndicator && <ScrollIndicator />}
    </section>
  );
}
