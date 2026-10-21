import type { ReactNode } from "react";
import clsx from "clsx";

import { title } from "@/components/primitives";
import { ScrollIndicator } from "@/components/scrollIndicator";

interface SectionProps {
  id: string;
  title: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  children?: ReactNode;
  className?: string;
  showPanel?: boolean;
  showScrollIndicator?: boolean;
}

export function Section({
  id,
  title: sectionTitle,
  headingLevel = 2,
  children,
  className,
  showPanel = true,
  showScrollIndicator = false,
}: SectionProps) {
  const HeadingTag = `h${headingLevel}` as const;

  return (
    <section
      aria-labelledby={`${id}-heading`}
      className={clsx(
        "flex flex-col items-center justify-center gap-4 py-20 min-h-screen relative",
        className,
      )}
      id={id}
    >
      <div
        className={clsx(
          "w-full max-w-5xl px-6 py-8 text-center",
          showPanel
            ? "rounded-3xl border border-default-200/30 bg-zinc-900/65"
            : "[text-shadow:0_2px_16px_rgba(0,0,0,0.85)]",
        )}
      >
        <HeadingTag className={title()} id={`${id}-heading`}>
          {sectionTitle}
        </HeadingTag>
        {children}
      </div>
      {showScrollIndicator && <ScrollIndicator />}
    </section>
  );
}
