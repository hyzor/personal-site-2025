"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.3em] text-default-500">
        Error
      </p>
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-default-500" role="alert">
        The page could not be rendered. Try again, or return to the home page.
      </p>
      {error.digest ? (
        <code className="rounded bg-default-100 px-2 py-1 text-xs text-default-600">
          Reference: {error.digest}
        </code>
      ) : null}
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <button
          className="rounded-full bg-primary px-5 py-2 font-medium text-primary-foreground transition-opacity hover:opacity-90"
          onClick={() => reset()}
          type="button"
        >
          Try again
        </button>
        <Link
          className="rounded-full border border-default-300 px-5 py-2 font-medium transition-colors hover:bg-default-100"
          href="/"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
